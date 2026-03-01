"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import StatsBar from "@/components/StatsBar";
import DivergenceChart from "@/components/DivergenceChart";
import MarketList from "@/components/MarketList";
import ExecutionLog from "@/components/ExecutionLog";
import { POLL_INTERVAL_MS, MAX_CHART_POINTS, MAX_LOG_ENTRIES } from "@/lib/constants";
import type {
  DashboardData,
  DivergencePoint,
  LogEntry,
  ProcessedMarket,
} from "@/lib/types";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<DivergencePoint[]>([]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logIdCounter = useRef(0);

  const generateLogEntries = useCallback(
    (markets: ProcessedMarket[], timestamp: number): LogEntry[] => {
      const entries: LogEntry[] = [];
      for (const market of markets) {
        if (Math.abs(market.divergence) > 0.01) {
          const divStr = `${market.divergence > 0 ? "+" : ""}${(
            market.divergence * 100
          ).toFixed(2)}%`;

          entries.push({
            id: `log-${logIdCounter.current++}`,
            timestamp,
            type: Math.abs(market.divergence) > 0.05 ? "SIGNAL" : "INFO",
            message: `${divStr} divergence — "${market.title.slice(0, 40)}" CLOB @ ${market.midPrice.toFixed(2)} | fair ${market.fairPrice.toFixed(2)}`,
            divergence: market.divergence,
            signal: market.signal,
          });

          if (market.signal !== "HOLD") {
            entries.push({
              id: `log-${logIdCounter.current++}`,
              timestamp,
              type: "SIGNAL",
              message: `WOULD ${market.signal} YES @ ${market.midPrice.toFixed(2)} — "${market.title.slice(0, 35)}"`,
              divergence: market.divergence,
              signal: market.signal,
            });
          }
        }
      }
      return entries;
    },
    []
  );

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/markets");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const dashData: DashboardData = await res.json();
      setData(dashData);
      setIsLive(true);
      setError(null);

      // Add divergence points for chart
      if (dashData.topDivergence) {
        setChartData((prev) => {
          const next = [
            ...prev,
            {
              timestamp: dashData.timestamp,
              label: dashData.topDivergence!.title.slice(0, 20),
              divergence: dashData.topDivergence!.divergence,
              btcPrice: dashData.btcPrice,
              marketTitle: dashData.topDivergence!.title,
            },
          ];
          return next.slice(-MAX_CHART_POINTS);
        });
      }

      // Generate log entries
      const newLogs = generateLogEntries(dashData.markets, dashData.timestamp);
      if (newLogs.length > 0) {
        setLogEntries((prev) => [...prev, ...newLogs].slice(-MAX_LOG_ENTRIES));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsLive(false);
    }
  }, [generateLogEntries]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <main className="max-w-6xl mx-auto p-4 space-y-4 relative scanline">
      {/* Error banner */}
      {error && (
        <div className="border border-red-800 bg-red-900/20 rounded-sm px-4 py-2 text-red-400 text-xs">
          CONNECTION ERROR: {error}
          <span className="cursor-blink ml-1">_</span>
        </div>
      )}

      {/* Stats Bar */}
      <StatsBar
        btcPrice={data?.btcPrice ?? 0}
        topMarket={data?.topDivergence ?? null}
        isLive={isLive}
      />

      {/* Divergence Chart */}
      <DivergenceChart data={chartData} />

      {/* Bottom: Market List + Execution Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MarketList markets={data?.markets ?? []} />
        <ExecutionLog entries={logEntries} />
      </div>

      {/* Footer */}
      <div className="text-center text-[10px] text-gray-700 pt-2">
        READ-ONLY MONITOR — NO REAL TRADES
        <span className="cursor-blink ml-1">_</span>
      </div>
    </main>
  );
}
