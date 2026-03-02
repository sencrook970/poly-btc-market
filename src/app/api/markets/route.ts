import { NextResponse } from "next/server";
import { POLYMARKET_API, BINANCE_REST } from "@/lib/constants";
import { processMarket, isSupportedAssetPriceMarket, inferAsset } from "@/lib/polymarket";
import type { AssetPrices, DashboardData } from "@/lib/types";
import { getLatestWsPrice, initBinanceWs } from "@/lib/binanceWs";

export const dynamic = "force-dynamic";

interface PolymarketEvent {
  id: string;
  title: string;
  markets: Array<{
    id: string;
    question: string;
    slug: string;
    outcomePrices: string;
    volume: number;
    active: boolean;
    closed: boolean;
    endDate: string;
  }>;
}

export async function GET() {
  try {
    // Ensure Binance WebSocket client is running (no-op if already started)
    initBinanceWs();

    // Fetch events (contains nested markets). Prefer WebSocket BTC price but
    // fall back to REST if no WebSocket price is available yet.
    const [eventsRes, btcRes, ethRes, solRes] = await Promise.all([
      fetch(
        `${POLYMARKET_API.replace("/markets", "/events")}?limit=300&active=true&closed=false`,
        { next: { revalidate: 0 } }
      ),
      fetch(`${BINANCE_REST}?symbol=BTCUSDT`, {
        next: { revalidate: 0 },
      }),
      fetch(`${BINANCE_REST}?symbol=ETHUSDT`, {
        next: { revalidate: 0 },
      }),
      fetch(`${BINANCE_REST}?symbol=SOLUSDT`, {
        next: { revalidate: 0 },
      }),
    ]);

    if (!eventsRes.ok || !btcRes.ok || !ethRes.ok || !solRes.ok) {
      return NextResponse.json(
        { error: "Failed to fetch upstream data" },
        { status: 502 }
      );
    }

    const [eventsData, btcData, ethData, solData] = await Promise.all([
      eventsRes.json(),
      btcRes.json(),
      ethRes.json(),
      solRes.json(),
    ]);

    const wsPrice = getLatestWsPrice();
    const btcPrice =
      typeof wsPrice === "number" && !Number.isNaN(wsPrice)
        ? wsPrice
        : parseFloat(btcData.price);

    const prices: AssetPrices = {
      BTC: btcPrice,
      ETH: parseFloat(ethData.price),
      SOL: parseFloat(solData.price),
    };

    // Extract all markets from events, filter for BTC price predictions
    const allMarkets: Array<{
      id: string;
      question: string;
      slug: string;
      outcomePrices: string;
      volume: number;
      endDate: string;
    }> = [];

    for (const event of eventsData as PolymarketEvent[]) {
      for (const market of event.markets || []) {
        if (
          market.active &&
          !market.closed &&
          market.outcomePrices &&
          isSupportedAssetPriceMarket(market.question)
        ) {
          allMarkets.push({
            id: String(market.id),
            question: market.question,
            slug: market.slug || "",
            outcomePrices: market.outcomePrices,
            volume: market.volume || 0,
            endDate: market.endDate || "",
          });
        }
      }
    }

    // Also try fetching individual markets endpoint for more coverage
    try {
      const marketsRes = await fetch(
        `${POLYMARKET_API}?active=true&closed=false&limit=200`,
        { next: { revalidate: 0 } }
      );
      if (marketsRes.ok) {
        const marketsData = await marketsRes.json();
        for (const m of marketsData) {
          if (
            m.active &&
            !m.closed &&
            m.outcomePrices &&
            isSupportedAssetPriceMarket(m.question) &&
            !allMarkets.some((existing) => String(existing.id) === String(m.id))
          ) {
            allMarkets.push({
              id: String(m.id),
              question: m.question,
              slug: m.slug || "",
              outcomePrices: m.outcomePrices,
              volume: m.volume || 0,
              endDate: m.endDate || "",
            });
          }
        }
      }
    } catch {
      // Non-critical, continue with events data
    }

    const markets = allMarkets
      .map((m) => {
        const asset = inferAsset(m.question);
        if (!asset) return null;
        const spot = prices[asset];
        if (!spot || Number.isNaN(spot)) return null;
        return processMarket(m, spot);
      })
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .sort((a, b) => Math.abs(b.divergence) - Math.abs(a.divergence));

    const topDivergence = markets.length > 0 ? markets[0] : null;

    const data: DashboardData = {
      prices,
      markets,
      topDivergence,
      timestamp: Date.now(),
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error("API route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
