# Polymarket Arbitrage Dashboard

A real-time monitoring dashboard that detects price divergences (arbitrage opportunities) between Polymarket Bitcoin prediction markets and the actual BTC price from Binance.

**No real trades are placed — this is a read-only monitoring tool.**

---

## Background: What Are Prediction Markets?

Polymarket is a prediction market platform where users bet on real-world outcomes. For example:

- **"Will Bitcoin hit $150K by December 2026?"**
  - You can buy **YES** at $0.115 (market thinks 11.5% chance)
  - You can buy **NO** at $0.885 (market thinks 88.5% chance)
  - If the event happens, YES pays $1.00 — you profit $0.885 per share
  - If it doesn't, NO pays $1.00

The key insight: **these market prices reflect crowd-estimated probabilities**. If the crowd is wrong (the real probability is different from the market price), there's an arbitrage opportunity.

## What Is Arbitrage Here?

```
Example:
1. Polymarket: "Will BTC exceed $150K by April?" → YES price: $0.53 (53% chance)
2. BTC is already at $151,247 (ABOVE $150K)
3. Our model says fair probability should be ~65-70%
4. Divergence = 65% - 53% = +12% → BUY signal (YES shares are underpriced)

The idea: buy YES at $0.53, it's likely worth $0.65+
```

This dashboard monitors these divergences in real-time and logs what trades it WOULD make (without actually executing them).

---

## What's Been Built (v0.1)

### Live Dashboard (`http://localhost:3000`)

A single-page terminal-style dark UI with four main sections:

```
┌─────────────────────────────────────────────────────────────┐
│ POLYMARKET ARB // DASHBOARD v0.1           ● LIVE           │
├──────────┬──────────┬──────────┬────────────────────────────┤
│ BTC/USD  │ POLY MID │ FAIR     │ DIVERGENCE                 │
│ $66,190  │ 0.49     │ 0.01     │ -48.05%                    │
├──────────┴──────────┴──────────┴────────────────────────────┤
│                                                             │
│  DIVERGENCE CHART (real-time line chart over time)          │
│                                                             │
├──────────────────────────┬──────────────────────────────────┤
│ MARKET LIST              │ EXECUTION LOG                    │
│ BTC>$150K Dec  0.12 SELL │ -4.15% div — "BTC hit $150k..." │
│ BTC>$150K Jun  0.02 HOLD │ WOULD SELL YES @ 0.12           │
│ BTC>$1M GTA   0.49 SELL │ -48.05% div — "bitcoin $1m..."  │
└──────────────────────────┴──────────────────────────────────┘
```

### Features Implemented

1. **Real-time BTC price** — fetched from Binance REST API every 5 seconds
2. **Polymarket market data** — fetched from Polymarket Gamma API (events endpoint), filtered to BTC price prediction markets only
3. **Fair probability model** — calculates what the market price SHOULD be using:
   - Current BTC price vs strike price (e.g., $66K vs $150K target)
   - Time remaining until market expiry
   - BTC's ~60% annual volatility (log-normal model)
4. **Divergence detection** — compares our fair value to market price, flags when difference exceeds 2%
5. **Trading signals** — BUY (underpriced), SELL (overpriced), or HOLD
6. **Divergence chart** — Recharts line chart plotting divergence % over time, keeps last 50 data points, with green/red threshold lines
7. **Execution log** — scrolling log of detected opportunities with timestamps, formatted like trading terminal output
8. **Server-side API proxy** — Next.js API route (`/api/markets`) fetches Polymarket + Binance data server-side, avoiding CORS issues

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.x | App Router, API routes, SSR |
| React | 19.x | UI components |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling (with `@theme inline`) |
| Framer Motion | 12.x | Animated number transitions, list animations |
| Recharts | 2.x | Divergence chart |
| JetBrains Mono | — | Terminal-style monospace font |

## Data Sources (All Public, No API Keys)

| Source | Endpoint | What It Gives Us |
|---|---|---|
| Polymarket Gamma API | `GET https://gamma-api.polymarket.com/events` | BTC prediction markets with YES/NO prices |
| Binance REST | `GET https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT` | Current live BTC/USD price |

---

## Project Structure

```
make-demo/
├── CLAUDE.md                              # Claude Code instructions
├── PROJECT.md                             # This file — project context
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── .gitignore
├── .claude/skills/                        # Claude Code custom skills
│   ├── explain-file/SKILL.md
│   ├── create-api/SKILL.md
│   └── summarize-folder/SKILL.md
└── src/
    ├── app/
    │   ├── layout.tsx                     # Root layout: JetBrains Mono, dark theme
    │   ├── page.tsx                       # Main dashboard: polling, state, layout
    │   ├── globals.css                    # Tailwind theme, terminal CSS, scanlines
    │   └── api/
    │       └── markets/
    │           └── route.ts               # Server proxy: Polymarket + Binance → JSON
    ├── components/
    │   ├── StatsBar.tsx                   # Top stats: BTC price, mid, fair, divergence
    │   ├── DivergenceChart.tsx            # Line chart of divergence over time
    │   ├── MarketList.tsx                 # Table of markets with signals
    │   └── ExecutionLog.tsx               # Scrolling trade signal log
    └── lib/
        ├── types.ts                       # TypeScript interfaces
        ├── constants.ts                   # API URLs, poll interval, thresholds
        └── polymarket.ts                  # Core logic: strike extraction, fair
                                           # probability, signal generation
```

---

## Key Files Explained

### `src/lib/polymarket.ts` — Core Algorithm
- `extractStrikePrice()` — Parses "$150k", "$150,000", "$1m" from market questions
- `isBtcPriceMarket()` — Filters to only BTC price prediction markets
- `calculateFairProbability()` — Log-normal volatility model to estimate true probability
- `getSignal()` — Converts divergence to BUY/SELL/HOLD (±2% threshold)
- `processMarket()` — Takes raw Polymarket data + BTC price → processed market with divergence

### `src/app/api/markets/route.ts` — API Proxy
- Fetches Polymarket events + Binance BTC price in parallel
- Filters for BTC price markets only
- Calculates divergence for each
- Returns sorted by largest absolute divergence

### `src/app/page.tsx` — Dashboard State
- Polls `/api/markets` every 5 seconds
- Maintains chart history (last 50 points)
- Generates execution log entries for divergences > 1%
- Distributes data to all child components

---

## How to Run

```bash
cd make-demo
npm install
npm run dev
```

Open http://localhost:3000

---

## Future Feature Ideas

These have NOT been built yet — ideas for extending the project:

- [ ] **Binance WebSocket** — Replace REST polling with `wss://stream.binance.com:9443/ws/btcusdt@ticker` for sub-second BTC price updates
- [ ] **Equity curve** — Simulated P&L chart showing hypothetical returns if all signals were traded
- [ ] **Multiple crypto assets** — Extend beyond BTC to ETH, SOL, and other crypto prediction markets
- [ ] **Historical backtest** — Store divergence data over time, replay and test strategy performance
- [ ] **Alerting** — Push notifications (email, Telegram, Discord) when divergence exceeds a threshold
- [ ] **Polymarket CLOB integration** — Connect to Polymarket's order book API for real bid/ask spreads instead of just mid prices
- [ ] **Risk model** — More sophisticated fair value using implied volatility surfaces, mean reversion
- [ ] **Actual trade execution** — Place real trades via Polymarket's API (requires wallet integration + funds)
- [ ] **Multi-source price feeds** — Aggregate BTC price from multiple exchanges (Coinbase, Kraken) for robustness
- [ ] **Mobile responsive** — Optimize the dashboard layout for phone/tablet screens
- [ ] **Settings panel** — UI to adjust divergence thresholds, poll intervals, volatility assumptions
- [ ] **Market depth view** — Show Polymarket order book depth for each market
