"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { EquityPoint } from "@/lib/equityCurve";

interface EquityCurveChartProps {
  data: EquityPoint[];
  onReset: () => void;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function EquityCurveChart({ data, onReset }: EquityCurveChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    time: formatTime(d.timestamp),
  }));

  const hasData = chartData.length > 0;
  const latestEquity = hasData ? chartData[chartData.length - 1].equity : null;

  return (
    <div className="border border-gray-700 rounded-sm bg-gray-900/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] tracking-widest text-gray-500 uppercase">
          WHAT IF YOU TRADED EVERY SIGNAL? (FAKE P&L)
        </div>
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          {latestEquity !== null && (
            <span className="tabular-nums">
              EQUITY: {latestEquity.toFixed(2)}
            </span>
          )}
          <button
            type="button"
            onClick={onReset}
            className="border border-gray-700 px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Reset Sim
          </button>
        </div>
      </div>
      <div className="h-40">
        {!hasData ? (
          <div className="h-full flex items-center justify-center text-gray-600 text-sm">
            Waiting for signals to build equity curve...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="time"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                stroke="#374151"
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 10 }}
                stroke="#374151"
                tickFormatter={(v: number) => v.toFixed(0)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  borderRadius: 2,
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 11,
                }}
                labelStyle={{ color: "#9ca3af" }}
                formatter={(value: number) => [value.toFixed(2), "Equity"]}
              />
              <ReferenceLine
                y={10_000}
                stroke="#4b5563"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
              />
              <Line
                type="monotone"
                dataKey="equity"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: "#22c55e" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="mt-2 text-[10px] text-gray-600">
        HYPOTHETICAL P&L — FIXED SIZE, NO FEES. NOT REAL TRADING.
      </div>
    </div>
  );
}
