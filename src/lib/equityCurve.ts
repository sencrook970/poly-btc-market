// Simple equity curve / paper trading simulation for arbitrage signals.
// v0: fixed position size, no leverage or fees.

import type { ProcessedMarket } from "./types";

export type EquityPoint = {
  timestamp: number;
  equity: number;
};

export const INITIAL_EQUITY = 10_000;

export type PositionSide = "LONG" | "SHORT";

export interface Position {
  marketId: string;
  side: PositionSide;
  entryPrice: number;
  size: number;
  openTimestamp: number;
  closeTimestamp?: number;
  realizedPnl: number;
}

export interface SimulationState {
  equity: number;
  realizedPnl: number;
  positions: Record<string, Position>;
}

// Fixed position size per trade (USDC notional)
export const POSITION_SIZE = 1_000;

// Open a position when divergence exceeds this threshold
export const OPEN_THRESHOLD = 0.02; // 2%

// Close when divergence normalizes below this threshold or signal flips
export const CLOSE_THRESHOLD = 0.005; // 0.5%

export function createInitialState(): SimulationState {
  return {
    equity: INITIAL_EQUITY,
    realizedPnl: 0,
    positions: {},
  };
}

function getDirectionFromSignal(signal: ProcessedMarket["signal"]): PositionSide | null {
  if (signal === "BUY") return "LONG";
  if (signal === "SELL") return "SHORT";
  return null;
}

function computeUnrealizedPnl(
  positions: Record<string, Position>,
  markets: ProcessedMarket[]
): number {
  let unrealized = 0;

  for (const pos of Object.values(positions)) {
    const market = markets.find((m) => m.id === pos.marketId);
    if (!market) continue;

    const dir = pos.side === "LONG" ? 1 : -1;
    const priceDiff = market.midPrice - pos.entryPrice;
    unrealized += dir * priceDiff * pos.size;
  }

  return unrealized;
}

export function stepEquitySimulation(
  prevState: SimulationState,
  markets: ProcessedMarket[],
  timestamp: number
): { state: SimulationState; point: EquityPoint } {
  // Clone state to avoid accidental mutation
  const state: SimulationState = {
    equity: prevState.equity,
    realizedPnl: prevState.realizedPnl,
    positions: { ...prevState.positions },
  };

  // 1) Close positions when signal flips or divergence normalizes
  for (const [marketId, pos] of Object.entries(state.positions)) {
    const market = markets.find((m) => m.id === marketId);
    if (!market) continue;

    const dir = pos.side === "LONG" ? 1 : -1;
    const shouldClose =
      market.signal === "HOLD" ||
      Math.abs(market.divergence) < CLOSE_THRESHOLD ||
      getDirectionFromSignal(market.signal) !== pos.side;

    if (shouldClose) {
      const priceDiff = market.midPrice - pos.entryPrice;
      const pnl = dir * priceDiff * pos.size;

      state.realizedPnl += pnl;
      state.positions[marketId] = {
        ...pos,
        closeTimestamp: timestamp,
        realizedPnl: pos.realizedPnl + pnl,
      };

      // Remove closed position from active book
      delete state.positions[marketId];
    }
  }

  // 2) Open new positions when divergence is large and no active position
  for (const market of markets) {
    const side = getDirectionFromSignal(market.signal);
    if (!side) continue;

    const existing = state.positions[market.id];
    if (existing) {
      // Already have a position on this market; skip for v0
      continue;
    }

    if (Math.abs(market.divergence) >= OPEN_THRESHOLD) {
      state.positions[market.id] = {
        marketId: market.id,
        side,
        entryPrice: market.midPrice,
        size: POSITION_SIZE,
        openTimestamp: timestamp,
        realizedPnl: 0,
      };
    }
  }

  // 3) Recompute equity: initial + realized + unrealized
  const unrealized = computeUnrealizedPnl(state.positions, markets);
  const equity = INITIAL_EQUITY + state.realizedPnl + unrealized;
  state.equity = equity;

  return {
    state,
    point: {
      timestamp,
      equity,
    },
  };
}
