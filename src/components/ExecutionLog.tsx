"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { LogEntry } from "@/lib/types";

interface ExecutionLogProps {
  entries: LogEntry[];
}

export default function ExecutionLog({ entries }: ExecutionLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  return (
    <div className="border border-gray-700 rounded-sm bg-gray-900/50 flex flex-col min-h-0">
      <div className="px-4 py-2 border-b border-gray-700">
        <span className="text-[10px] tracking-widest text-gray-500 uppercase">
          EXECUTION LOG
        </span>
      </div>
      <div ref={scrollRef} className="overflow-y-auto flex-1 max-h-64 font-mono">
        {entries.length === 0 ? (
          <div className="p-4 text-gray-600 text-sm">
            Waiting for signals...
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {entries.map((entry, i) => {
              const color =
                entry.signal === "BUY"
                  ? "text-green-400"
                  : entry.signal === "SELL"
                  ? "text-red-400"
                  : "text-gray-500";

              const typeColor =
                entry.type === "SIGNAL"
                  ? "text-yellow-400"
                  : entry.type === "WARNING"
                  ? "text-red-400"
                  : "text-gray-500";

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.01 }}
                  className="flex gap-2 text-[11px] leading-relaxed"
                >
                  <span className="text-gray-600 tabular-nums shrink-0">
                    {formatTime(entry.timestamp)}
                  </span>
                  <span className={`shrink-0 ${typeColor}`}>
                    [{entry.type}]
                  </span>
                  <span className={color}>{entry.message}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
