import React from "react";
import { Layers, Clock, CreditCard } from "lucide-react";
import type { QueueItem } from "../types/queue";

interface MetricCardsProps {
  queue: QueueItem[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ queue }) => {
  const premiumCount = queue.filter((q) => q.isPremium).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Total Active Queue
          </p>
          <p className="text-2xl font-bold mt-1 text-zinc-900">
            {queue.length} Students
          </p>
        </div>
        <div className="p-3 bg-zinc-50 rounded-xl text-zinc-500 border border-zinc-100">
          <Layers className="h-5 w-5" />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Est. Processing Baseline
          </p>
          <p className="text-2xl font-bold mt-1 text-zinc-900">
            40 mins / slot
          </p>
        </div>
        <div className="p-3 bg-zinc-50 rounded-xl text-zinc-500 border border-zinc-100">
          <Clock className="h-5 w-5" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-orange-50/30 border border-orange-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
            Priority Revenue
          </p>
          <p className="text-2xl font-bold mt-1 text-orange-600">
            R {premiumCount * 100}
          </p>
        </div>
        <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl text-orange-600">
          <CreditCard className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
