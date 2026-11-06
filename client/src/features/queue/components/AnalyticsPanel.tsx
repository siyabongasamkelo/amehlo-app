import React from "react";
import {
  ArrowLeft,
  Clock,
  Activity,
  Zap,
  ShieldAlert,
  BarChart3,
} from "lucide-react";

interface AnalyticsPanelProps {
  logs: any[];
  averageWaitTime: string;
  bestWaitTime: string;
  worstWaitTime: string;
  totalCompletedCount: number;
  businessName: string;
  onClose: () => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  logs,
  averageWaitTime,
  bestWaitTime,
  worstWaitTime,
  totalCompletedCount,
  businessName,
  onClose,
}) => {
  console.log("Analytics In Component", worstWaitTime);

  // 🕒 CALCULATE TRAFFIC PEAK TIME WINDOW DENSITIES LOCALLY
  const calculatePeakHour = (): string => {
    if (!logs || logs.length === 0) return "No data logged yet";

    const hourTally: { [key: number]: number } = {};
    logs.forEach((log) => {
      const logDate =
        typeof log.addedAt === "number" ? new Date(log.addedAt) : new Date();
      const hour = logDate.getHours();
      hourTally[hour] = (hourTally[hour] || 0) + 1;
    });

    let peakHourStr = "Calculating...";
    let maxCount = 0;
    Object.entries(hourTally).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        const hrNum = Number(hour);
        peakHourStr = `${hrNum}:00 - ${hrNum + 1}:00 (${count} check-ins)`;
      }
    });

    return peakHourStr;
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Operations Analytics
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Performance tracking intelligence for {businessName}.
          </p>
        </div>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Live Queue
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: VELOCITY AVERAGE */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Avg Wait Runtime
            </span>
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-zinc-900 tracking-tight leading-none">
              {averageWaitTime}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 font-medium">
              Mean customer pipeline speed.
            </p>
          </div>
        </div>

        {/* CARD 2: THROUGHPUT CAPACITY */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Throughput
            </span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-zinc-900 tracking-tight leading-none">
              {totalCompletedCount} Served
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 font-medium">
              Completed interactions today.
            </p>
          </div>
        </div>

        {/* CARD 3: RECORD VELOCITY */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Record Turnaround
            </span>
            <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-emerald-600 tracking-tight leading-none">
              {bestWaitTime}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 font-medium">
              Fastest transaction speed log.
            </p>
          </div>
        </div>

        {/* CARD 4: BOTTLENECK FRUSTRATION CAP */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Peak Wait Barrier
            </span>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-red-600 tracking-tight leading-none">
              {worstWaitTime}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 font-medium">
              Slowest ticket response capture.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-2xl p-6 shadow-sm border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-orange-500 flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> High-Density Traffic Analysis
          </h4>
          <p className="text-sm font-semibold tracking-tight text-zinc-100">
            Current session tracking flags this as your peak window:
          </p>
        </div>
        <div className="px-4 py-2 bg-white/10 border border-white/15 font-mono text-xs font-bold text-orange-400 rounded-xl shrink-0">
          {calculatePeakHour()}
        </div>
      </div>
    </div>
  );
};
