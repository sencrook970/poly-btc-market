"use client";

import { motion } from "framer-motion";
import type { ProcessedMarket } from "@/lib/types";

interface MarketListProps {
  markets: ProcessedMarket[];
}

export default function MarketList({ markets }: MarketListProps) {
  return (
    <div className="border border-gray-700 rounded-sm bg-gray-900/50 flex flex-col min-h-0">
      <div className="px-4 py-2 border-b border-gray-700">
        <span className="text-[10px] tracking-widest text-gray-500 uppercase">
          MARKET LIST
        </span>
      </div>
      <div className="overflow-y-auto flex-1 max-h-64">
        {markets.length === 0 ? (
          <div className="p-4 text-gray-600 text-sm">
            Loading markets...
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="text-left px-3 py-2 font-normal">ASSET</th>
                <th className="text-left px-1 py-2 font-normal">MARKET</th>
                <th className="text-right px-2 py-2 font-normal">MID</th>
                <th className="text-right px-2 py-2 font-normal">FAIR</th>
                <th className="text-right px-2 py-2 font-normal">DIV %</th>
                <th className="text-right px-4 py-2 font-normal">SIGNAL</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((market, i) => {
                const divColor =
                  Math.abs(market.divergence) > 0.02
                    ? market.divergence > 0
                      ? "text-green-400"
                      : "text-red-400"
                    : "text-gray-400";

                const signalColor =
                  market.signal === "BUY"
                    ? "text-green-400"
                    : market.signal === "SELL"
                    ? "text-red-400"
                    : "text-gray-500";

                return (
                  <motion.tr
                    key={market.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30"
                  >
                    <td className="px-3 py-2 text-gray-400 text-[10px]">
                      {market.asset}
                    </td>
                    <td className="px-1 py-2 text-gray-300 max-w-[200px] truncate">
                      {market.title}
                    </td>
                    <td className="text-right px-2 py-2 text-cyan-400 tabular-nums">
                      {market.midPrice.toFixed(2)}
                    </td>
                    <td className="text-right px-2 py-2 text-purple-400 tabular-nums">
                      {market.fairPrice.toFixed(2)}
                    </td>
                    <td className={`text-right px-2 py-2 tabular-nums ${divColor}`}>
                      {market.divergence > 0 ? "+" : ""}
                      {(market.divergence * 100).toFixed(2)}%
                    </td>
                    <td className={`text-right px-4 py-2 font-bold ${signalColor}`}>
                      {market.signal}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
