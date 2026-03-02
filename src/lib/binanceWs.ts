// Binance WebSocket client for BTCUSDT ticker.
// Keeps the latest ticker price in memory and exposes it to the API layer.

import { BINANCE_WS } from "@/lib/constants";

export type BinanceTicker = {
  c: string; // last price as string
};

let latestPrice: number | null = null;
let socket: WebSocket | null = null;
let isConnecting = false;
let hasInitialized = false;

export function getLatestWsPrice(): number | null {
  return latestPrice;
}

// Initialize the Binance WebSocket connection.
// Safe to call multiple times; only the first call will actually connect.
export function initBinanceWs(): void {
  if (hasInitialized || isConnecting || socket) return;
  hasInitialized = true;
  isConnecting = true;

  const connect = () => {
    try {
      socket = new WebSocket(BINANCE_WS);

      socket.onopen = () => {
        isConnecting = false;
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data.toString()) as Partial<BinanceTicker>;
          if (data && typeof data.c === "string") {
            const parsed = parseFloat(data.c);
            if (!Number.isNaN(parsed)) {
              latestPrice = parsed;
            }
          }
        } catch {
          // Ignore malformed messages
        }
      };

      socket.onclose = () => {
        socket = null;
        // Attempt a simple reconnect after a short delay
        setTimeout(() => {
          isConnecting = true;
          connect();
        }, 3_000);
      };

      socket.onerror = () => {
        // Errors will eventually trigger onclose; nothing special to do here.
      };
    } catch {
      socket = null;
      isConnecting = false;
    }
  };

  connect();
}
