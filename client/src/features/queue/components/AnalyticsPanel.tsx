import React, { useState, useEffect } from "react";
import { queueService } from "../services/queueService";
import {
  ArrowLeft,
  Clock,
  Activity,
  Zap,
  ShieldAlert,
  BarChart3,
  Calendar,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

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
  onClose,
}) => {
  // 📅 1. DATE PICKER STATE VALUES (Defaulting to trailing 7 days)
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });

  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [isGraphLoading, setIsGraphLoading] = useState<boolean>(false);

  // 🔄 2. DISPATCH NETWORK REQUESTS FOR CROSS-BRANCH RECORDS
  const fetchMetrics = async () => {
    setIsGraphLoading(true);
    try {
      const data = await queueService.getCrossBranchAnalytics(
        startDate,
        endDate,
      );
      setComparisonData(data);
    } catch (err) {
      console.error("Failed loading cross branch aggregation matrices:", err);
    } finally {
      setIsGraphLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [startDate, endDate]);

  // 🕒 3. COMPUTE LOCAL DENSITIES FOR LIVE HOURLY LOADS
  const processHourlyTimelineData = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // Business hours tracking: 08:00 to 19:00
    return hours.map((hour) => {
      const label = `${hour.toString().padStart(2, "0")}:00`;
      const matches = logs.filter((log) => {
        const d =
          typeof log.addedAt === "number"
            ? new Date(log.addedAt)
            : new Date(log.addedAt);
        return d.getHours() === hour;
      });
      return {
        time: label,
        "Check-Ins": matches.length,
      };
    });
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
      {/* HEADER COCKPIT GRID CONTROL PANEL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Operations Intelligence
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Unified performance evaluation dashboard.
          </p>
        </div>

        {/* FRONTEND DATE CONTEXT SELECTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white border border-zinc-200 px-3 py-1.5 rounded-xl shadow-sm text-xs font-semibold text-zinc-700">
            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="outline-none bg-transparent cursor-pointer"
            />
            <span className="text-zinc-300 font-normal">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="outline-none bg-transparent cursor-pointer"
            />
          </div>

          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer ml-auto md:ml-0"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Live Station
          </button>
        </div>
      </div>

      {/* METRIC INTELLIGENCE SINGLE BRANCH DISPLAY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Avg Processing Speed
            </span>
            <Clock className="h-4 w-4 text-orange-600" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-zinc-900 ">
              {averageWaitTime}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 font-medium">
              Active stream mean duration velocity.
            </p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Current Station Output
            </span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-zinc-900">
              {totalCompletedCount} Serviced
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 font-medium">
              Completed interactions inside branch.
            </p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Peak Velocity Record
            </span>
            <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-emerald-600">
              {bestWaitTime}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 font-medium">
              Fastest transaction entry archived.
            </p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Max Delays Caught
            </span>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-red-600">
              {worstWaitTime}
            </h3>
            <p className="text-[10px] text-zinc-400 mt-1 font-medium">
              Worst tracking lane incident recorded.
            </p>
          </div>
        </div>
      </div>

      {/* DYNAMIC DATA GRAPHING CONTAINER LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRAPH 1: CROSS-BRANCH SYSTEM LEADERBOARD */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                Cross-Branch Speed Comparisons
              </h3>
              <p className="text-[11px] text-zinc-400">
                Ranks stations from shortest to longest wait times.
              </p>
            </div>
            <BarChart3 className="h-4 w-4 text-zinc-400" />
          </div>

          <div className="h-64 flex items-center justify-center relative">
            {isGraphLoading ? (
              <div className="text-zinc-400 text-xs font-semibold flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-orange-500" />{" "}
                Analyzing company telemetry...
              </div>
            ) : comparisonData.length === 0 ? (
              <div className="text-zinc-400 text-xs font-medium border border-dashed border-zinc-200 rounded-xl p-8 w-full text-center">
                No logs recorded across locations matching this calendar date
                filter.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonData}
                  layout="vertical"
                  margin={{ left: 10, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis
                    type="number"
                    label={{
                      value: "Minutes",
                      position: "insideBottom",
                      offset: -5,
                    }}
                    stroke="#a1a1aa"
                    fontSize={10}
                  />
                  <YAxis
                    dataKey="branchId"
                    type="category"
                    stroke="#a1a1aa"
                    fontSize={10}
                    width={75}
                    tickFormatter={(val) => `ID: ${val.substring(0, 6)}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e4e4e7",
                    }}
                    formatter={(value) => [`${value} Mins`, "Avg Wait Time"]}
                  />
                  <Bar dataKey="avgWaitTime" fill="#ea580c" barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GRAPH 2: PEAK HOUR TRAFFIC FLOW DENSITY TIMELINE */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">
              Branch Traffic Curve
            </h3>
            <p className="text-[11px] text-zinc-400">
              Maps check-in volume against operation hours to isolate rushes.
            </p>
          </div>

          <div className="h-64">
            {logs.length === 0 ? (
              <div className="text-zinc-400 text-xs font-medium border border-dashed border-zinc-200 rounded-xl p-8 h-full w-full flex items-center justify-center text-center">
                No transactions recorded today to map traffic density.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={processHourlyTimelineData()}
                  margin={{ top: 10, right: 10, bottom: 5, left: -20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="time" stroke="#a1a1aa" fontSize={10} />
                  <YAxis stroke="#a1a1aa" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e4e4e7",
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Check-Ins"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
