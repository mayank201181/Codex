# FX Seasonality Dashboard

A local dashboard for EODHD daily FX data. It ranks bullish and bearish seasonal tendencies by pair, then aggregates those pair signals into currency strength and weakness.

## Run

```bash
npm start
```

Open `http://localhost:5177`.

The local password is loaded from `.env`:

```text
AUTH_PASSWORD=FxSeason2026!
```

## What it includes

- History choices: 5, 10, 20, and 30 years.
- Seasonality modes: day of year, week of year, month of year, day of month, and day of week.
- Forward windows: 1, 3, 5, 10, 20, and 30 trading days.
- Bullish and bearish leaderboards filtered by minimum win rate.
- Currency strength / weakness aggregation from pair signals.
- Monthly heatmap and seasonal path chart.
- Local EODHD response cache under `data/cache`.
- Private password login.
- Optional owner-approved email access codes when deployed with Resend email settings.

The EODHD API key is loaded from `.env`.

## Public Deployment

For Render or a similar Node hosting service:

- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `EODHD_API_KEY`
  - `AUTH_PASSWORD`
  - `SESSION_SECRET`
  - optional `HOST=0.0.0.0`

For emailed access codes, create a Resend account and add:

- `EMAIL_CODE_ENABLED=true`
- `OWNER_EMAIL=you@example.com`
- `RESEND_API_KEY`
- `EMAIL_FROM=FX Dashboard <onboarding@resend.dev>` or a verified sender address
