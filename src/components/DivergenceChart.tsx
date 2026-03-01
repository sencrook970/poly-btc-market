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
import type { DivergencePoint } from "@/lib/types";

interface DivergenceChartProps {
  data: DivergencePoint[];
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function DivergenceChart({ data }: DivergenceChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    time: formatTime(d.timestamp),
    divergencePct: +(d.divergence * 100).toFixed(3),
  }));

  return (
    <div className="border border-gray-700 rounded-sm bg-gray-900/50 p-4">
      <div className="text-[10px] tracking-widest text-gray-500 uppercase mb-3">
        DIVERGENCE CHART (%)
      </div>
      <div className="h-48">
        {chartData.length < 2 ? (
          <div className="h-full flex items-center justify-center text-gray-600 text-sm">
            Collecting data points...
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
                tickFormatter={(v: number) => `${v.toFixed(1)}%`}
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
                formatter={(value: number) => [`${value.toFixed(3)}%`, "Divergence"]}
              />
              <ReferenceLine y={2} stroke="#22c55e" strokeDasharray="5 5" strokeOpacity={0.5} />
              <ReferenceLine y={-2} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.5} />
              <ReferenceLine y={0} stroke="#4b5563" />
              <Line
                type="monotone"
                dataKey="divergencePct"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: "#06b6d4" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
