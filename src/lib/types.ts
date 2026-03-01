export interface PolymarketMarket {
  id: string;
  question: string;
  slug: string;
  outcomePrices: string;
  volume: number;
  active: boolean;
  closed: boolean;
  endDate: string;
  description: string;
}

export interface ProcessedMarket {
  id: string;
  title: string;
  slug: string;
  yesPrice: number;
  noPrice: number;
  midPrice: number;
  fairPrice: number;
  divergence: number;
  volume: number;
  endDate: string;
  strikePrice: number | null;
  signal: "BUY" | "SELL" | "HOLD";
}

export interface BinancePrice {
  symbol: string;
  price: string;
}

export interface DivergencePoint {
  timestamp: number;
  label: string;
  divergence: number;
  btcPrice: number;
  marketTitle: string;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: "SIGNAL" | "INFO" | "WARNING";
  message: string;
  divergence: number;
  signal: "BUY" | "SELL" | "HOLD";
}

export interface DashboardData {
  btcPrice: number;
  markets: ProcessedMarket[];
  topDivergence: ProcessedMarket | null;
  timestamp: number;
}
