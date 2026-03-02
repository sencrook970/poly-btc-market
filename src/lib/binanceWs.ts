// Binance WebSocket client for BTCUSDT ticker
// TODO: implement connection, reconnection, and latest price caching.

export type BinanceTicker = {
  c: string; // last price as string
};

let latestPrice: number | null = null;

export function getLatestWsPrice(): number | null {
  return latestPrice;
}

// initBinanceWs will be implemented next: it will connect to
// wss://stream.binance.com:9443/ws/btcusdt@ticker and update latestPrice.
export function initBinanceWs(): void {
  // placeholder for upcoming implementation
}
