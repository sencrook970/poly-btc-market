import type { ProcessedMarket } from "./types";

/**
 * Extract a BTC strike price from a market question.
 * e.g. "Will Bitcoin hit $150k by March 31, 2026?" → 150000
 * e.g. "Will BTC exceed $150,000 by April?" → 150000
 */
export function extractStrikePrice(question: string): number | null {
  // Must mention Bitcoin or BTC
  if (!/bitcoin|btc/i.test(question)) return null;

  // Match dollar amounts: $150k, $150,000, $1m, etc.
  const patterns = [
    /\$(\d+(?:,\d{3})*(?:\.\d+)?)\s*[kK]/,         // $150k, $150K
    /\$(\d+(?:\.\d+)?)\s*[mM]/,                      // $1m, $1M
    /\$(\d{1,3}(?:,\d{3})+)/,                         // $150,000
    /\$(\d+(?:\.\d+)?)\s*(?:thousand|million|billion)/i,
    /\$(\d{4,})/,                                      // $150000 (no commas)
  ];

  for (const pattern of patterns) {
    const match = question.match(pattern);
    if (match) {
      let val = parseFloat(match[1].replace(/,/g, ""));

      // Handle suffixes
      if (/[kK]/.test(question.charAt(match.index! + match[0].length - 1)) ||
          question.slice(match.index!, match.index! + match[0].length).match(/[kK]/)) {
        val *= 1000;
      }
      if (/[mM]/.test(question.charAt(match.index! + match[0].length - 1)) ||
          question.slice(match.index!, match.index! + match[0].length).match(/[mM]/)) {
        val *= 1_000_000;
      }

      // Must be a plausible BTC price (at least $10,000)
      if (val >= 10_000) return val;
    }
  }

  return null;
}

/**
 * Check if a market question is about BTC price
 */
export function isBtcPriceMarket(question: string): boolean {
  return /bitcoin|btc/i.test(question) && extractStrikePrice(question) !== null;
}

/**
 * Calculate fair probability given current BTC price, strike price, and time to expiry.
 *
 * Uses simplified log-normal model:
 * - If BTC is already above strike → high probability, slight time risk
 * - If BTC is below strike → probability based on distance and time remaining
 */
export function calculateFairProbability(
  btcPrice: number,
  strikePrice: number,
  endDate: string
): number {
  const now = Date.now();
  const expiry = new Date(endDate).getTime();
  const daysRemaining = Math.max((expiry - now) / (1000 * 60 * 60 * 24), 0.1);

  const ratio = btcPrice / strikePrice;

  if (ratio >= 1) {
    // BTC is already above strike
    const excess = ratio - 1;
    const base = 0.65 + Math.min(excess * 5, 0.30);
    const timeDiscount = Math.max(0, 0.02 * Math.log(daysRemaining + 1));
    return Math.min(Math.max(base - timeDiscount, 0.5), 0.98);
  } else {
    // BTC is below strike — use volatility-based estimate
    const deficit = 1 - ratio; // how far below (0-1)
    const annualVol = 0.60; // BTC ~60% annual volatility
    const yearsRemaining = daysRemaining / 365;
    const vol = annualVol * Math.sqrt(yearsRemaining);

    // Simplified probability: P(BTC > strike) based on distance in vol terms
    const zScore = Math.log(ratio) / (vol || 0.01);
    // Approximate normal CDF using logistic approximation
    const prob = 1 / (1 + Math.exp(-1.7 * zScore));

    return Math.min(Math.max(prob, 0.005), 0.95);
  }
}

/**
 * Determine trading signal from divergence
 */
export function getSignal(divergence: number): "BUY" | "SELL" | "HOLD" {
  if (divergence > 0.02) return "BUY";   // fair > market by 2%+, underpriced
  if (divergence < -0.02) return "SELL";  // fair < market by 2%+, overpriced
  return "HOLD";
}

/**
 * Process a raw Polymarket market with BTC price context
 */
export function processMarket(
  market: {
    id: string;
    question: string;
    slug: string;
    outcomePrices: string;
    volume: number;
    endDate: string;
  },
  btcPrice: number
): ProcessedMarket | null {
  const strikePrice = extractStrikePrice(market.question);
  if (!strikePrice) return null;

  let yesPrice: number;
  let noPrice: number;
  try {
    const prices = JSON.parse(market.outcomePrices);
    yesPrice = parseFloat(prices[0]) || 0;
    noPrice = parseFloat(prices[1]) || 0;
  } catch {
    return null;
  }

  if (yesPrice === 0) return null;

  // Skip expired markets (yes=0, no=1 means resolved)
  if (yesPrice === 0 && noPrice === 1) return null;

  const midPrice = yesPrice;
  const fairPrice = calculateFairProbability(btcPrice, strikePrice, market.endDate);
  const divergence = fairPrice - midPrice;
  const signal = getSignal(divergence);

  return {
    id: market.id,
    title: market.question,
    slug: market.slug,
    yesPrice,
    noPrice,
    midPrice,
    fairPrice,
    divergence,
    volume: market.volume || 0,
    endDate: market.endDate,
    strikePrice,
    signal,
  };
}
