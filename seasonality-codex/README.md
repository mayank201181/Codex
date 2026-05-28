# Seasonality Codex

Static dashboard for comparing S&P monthly returns with G7 USD-pair month-end FX moves.

## Universe

- S&P 500: `^GSPC`
- FX: `EURUSD`, `GBPUSD`, `AUDUSD`, `NZDUSD`, `USDJPY`, `USDCAD`, `USDCHF`

The original request had duplicate and truncated pair names, so the app uses the standard seven USD majors.

## Methodology

- Data source: Yahoo Finance via `yfinance`.
- Sample: last 60 completed calendar month-ends.
- S&P monthly return: close-to-close from the previous S&P month-end to the current S&P month-end.
- FX month-end move: close-to-close percentage move on the S&P month-end date.
- Correlation: Pearson correlation between S&P monthly return and the FX last-day move.
- Raw view keeps the quoted pair direction.
- USD strength view flips EURUSD, GBPUSD, AUDUSD, and NZDUSD so positive means USD strength.

## Refresh Data

From this directory:

```bash
python3 scripts/build_data.py
```

The script writes `data/seasonality.json`.

## Run Locally

From this directory:

```bash
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/`.

## Important

This is a research dashboard, not a trading recommendation. Five years of month-end observations is a small sample, and Yahoo Finance daily FX data can contain holiday gaps or revisions.
