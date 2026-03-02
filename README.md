# Polymarket Crypto Mispricing Dashboard

A simple, read-only dashboard that watches crypto prediction questions on Polymarket and looks for odds that seem far from reality.

The app:

- Streams **BTC / ETH / SOL prices** from Binance.
- Pulls **prediction questions** from Polymarket (e.g. "Will Bitcoin hit $150k by December 2026?").
- Compares **market odds** (the Polymarket price between 0 and 1) to a **simple model** that looks at current price and time left.
- Highlights **possible mispricings** when the gap is big.
- Draws a **fake P&L line** showing what would have happened if you followed every BUY / SELL signal with paper money.

No real trades. No keys. Just a visual way to explore when prediction markets might be out of line with a basic model.

## Who this is for

- People who are **curious about prediction markets** and want to see concrete examples.
- **Crypto / DeFi hobbyists** who like spotting weird or extreme market odds.
- Learners who prefer to **see a pretend P&L** instead of risking real money.

It is **not** a live trading tool, and it does not connect to wallets or execute orders.

## How to read the dashboard

At a high level:

1. **Stats bar (top)**
   - Shows BTC / ETH / SOL prices.
   - Shows a single "top" market with the biggest mispricing:
     - **Market Price (Poly)** – current Polymarket price for YES.
     - **Model Price (Our Estimate)** – our rough probability.
     - **Mispricing (Model − Market)** – if positive, model is more bullish; if negative, more bearish.

2. **Mispricing chart**
   - A line over time of how big the mispricing is for the most interesting market (or filtered asset).
   - Above 0%: model is more bullish than the market (BUY bias).
   - Below 0%: model is more bearish than the market (SELL bias).

3. **"What if you traded every signal?" (fake P&L)**
   - Starts at 10,000 USDC (paper money).
   - Each time there is a strong BUY / SELL signal, the sim opens a fixed-size position.
   - When the mispricing normalizes or flips, the position is closed and the line moves up or down.
   - This is **only a simulation** – it shows how a very simple strategy might have behaved.

4. **Market list + signal history**
   - **Market list**: all tracked questions, with asset, market text, market price, model price, mispricing %, and suggested signal.
   - **Signal history (fake trades)**: a scrolling log of the signals the sim would have taken.

## Quick example

Imagine a Polymarket question:

> "Will Bitcoin hit $150k by December 31 this year?"

- Polymarket price is **0.60** → crowd says ~60% chance YES.
- Our model thinks the chance is closer to **0.20** based on current BTC price and time left.

On the dashboard you would see something like:

- Market Price (Poly): `0.60`
- Model Price (Our Estimate): `0.20`
- Mispricing (Model − Market): `−40%`
- Signal: `SELL`

In plain English:

> The crowd looks much more optimistic than our simple math. If you followed the strategy, you would *sell* this market, expecting its price to come down later.

If the price later drops from 0.60 to 0.30, the fake P&L line will move up to show that this bet would have made money in the simulation.

## Running locally

```bash
npm install
npm run dev
# then open http://localhost:3000
```

You do not need any API keys: both Polymarket and Binance data are fetched from public endpoints.
