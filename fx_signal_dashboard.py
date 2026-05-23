import warnings
warnings.filterwarnings("ignore")

from dataclasses import dataclass
from typing import Dict, Tuple

import numpy as np
import pandas as pd
import streamlit as st
import yfinance as yf
import plotly.graph_objects as go


# ==================================================
# Universe
# ==================================================

FX_TICKERS = {
    "EURUSD": "EURUSD=X",
    "GBPUSD": "GBPUSD=X",
    "AUDUSD": "AUDUSD=X",
    "NZDUSD": "NZDUSD=X",
    "USDJPY": "USDJPY=X",
    "USDCAD": "USDCAD=X",
    "USDCHF": "USDCHF=X",
    "EURJPY": "EURJPY=X",
    "GBPJPY": "GBPJPY=X",
    "AUDJPY": "AUDJPY=X",
    "CADJPY": "CADJPY=X",
    "EURAUD": "EURAUD=X",
    "EURGBP": "EURGBP=X",
    "AUDNZD": "AUDNZD=X",
    "GBPAUD": "GBPAUD=X",
}


# ==================================================
# Configuration
# ==================================================

@dataclass
class SignalConfig:
    donchian_long: int = 60
    donchian_short: int = 20
    boll_lookback: int = 20
    boll_percentile_window: int = 252
    compression_percentile: float = 20.0
    atr_lookback: int = 14
    max_atr_risk: float = 1.75
    max_hold_days: int = 20
    target_r: float = 3.0


# ==================================================
# Data loader
# ==================================================

@st.cache_data(show_spinner=False)
def load_yahoo_ohlc(ticker: str, period: str = "10y") -> pd.DataFrame:
    """
    Load daily OHLC data from Yahoo Finance.
    This is only for prototyping.
    Later this function can be replaced with AlphaNet or Bloomberg data.
    """
    df = yf.download(
        ticker,
        period=period,
        interval="1d",
        auto_adjust=False,
        progress=False,
        threads=True,
    )

    if df.empty:
        return pd.DataFrame()

    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [c[0] for c in df.columns]

    required = ["Open", "High", "Low", "Close"]
    if not all(c in df.columns for c in required):
        return pd.DataFrame()

    df = df[required].dropna().copy()
    df.index = pd.to_datetime(df.index)
    df = df.sort_index()

    return df


def load_alphanet_ohlc_placeholder(symbol: str) -> pd.DataFrame:
    """
    Placeholder for future AlphaNet integration.

    The final AlphaNet loader should return a pandas DataFrame with:
    - DatetimeIndex
    - Columns: Open, High, Low, Close

    Example expected output:

    Date        Open    High    Low     Close
    2024-01-01  1.10    1.11    1.09    1.105

    Do not use this placeholder yet.
    """
    raise NotImplementedError(
        "AlphaNet loader is a placeholder. For now, use Yahoo Finance loader."
    )


# ==================================================
# Indicator engine
# ==================================================

def rolling_percentile_last_value(x: pd.Series) -> float:
    s = pd.Series(x).dropna()
    if len(s) == 0:
        return np.nan
    return s.rank(pct=True).iloc[-1] * 100


def add_indicators(df: pd.DataFrame, cfg: SignalConfig) -> pd.DataFrame:
    out = df.copy()

    out["ret_1d"] = out["Close"].pct_change()
    out["ret_20d"] = out["Close"].pct_change(20)
    out["ret_60d"] = out["Close"].pct_change(60)

    for n in [20, 50, 100, 200]:
        out[f"ma_{n}"] = out["Close"].rolling(n).mean()
        out[f"ma_{n}_slope"] = out[f"ma_{n}"].diff(5)

    # Shift Donchian levels to avoid look-ahead bias
    out["donchian_high"] = out["High"].rolling(cfg.donchian_long).max().shift(1)
    out["donchian_low"] = out["Low"].rolling(cfg.donchian_long).min().shift(1)
    out["short_high"] = out["High"].rolling(cfg.donchian_short).max().shift(1)
    out["short_low"] = out["Low"].rolling(cfg.donchian_short).min().shift(1)

    # ATR
    prev_close = out["Close"].shift(1)
    tr1 = out["High"] - out["Low"]
    tr2 = (out["High"] - prev_close).abs()
    tr3 = (out["Low"] - prev_close).abs()
    out["true_range"] = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    out["atr"] = out["true_range"].rolling(cfg.atr_lookback).mean()

    # Bollinger Band width
    mid = out["Close"].rolling(cfg.boll_lookback).mean()
    std = out["Close"].rolling(cfg.boll_lookback).std()
    out["boll_upper"] = mid + 2 * std
    out["boll_lower"] = mid - 2 * std
    out["boll_width"] = (out["boll_upper"] - out["boll_lower"]) / mid

    out["boll_width_pctile"] = (
        out["boll_width"]
        .rolling(cfg.boll_percentile_window)
        .apply(rolling_percentile_last_value, raw=False)
    )

    # Use previous day's compression state for breakout trigger
    out["prev_boll_width_pctile"] = out["boll_width_pctile"].shift(1)

    # Rolling Sharpe
    daily_mean = out["ret_1d"].rolling(30).mean()
    daily_vol = out["ret_1d"].rolling(30).std()
    out["rolling_sharpe_30d"] = np.sqrt(252) * daily_mean / daily_vol
    out["sharpe_change"] = out["rolling_sharpe_30d"].diff(10)

    # Simple trend score
    out["trend_score"] = 0
    out.loc[out["Close"] > out["ma_50"], "trend_score"] += 1
    out.loc[out["ma_20"] > out["ma_50"], "trend_score"] += 1
    out.loc[out["ma_50"] > out["ma_100"], "trend_score"] += 1
    out.loc[out["ma_100"] > out["ma_200"], "trend_score"] += 1
    out.loc[out["ma_50_slope"] > 0, "trend_score"] += 1

    out["downtrend_score"] = 0
    out.loc[out["Close"] < out["ma_50"], "downtrend_score"] += 1
    out.loc[out["ma_20"] < out["ma_50"], "downtrend_score"] += 1
    out.loc[out["ma_50"] < out["ma_100"], "downtrend_score"] += 1
    out.loc[out["ma_100"] < out["ma_200"], "downtrend_score"] += 1
    out.loc[out["ma_50_slope"] < 0, "downtrend_score"] += 1

    return out.dropna().copy()


# ==================================================
# Signal engine
# ==================================================

def empty_signal_frame(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out["signal_type"] = None
    out["direction"] = None
    out["entry_trigger"] = np.nan
    out["stop"] = np.nan
    return out


def filter_valid_risk(df: pd.DataFrame, cfg: SignalConfig) -> pd.DataFrame:
    out = df.copy()

    active = out["signal_type"].notna()
    out["risk_abs"] = np.nan
    out.loc[active, "risk_abs"] = (
        out.loc[active, "entry_trigger"] - out.loc[active, "stop"]
    ).abs()

    out["risk_atr"] = out["risk_abs"] / out["atr"]
    out["risk_pct"] = out["risk_abs"] / out["entry_trigger"]

    valid = (
        active
        & (out["risk_abs"] > 0)
        & out["risk_abs"].notna()
        & out["risk_atr"].notna()
        & (out["risk_atr"] <= cfg.max_atr_risk)
    )

    cols = [
        "Open", "High", "Low", "Close",
        "signal_type", "direction", "entry_trigger", "stop",
        "risk_abs", "risk_atr", "risk_pct",
        "atr", "trend_score", "downtrend_score",
        "boll_width_pctile", "prev_boll_width_pctile",
        "rolling_sharpe_30d", "sharpe_change",
        "donchian_high", "donchian_low", "short_high", "short_low",
        "ma_20", "ma_50", "ma_100", "ma_200",
    ]

    return out.loc[valid, cols].copy()


def generate_vol_compression_breakout(df: pd.DataFrame, cfg: SignalConfig) -> pd.DataFrame:
    out = empty_signal_frame(df)

    compression = out["prev_boll_width_pctile"] <= cfg.compression_percentile

    long_signal = compression & (out["Close"] > out["donchian_high"])
    short_signal = compression & (out["Close"] < out["donchian_low"])

    out.loc[long_signal, "signal_type"] = "Vol Compression Breakout"
    out.loc[long_signal, "direction"] = "Long"
    out.loc[long_signal, "entry_trigger"] = out.loc[long_signal, "Close"]
    out.loc[long_signal, "stop"] = out.loc[long_signal, "short_low"]

    out.loc[short_signal, "signal_type"] = "Vol Compression Breakout"
    out.loc[short_signal, "direction"] = "Short"
    out.loc[short_signal, "entry_trigger"] = out.loc[short_signal, "Close"]
    out.loc[short_signal, "stop"] = out.loc[short_signal, "short_high"]

    return filter_valid_risk(out, cfg)


def generate_failed_breakout_reversal(
    df: pd.DataFrame,
    cfg: SignalConfig,
    failure_window: int = 3,
) -> pd.DataFrame:
    rows = []

    for i in range(cfg.donchian_long + 5, len(df) - failure_window - 1):
        today = df.iloc[i]

        broke_high = today["High"] > today["donchian_high"]
        broke_low = today["Low"] < today["donchian_low"]

        if broke_high:
            prior_range_high = today["donchian_high"]
            breakout_extreme = today["High"]

            for j in range(1, failure_window + 1):
                future = df.iloc[i + j]

                if future["Close"] < prior_range_high:
                    rows.append({
                        "date": df.index[i + j],
                        "signal_type": "Failed Breakout Reversal",
                        "direction": "Short",
                        "entry_trigger": future["Close"],
                        "stop": breakout_extreme,
                    })
                    break

        if broke_low:
            prior_range_low = today["donchian_low"]
            breakout_extreme = today["Low"]

            for j in range(1, failure_window + 1):
                future = df.iloc[i + j]

                if future["Close"] > prior_range_low:
                    rows.append({
                        "date": df.index[i + j],
                        "signal_type": "Failed Breakout Reversal",
                        "direction": "Long",
                        "entry_trigger": future["Close"],
                        "stop": breakout_extreme,
                    })
                    break

    if not rows:
        return pd.DataFrame()

    sig = pd.DataFrame(rows).set_index("date")
    out = df.join(sig[["signal_type", "direction", "entry_trigger", "stop"]], how="left")

    return filter_valid_risk(out, cfg)


def generate_trend_pullback_continuation(df: pd.DataFrame, cfg: SignalConfig) -> pd.DataFrame:
    out = empty_signal_frame(df)

    recent_high_5 = out["High"].rolling(5).max().shift(1)
    recent_low_5 = out["Low"].rolling(5).min().shift(1)
    pullback_low_5 = out["Low"].rolling(5).min().shift(1)
    pullback_high_5 = out["High"].rolling(5).max().shift(1)

    bullish_trend = out["trend_score"] >= 4
    bearish_trend = out["downtrend_score"] >= 4

    pullback_long = bullish_trend & (out["Low"] <= out["ma_20"]) & (out["Close"] > out["ma_20"])
    trigger_long = pullback_long & (out["Close"] > recent_high_5)

    pullback_short = bearish_trend & (out["High"] >= out["ma_20"]) & (out["Close"] < out["ma_20"])
    trigger_short = pullback_short & (out["Close"] < recent_low_5)

    out.loc[trigger_long, "signal_type"] = "Trend Pullback Continuation"
    out.loc[trigger_long, "direction"] = "Long"
    out.loc[trigger_long, "entry_trigger"] = out.loc[trigger_long, "Close"]
    out.loc[trigger_long, "stop"] = pullback_low_5.loc[trigger_long]

    out.loc[trigger_short, "signal_type"] = "Trend Pullback Continuation"
    out.loc[trigger_short, "direction"] = "Short"
    out.loc[trigger_short, "entry_trigger"] = out.loc[trigger_short, "Close"]
    out.loc[trigger_short, "stop"] = pullback_high_5.loc[trigger_short]

    return filter_valid_risk(out, cfg)


def generate_all_signals(df: pd.DataFrame, cfg: SignalConfig) -> pd.DataFrame:
    signal_frames = []

    for generator in [
        generate_vol_compression_breakout,
        generate_failed_breakout_reversal,
        generate_trend_pullback_continuation,
    ]:
        try:
            s = generator(df, cfg)
            if not s.empty:
                signal_frames.append(s)
        except Exception as e:
            print(f"Signal generator failed: {generator.__name__}: {e}")

    if not signal_frames:
        return pd.DataFrame()

    all_sigs = pd.concat(signal_frames).sort_index()
    all_sigs = all_sigs[~all_sigs.index.duplicated(keep="last")]
    return all_sigs


# ==================================================
# Backtest engine
# ==================================================

def backtest_signals(
    df: pd.DataFrame,
    signals: pd.DataFrame,
    cfg: SignalConfig,
    target_r: float = 3.0,
) -> pd.DataFrame:
    results = []

    if signals.empty:
        return pd.DataFrame()

    for signal_date, sig in signals.iterrows():
        if signal_date not in df.index:
            continue

        signal_idx = df.index.get_loc(signal_date)
        entry_idx = signal_idx + 1

        if entry_idx >= len(df):
            continue

        direction = sig["direction"]
        stop = sig["stop"]
        entry_date = df.index[entry_idx]
        entry = df.iloc[entry_idx]["Open"]

        risk = abs(entry - stop)

        if risk <= 0 or np.isnan(risk):
            continue

        if direction == "Long":
            target = entry + target_r * risk
        else:
            target = entry - target_r * risk

        max_end_idx = min(entry_idx + cfg.max_hold_days, len(df) - 1)
        path = df.iloc[entry_idx:max_end_idx + 1]

        exit_date = path.index[-1]
        exit_price = path.iloc[-1]["Close"]
        outcome_r = np.nan
        exit_reason = "Time Exit"

        mfe = 0.0
        mae = 0.0

        for dt, bar in path.iterrows():
            high = bar["High"]
            low = bar["Low"]

            if direction == "Long":
                favourable = (high - entry) / risk
                adverse = (entry - low) / risk

                mfe = max(mfe, favourable)
                mae = max(mae, adverse)

                stop_hit = low <= stop
                target_hit = high >= target

                # Conservative assumption:
                # if both stop and target are hit on the same daily bar, assume stop first.
                if stop_hit:
                    exit_date = dt
                    exit_price = stop
                    outcome_r = -1.0
                    exit_reason = "Stop"
                    break

                if target_hit:
                    exit_date = dt
                    exit_price = target
                    outcome_r = target_r
                    exit_reason = f"{target_r:.1f}R Target"
                    break

            else:
                favourable = (entry - low) / risk
                adverse = (high - entry) / risk

                mfe = max(mfe, favourable)
                mae = max(mae, adverse)

                stop_hit = high >= stop
                target_hit = low <= target

                if stop_hit:
                    exit_date = dt
                    exit_price = stop
                    outcome_r = -1.0
                    exit_reason = "Stop"
                    break

                if target_hit:
                    exit_date = dt
                    exit_price = target
                    outcome_r = target_r
                    exit_reason = f"{target_r:.1f}R Target"
                    break

        if np.isnan(outcome_r):
            if direction == "Long":
                outcome_r = (exit_price - entry) / risk
            else:
                outcome_r = (entry - exit_price) / risk

        results.append({
            "signal_date": signal_date,
            "entry_date": entry_date,
            "exit_date": exit_date,
            "signal_type": sig["signal_type"],
            "direction": direction,
            "entry": entry,
            "stop": stop,
            "target": target,
            "risk_abs": risk,
            "risk_pct": risk / entry,
            "risk_atr": sig.get("risk_atr", np.nan),
            "outcome_r": outcome_r,
            "exit_reason": exit_reason,
            "mfe_r": mfe,
            "mae_r": mae,
            "holding_days": len(path.loc[:exit_date]),
        })

    return pd.DataFrame(results)


def summarize_backtest(bt: pd.DataFrame) -> Dict[str, float]:
    if bt.empty:
        return {}

    wins = bt[bt["outcome_r"] > 0]
    losses = bt[bt["outcome_r"] <= 0]

    return {
        "signals": len(bt),
        "avg_R": bt["outcome_r"].mean(),
        "median_R": bt["outcome_r"].median(),
        "hit_rate": (bt["outcome_r"] > 0).mean(),
        "avg_win_R": wins["outcome_r"].mean() if not wins.empty else np.nan,
        "avg_loss_R": losses["outcome_r"].mean() if not losses.empty else np.nan,
        "two_R_mfe_hit_rate": (bt["mfe_r"] >= 2).mean(),
        "three_R_mfe_hit_rate": (bt["mfe_r"] >= 3).mean(),
        "five_R_mfe_hit_rate": (bt["mfe_r"] >= 5).mean(),
        "avg_MFE_R": bt["mfe_r"].mean(),
        "avg_MAE_R": bt["mae_r"].mean(),
        "avg_holding_days": bt["holding_days"].mean(),
    }


# ==================================================
# Live signal scan
# ==================================================

def get_latest_signal_table(
    symbol_to_ticker: Dict[str, str],
    period: str,
    cfg: SignalConfig,
) -> Tuple[pd.DataFrame, Dict[str, pd.DataFrame], Dict[str, pd.DataFrame]]:

    rows = []
    data_store = {}
    signal_store = {}

    for symbol, ticker in symbol_to_ticker.items():
        raw = load_yahoo_ohlc(ticker, period)

        if raw.empty or len(raw) < 350:
            continue

        df = add_indicators(raw, cfg)
        data_store[symbol] = df

        all_sigs = generate_all_signals(df, cfg)
        signal_store[symbol] = all_sigs

        if all_sigs.empty:
            continue

        # show signals from the last 5 trading days
        recent_cutoff = df.index[-5]
        recent_sigs = all_sigs[all_sigs.index >= recent_cutoff]

        if recent_sigs.empty:
            continue

        latest_sig = recent_sigs.iloc[-1]

        direction = latest_sig["direction"]
        entry = latest_sig["entry_trigger"]
        stop = latest_sig["stop"]
        risk = abs(entry - stop)

        if risk <= 0 or pd.isna(risk):
            continue

        if direction == "Long":
            target_2r = entry + 2 * risk
            target_3r = entry + 3 * risk
            target_5r = entry + 5 * risk
        else:
            target_2r = entry - 2 * risk
            target_3r = entry - 3 * risk
            target_5r = entry - 5 * risk

        same_type_sigs = all_sigs[all_sigs["signal_type"] == latest_sig["signal_type"]]
        bt = backtest_signals(df, same_type_sigs, cfg, target_r=cfg.target_r)
        stats = summarize_backtest(bt)

        rows.append({
            "Symbol": symbol,
            "Yahoo": ticker,
            "Signal Date": latest_sig.name.date(),
            "Signal": latest_sig["signal_type"],
            "Direction": direction,
            "Entry Trigger": entry,
            "Stop": stop,
            "Risk %": latest_sig["risk_pct"],
            "Risk / ATR": latest_sig["risk_atr"],
            "2R Target": target_2r,
            "3R Target": target_3r,
            "5R Target": target_5r,
            "Historical EV R": stats.get("avg_R", np.nan),
            "Hit Rate": stats.get("hit_rate", np.nan),
            "3R MFE Hit Rate": stats.get("three_R_mfe_hit_rate", np.nan),
            "Sample Size": stats.get("signals", 0),
        })

    live = pd.DataFrame(rows)

    if not live.empty:
        live = live.sort_values(
            by=["Historical EV R", "3R MFE Hit Rate", "Risk / ATR"],
            ascending=[False, False, True],
        )

    return live, data_store, signal_store


# ==================================================
# Charting
# ==================================================

def plot_symbol_chart(df: pd.DataFrame, symbol: str) -> go.Figure:
    tail = df.tail(300)

    fig = go.Figure()

    fig.add_trace(go.Candlestick(
        x=tail.index,
        open=tail["Open"],
        high=tail["High"],
        low=tail["Low"],
        close=tail["Close"],
        name=symbol,
    ))

    for col in ["ma_20", "ma_50", "ma_100", "ma_200"]:
        if col in tail.columns:
            fig.add_trace(go.Scatter(
                x=tail.index,
                y=tail[col],
                mode="lines",
                name=col,
            ))

    fig.add_trace(go.Scatter(
        x=tail.index,
        y=tail["donchian_high"],
        mode="lines",
        name="Donchian High",
        line=dict(dash="dot"),
    ))

    fig.add_trace(go.Scatter(
        x=tail.index,
        y=tail["donchian_low"],
        mode="lines",
        name="Donchian Low",
        line=dict(dash="dot"),
    ))

    fig.update_layout(
        title=f"{symbol}: Price, Moving Averages and Donchian Channel",
        xaxis_title="Date",
        yaxis_title="Price",
        height=650,
        xaxis_rangeslider_visible=False,
    )

    return fig


def format_live_table(df: pd.DataFrame) -> pd.DataFrame:
    display = df.copy()

    for c in ["Risk %", "Hit Rate", "3R MFE Hit Rate"]:
        if c in display:
            display[c] = display[c].map(lambda x: f"{x:.1%}" if pd.notna(x) else "")

    for c in [
        "Entry Trigger", "Stop", "Risk / ATR",
        "2R Target", "3R Target", "5R Target",
        "Historical EV R",
    ]:
        if c in display:
            display[c] = display[c].map(lambda x: f"{x:.4f}" if pd.notna(x) else "")

    return display


# ==================================================
# Streamlit app
# ==================================================

def main():
    st.set_page_config(
        page_title="FX Asymmetric Signal Dashboard",
        layout="wide",
    )

    st.title("FX Asymmetric Signal Dashboard")
    st.caption(
        "Prototype using Yahoo Finance daily OHLC data. "
        "Signals are evaluated using conservative R-multiple barrier backtests."
    )

    with st.sidebar:
        st.header("Parameters")

        period = st.selectbox(
            "History",
            options=["2y", "5y", "10y", "15y", "20y", "max"],
            index=2,
        )

        selected_symbols = st.multiselect(
            "FX Universe",
            options=list(FX_TICKERS.keys()),
            default=list(FX_TICKERS.keys()),
        )

        cfg = SignalConfig(
            donchian_long=st.slider("Long Donchian Lookback", 20, 120, 60, 5),
            donchian_short=st.slider("Short Donchian Stop Lookback", 5, 60, 20, 5),
            boll_lookback=st.slider("Bollinger Lookback", 10, 60, 20, 5),
            boll_percentile_window=st.slider("Bollinger Percentile Window", 126, 756, 252, 21),
            compression_percentile=st.slider("Compression Percentile Threshold", 5.0, 40.0, 20.0, 5.0),
            atr_lookback=st.slider("ATR Lookback", 5, 40, 14, 1),
            max_atr_risk=st.slider("Max Risk / ATR", 0.5, 4.0, 1.75, 0.25),
            max_hold_days=st.slider("Max Holding Days", 5, 60, 20, 5),
            target_r=st.selectbox("Backtest Target R", [1.0, 2.0, 3.0, 5.0], index=2),
        )

    universe = {s: FX_TICKERS[s] for s in selected_symbols}

    if st.button("Run Signal Scan", type="primary"):
        with st.spinner("Downloading Yahoo Finance data and running signal scan..."):
            live, data_store, signal_store = get_latest_signal_table(universe, period, cfg)

        st.session_state["live"] = live
        st.session_state["data_store"] = data_store
        st.session_state["signal_store"] = signal_store
        st.session_state["cfg"] = cfg

    if "live" not in st.session_state:
        st.info("Select parameters and click Run Signal Scan.")
        return

    live = st.session_state["live"]
    data_store = st.session_state["data_store"]
    signal_store = st.session_state["signal_store"]
    cfg = st.session_state["cfg"]

    st.header("1. Live Signal Blotter")

    if live.empty:
        st.warning("No live signals found in the most recent 5 trading days.")
    else:
        st.dataframe(format_live_table(live), use_container_width=True)

    st.header("2. Backtest Diagnostics")

    available = list(data_store.keys())

    if not available:
        st.info("No data loaded.")
        return

    selected = st.selectbox("Select Symbol", available)

    df = data_store[selected]
    sigs = signal_store.get(selected, pd.DataFrame())

    if sigs.empty:
        st.warning("No historical signals for selected symbol.")
    else:
        signal_types = sorted(sigs["signal_type"].dropna().unique())
        selected_signal_type = st.selectbox("Signal Type", signal_types)

        filtered_sigs = sigs[sigs["signal_type"] == selected_signal_type]
        bt = backtest_signals(df, filtered_sigs, cfg, target_r=cfg.target_r)
        stats = summarize_backtest(bt)

        if not stats:
            st.warning("No valid backtest results.")
        else:
            col1, col2, col3, col4 = st.columns(4)

            col1.metric("Sample Size", f"{stats['signals']:.0f}")
            col1.metric("Average R", f"{stats['avg_R']:.2f}")
            col1.metric("Median R", f"{stats['median_R']:.2f}")

            col2.metric("Hit Rate", f"{stats['hit_rate']:.1%}")
            col2.metric("Average Win R", f"{stats['avg_win_R']:.2f}")
            col2.metric("Average Loss R", f"{stats['avg_loss_R']:.2f}")

            col3.metric("2R MFE Hit Rate", f"{stats['two_R_mfe_hit_rate']:.1%}")
            col3.metric("3R MFE Hit Rate", f"{stats['three_R_mfe_hit_rate']:.1%}")
            col3.metric("5R MFE Hit Rate", f"{stats['five_R_mfe_hit_rate']:.1%}")

            col4.metric("Average MFE R", f"{stats['avg_MFE_R']:.2f}")
            col4.metric("Average MAE R", f"{stats['avg_MAE_R']:.2f}")
            col4.metric("Avg Holding Days", f"{stats['avg_holding_days']:.1f}")

            st.subheader("Historical Trades")
            st.dataframe(bt.sort_values("entry_date", ascending=False), use_container_width=True)

    st.header("3. Chart")

    fig = plot_symbol_chart(df, selected)
    st.plotly_chart(fig, use_container_width=True)

    st.header("4. How to Interpret This")

    st.markdown(
        """
        This dashboard is designed around asymmetric trade selection.

        The key question is not whether the hit rate is high.

        The key question is:

        Can I define a tight stop, and has this type of setup historically produced enough upside in R-multiple terms?

        Useful signals usually have:
        - Positive average R
        - Acceptable sample size
        - Good 2R or 3R MFE hit rate
        - Tight risk relative to ATR
        - A clear stop level

        Be careful with:
        - Very small sample sizes
        - Beautiful backtests from only one or two big historical trades
        - Signals where Risk / ATR is too high
        - Signals that only work with one precise parameter setting

        Yahoo Finance data is only for prototyping.
        For real trading research, replace the data loader with AlphaNet or Bloomberg clean OHLC data.
        """
    )


if __name__ == "__main__":
    main()
