// Simple equity curve / paper trading simulation for arbitrage signals.
// v0: fixed position size, no leverage or fees.

export type EquityPoint = {
  timestamp: number;
  equity: number;
};

export const INITIAL_EQUITY = 10_000;

// TODO: implement simulation engine that consumes processed markets + signals
// and produces an array of EquityPoint values for charting.
export function simulateEquityCurve(): EquityPoint[] {
  return [];
}
