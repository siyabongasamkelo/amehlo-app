import React from "react";
import { Layers, Clock, CheckCircle2 } from "lucide-react";

interface QueueMetricsBarProps {
  queueLength: number;
  averageWaitTime: string;
  totalCompletedCount: number;
}

export const QueueMetricsBar: React.FC<QueueMetricsBarProps> = ({
  queueLength,
  averageWaitTime,
  totalCompletedCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Active Queue Capacity
          </p>
          <p className="text-2xl font-black mt-1 text-zinc-900">
            {queueLength} Holding
          </p>
        </div>
        <div className="p-3 bg-zinc-50 rounded-xl text-zinc-500 border border-zinc-100">
          <Layers className="h-5 w-5" />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Avg Processing Time
          </p>
          <p className="text-2xl font-black mt-1 text-zinc-900">
            {averageWaitTime}
          </p>
        </div>
        <div className="p-3 bg-zinc-50 rounded-xl text-zinc-500 border border-zinc-100">
          <Clock className="h-5 w-5" />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Total Output Served
          </p>
          <p className="text-2xl font-black mt-1 text-emerald-600">
            {totalCompletedCount} Served
          </p>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
