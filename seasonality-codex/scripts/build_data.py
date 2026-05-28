from __future__ import annotations

import json
import math
from datetime import date, datetime, timedelta
from pathlib import Path

import pandas as pd
import yfinance as yf


YEARS = 5
SPX_TICKER = "^GSPC"
PAIRS = [
    {
        "symbol": "EURUSD",
        "ticker": "EURUSD=X",
        "base": "EUR",
        "quote": "USD",
        "usdSign": -1,
        "pipFactor": 10000,
    },
    {
        "symbol": "GBPUSD",
        "ticker": "GBPUSD=X",
        "base": "GBP",
        "quote": "USD",
        "usdSign": -1,
        "pipFactor": 10000,
    },
    {
        "symbol": "AUDUSD",
        "ticker": "AUDUSD=X",
        "base": "AUD",
        "quote": "USD",
        "usdSign": -1,
        "pipFactor": 10000,
    },
    {
        "symbol": "NZDUSD",
        "ticker": "NZDUSD=X",
        "base": "NZD",
        "quote": "USD",
        "usdSign": -1,
        "pipFactor": 10000,
    },
    {
        "symbol": "USDJPY",
        "ticker": "USDJPY=X",
        "base": "USD",
        "quote": "JPY",
        "usdSign": 1,
        "pipFactor": 100,
    },
    {
        "symbol": "USDCAD",
        "ticker": "USDCAD=X",
        "base": "USD",
        "quote": "CAD",
        "usdSign": 1,
        "pipFactor": 10000,
    },
    {
        "symbol": "USDCHF",
        "ticker": "USDCHF=X",
        "base": "USD",
        "quote": "CHF",
        "usdSign": 1,
        "pipFactor": 10000,
    },
]

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "seasonality.json"


def download_close(ticker: str, start: str, end: str) -> pd.Series:
    frame = yf.download(
        ticker,
        start=start,
        end=end,
        interval="1d",
        auto_adjust=False,
        progress=False,
        threads=False,
    )
    if frame.empty:
        raise RuntimeError(f"No Yahoo Finance data returned for {ticker}")

    if isinstance(frame.columns, pd.MultiIndex):
        if ("Close", ticker) in frame.columns:
            close = frame[("Close", ticker)]
        elif (ticker, "Close") in frame.columns:
            close = frame[(ticker, "Close")]
        else:
            close_frame = frame.xs("Close", axis=1, level=0, drop_level=False)
            close = close_frame.iloc[:, 0]
    else:
        close = frame["Close"]

    close = pd.to_numeric(close, errors="coerce").dropna()
    close.index = pd.to_datetime(close.index).tz_localize(None).normalize()
    close = close[~close.index.duplicated(keep="last")].sort_index()
    if close.empty:
        raise RuntimeError(f"No close values returned for {ticker}")
    return close


def month_end_dates(close: pd.Series) -> pd.Series:
    periods = close.index.to_period("M")
    return close.groupby(periods).apply(lambda values: values.index.max())


def previous_value(series: pd.Series, when: pd.Timestamp) -> tuple[pd.Timestamp, float] | None:
    earlier = series.loc[series.index < when]
    if earlier.empty:
        return None
    return earlier.index[-1], float(earlier.iloc[-1])


def value_on_or_before(series: pd.Series, when: pd.Timestamp) -> tuple[pd.Timestamp, float] | None:
    eligible = series.loc[series.index <= when]
    if eligible.empty:
        return None
    return eligible.index[-1], float(eligible.iloc[-1])


def pct_change(current: float, previous: float) -> float | None:
    if previous == 0 or math.isnan(current) or math.isnan(previous):
        return None
    return (current / previous - 1.0) * 100.0


def round_or_none(value: float | None, digits: int = 6) -> float | None:
    if value is None or math.isnan(value):
        return None
    return round(float(value), digits)


def last_weekday_of_month(day: date) -> date:
    next_month = (pd.Timestamp(day).replace(day=1) + pd.DateOffset(months=1)).date()
    last_day = next_month - timedelta(days=1)
    while last_day.weekday() >= 5:
        last_day -= timedelta(days=1)
    return last_day


def pearson(xs: list[float], ys: list[float]) -> float | None:
    pairs = [(x, y) for x, y in zip(xs, ys) if x is not None and y is not None]
    if len(pairs) < 3:
        return None
    sx = pd.Series([x for x, _ in pairs], dtype="float64")
    sy = pd.Series([y for _, y in pairs], dtype="float64")
    value = sx.corr(sy)
    return None if pd.isna(value) else float(value)


def build_rows(series_map: dict[str, pd.Series], today: date) -> tuple[list[dict], dict | None]:
    spx = series_map[SPX_TICKER]
    spx_month_ends = month_end_dates(spx)
    current_period = pd.Period(today, freq="M")
    rows = []
    preview = None

    for period, month_end in spx_month_ends.items():
        spx_close = float(spx.loc[month_end])
        prev_spx = previous_value(spx, month_end)
        prior_month_ends = spx_month_ends.loc[spx_month_ends.index < period]
        if prior_month_ends.empty or prev_spx is None:
            continue

        prev_month_end = prior_month_ends.iloc[-1]
        prev_month_close = float(spx.loc[prev_month_end])
        spx_monthly = pct_change(spx_close, prev_month_close)
        spx_last_day = pct_change(spx_close, prev_spx[1])

        fx_payload = {}
        for pair in PAIRS:
            fx = series_map[pair["ticker"]]
            fx_current = value_on_or_before(fx, month_end)
            if fx_current is None:
                continue
            fx_previous = previous_value(fx, fx_current[0])
            if fx_previous is None:
                continue
            raw_return = pct_change(fx_current[1], fx_previous[1])
            pip_move = (fx_current[1] - fx_previous[1]) * pair["pipFactor"]
            fx_payload[pair["symbol"]] = {
                "date": fx_current[0].date().isoformat(),
                "close": round_or_none(fx_current[1], 6),
                "prevClose": round_or_none(fx_previous[1], 6),
                "returnPct": round_or_none(raw_return, 6),
                "usdReturnPct": round_or_none(raw_return * pair["usdSign"], 6)
                if raw_return is not None
                else None,
                "pips": round_or_none(pip_move, 1),
            }

        row = {
            "month": str(period),
            "monthEnd": month_end.date().isoformat(),
            "spxClose": round_or_none(spx_close, 4),
            "spxMonthlyReturnPct": round_or_none(spx_monthly, 6),
            "spxLastDayReturnPct": round_or_none(spx_last_day, 6),
            "fx": fx_payload,
        }

        if period < current_period:
            rows.append(row)
        elif period == current_period:
            preview = row

    rows = rows[-(YEARS * 12) :]
    return rows, preview


def build_summary(rows: list[dict]) -> dict:
    full = {}
    by_year = {}
    for pair in PAIRS:
        symbol = pair["symbol"]
        full[symbol] = {
            "raw": round_or_none(
                pearson(
                    [row["spxMonthlyReturnPct"] for row in rows],
                    [row["fx"].get(symbol, {}).get("returnPct") for row in rows],
                )
            ),
            "usd": round_or_none(
                pearson(
                    [row["spxMonthlyReturnPct"] for row in rows],
                    [row["fx"].get(symbol, {}).get("usdReturnPct") for row in rows],
                )
            ),
        }

    for year in sorted({row["month"][:4] for row in rows}):
        year_rows = [row for row in rows if row["month"].startswith(year)]
        by_year[year] = {}
        for pair in PAIRS:
            symbol = pair["symbol"]
            by_year[year][symbol] = {
                "n": len(year_rows),
                "raw": round_or_none(
                    pearson(
                        [row["spxMonthlyReturnPct"] for row in year_rows],
                        [row["fx"].get(symbol, {}).get("returnPct") for row in year_rows],
                    )
                ),
                "usd": round_or_none(
                    pearson(
                        [row["spxMonthlyReturnPct"] for row in year_rows],
                        [
                            row["fx"].get(symbol, {}).get("usdReturnPct")
                            for row in year_rows
                        ],
                    )
                ),
            }
    return {"full": full, "byYear": by_year}


def main() -> None:
    today = datetime.now().astimezone().date()
    start = (pd.Timestamp(today) - pd.DateOffset(years=YEARS + 1, months=2)).date()
    end = today + timedelta(days=2)
    tickers = [SPX_TICKER] + [pair["ticker"] for pair in PAIRS]
    series_map = {
        ticker: download_close(ticker, start.isoformat(), end.isoformat())
        for ticker in tickers
    }

    rows, preview = build_rows(series_map, today)
    if len(rows) < YEARS * 12:
        raise RuntimeError(f"Expected 60 completed monthly observations, got {len(rows)}")

    latest_spx_date = series_map[SPX_TICKER].index[-1].date()
    latest_period = pd.Period(latest_spx_date, freq="M")
    expected_month_end = last_weekday_of_month(latest_spx_date)
    current_month_is_preview = latest_period == pd.Period(today, freq="M")

    payload = {
        "meta": {
            "generatedAt": datetime.now().astimezone().isoformat(timespec="seconds"),
            "source": "Yahoo Finance via yfinance",
            "spxTicker": SPX_TICKER,
            "years": YEARS,
            "observationCount": len(rows),
            "completedThrough": rows[-1]["month"],
            "latestSpxDate": latest_spx_date.isoformat(),
            "latestSpxClose": round_or_none(float(series_map[SPX_TICKER].iloc[-1]), 4),
            "currentMonthExpectedFinalTradingDate": expected_month_end.isoformat(),
            "currentMonthIsPreview": current_month_is_preview,
            "methodology": [
                "S&P monthly return is close-to-close from the previous S&P month-end to the current S&P month-end.",
                "FX month-end move is the close-to-close percentage move on the S&P month-end date.",
                "Correlations are Pearson correlations between S&P monthly return and the FX last-day move.",
                "Raw pair returns preserve ticker direction. USD-normalized returns flip EURUSD, GBPUSD, AUDUSD, and NZDUSD so positive means USD strength.",
            ],
            "pairs": PAIRS,
        },
        "rows": rows,
        "preview": preview,
        "summary": build_summary(rows),
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    full = payload["summary"]["full"]
    top = sorted(
        full.items(),
        key=lambda item: abs(item[1]["raw"] if item[1]["raw"] is not None else 0),
        reverse=True,
    )[:3]
    print(f"Wrote {OUTPUT.relative_to(ROOT)} with {len(rows)} completed month-end rows")
    print(f"Completed through {rows[-1]['month']} using S&P data through {latest_spx_date}")
    for symbol, values in top:
        print(f"{symbol}: raw r={values['raw']}, USD-normalized r={values['usd']}")


if __name__ == "__main__":
    main()
