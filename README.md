# FX Asymmetric Signal Dashboard

This is a prototype Streamlit dashboard for scanning G10 FX and major crosses for asymmetric trading setups.

The dashboard is built around R-multiple logic.

R = absolute distance between entry and stop.

A stopped trade is -1R.

A trade that hits 2R before stop is +2R.

A trade that hits 3R before stop is +3R.

A trade that hits 5R before stop is +5R.

## Data Source

This prototype uses Yahoo Finance via yfinance.

Yahoo Finance is only for prototyping.

For production research, replace the data loader with AlphaNet or Bloomberg clean OHLC data.

## Signals

The dashboard currently implements:

1. Volatility Compression Breakout
2. Failed Breakout Reversal
3. Trend Pullback Continuation

## How to Run Locally

Install requirements:

```bash
pip install -r requirements.txt
```

Run the app:

```bash
streamlit run fx_signal_dashboard.py
```

## Deploy on Streamlit Community Cloud

1. Push this project to GitHub.
2. Go to [Streamlit Community Cloud](https://share.streamlit.io/).
3. Sign in with GitHub.
4. Click "Create app".
5. Select the repository containing this project.
6. Set the branch to `main`.
7. Set the main file path to `fx_signal_dashboard.py`.
8. Click "Deploy".

No secrets are required for this prototype because it uses public Yahoo Finance data.

## Dashboard Sections

1. Live Signal Blotter
2. Backtest Diagnostics
3. Price Chart
4. Parameter Controls
5. Interpretation Notes

## Important Notes

The backtest is conservative.

If both stop and target are touched on the same daily bar, the stop is assumed to hit first.

This is intentional because daily OHLC data does not tell us the intraday order of events.

## Future Improvements

Next improvements should include:

1. AlphaNet data loader
2. Bloomberg BQL loader
3. Cross-asset confirmation
4. Rates confirmation for FX pairs
5. Commodity confirmation for AUD, CAD, NOK
6. Intraday execution layer
7. Transaction cost and slippage model
8. Walk-forward robustness testing
9. Parameter sensitivity heatmaps
10. Portfolio-level signal ranking
