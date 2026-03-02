"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { AssetPrices, ProcessedMarket } from "@/lib/types";

interface StatsBarProps {
  prices: AssetPrices;
  topMarket: ProcessedMarket | null;
  isLive: boolean;
}

function StatCard({
  label,
  value,
  subValue,
  color = "text-green-400",
}: {
  label: string;
  value: string;
  subValue?: string;
  color?: string;
}) {
  return (
    <div className="border-r border-gray-700 last:border-r-0 px-4 py-3 flex-1 min-w-0">
      <div className="text-[10px] tracking-widest text-gray-500 uppercase mb-1">
        {label}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className={`text-lg font-bold ${color} tabular-nums`}
        >
          {value}
        </motion.div>
      </AnimatePresence>
      {subValue && (
        <div className="text-[10px] text-gray-600 mt-0.5">{subValue}</div>
      )}
    </div>
  );
}

export default function StatsBar({ prices, topMarket, isLive }: StatsBarProps) {
  const divergence = topMarket?.divergence ?? 0;
  const divergenceColor =
    Math.abs(divergence) > 0.02
      ? divergence > 0
        ? "text-green-400"
        : "text-red-400"
      : "text-yellow-400";

  return (
    <div className="border border-gray-700 rounded-sm bg-gray-900/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <div className="text-sm font-bold tracking-wider">
          POLYMARKET ARB // DASHBOARD v0.1
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isLive ? "bg-green-400 animate-pulse" : "bg-gray-600"
            }`}
          />
          <span
            className={`text-xs ${
              isLive ? "text-green-400" : "text-gray-600"
            }`}
          >
            {isLive ? "LIVE" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex divide-x divide-gray-700">
        <StatCard
          label="BTC / USD"
          value={
            prices.BTC > 0
              ? `$${prices.BTC.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
              : "---"
          }
          color="text-white"
        />
        <StatCard
          label="ETH / USD"
          value={
            prices.ETH > 0
              ? `$${prices.ETH.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
              : "---"
          }
          color="text-white"
        />
        <StatCard
          label="SOL / USD"
          value={
            prices.SOL > 0
              ? `$${prices.SOL.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
              : "---"
          }
          color="text-white"
        />
        <StatCard
          label="MARKET PRICE (POLY)"
          value={topMarket ? topMarket.midPrice.toFixed(2) : "---"}
          subValue={topMarket?.title.slice(0, 30) ?? ""}
          color="text-cyan-400"
        />
        <StatCard
          label="MODEL PRICE (OUR ESTIMATE)"
          value={topMarket ? topMarket.fairPrice.toFixed(2) : "---"}
          color="text-purple-400"
        />
        <StatCard
          label="MISPRICING (MODEL - MARKET)"
          value={
            topMarket
              ? `${divergence > 0 ? "+" : ""}${(divergence * 100).toFixed(2)}%`
              : "---"
          }
          subValue={topMarket ? `Signal: ${topMarket.signal}` : ""}
          color={divergenceColor}
        />
      </div>
    </div>
  );
}
