import React from "react";
import { Layers, Clock, CheckCircle } from "lucide-react";
import type { QueueItem } from "../types/queue";
import type { CompletionLog } from "../QueueDashboard";

interface MetricCardsProps {
  queue: QueueItem[];
  logs: CompletionLog[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ queue, logs }) => {
  // Dynamically calculate actual wait processing performance metrics based on admin completion history
  const calculateAverageWaitTime = (): string => {
    if (logs.length === 0) return "20 mins"; // Falling back safely to baseline when queue logs are fresh

    const totalDurationMs = logs.reduce((acc, current) => {
      return acc + (current.completedAt - current.addedAt);
    }, 0);

    const averageMinutes = Math.round(totalDurationMs / 1000 / 60);
    return averageMinutes > 0 ? `${averageMinutes} mins` : "1 min";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* CARD 1: CURRENT LIVE STACK LOAD */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Total Active Queue
          </p>
          <p className="text-2xl font-bold mt-1 text-zinc-900">
            {queue.length} People
          </p>
        </div>
        <div className="p-3 bg-zinc-50 rounded-xl text-zinc-500 border border-zinc-100">
          <Layers className="h-5 w-5" />
        </div>
      </div>

      {/* CARD 2: DYNAMIC HISTORICAL VELOCITY SPEED */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Avg. Processing Time
          </p>
          <p className="text-2xl font-bold mt-1 text-zinc-900">
            {calculateAverageWaitTime()}
          </p>
        </div>
        <div className="p-3 bg-zinc-50 rounded-xl text-zinc-500 border border-zinc-100">
          <Clock className="h-5 w-5" />
        </div>
      </div>

      {/* CARD 3: THROUGHPUT TRACKER */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Served Today
          </p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">
            {logs.length} Completed
          </p>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
          <CheckCircle className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
