import React, { useState, useEffect } from "react";
import { queueService } from "../services/queueService";
import type { IWeeklyReportResponse } from "../services/queueService";
import {
  ArrowLeft,
  Clock,
  Activity,
  Zap,
  ShieldAlert,
  BarChart3,
  Calendar,
  RefreshCw,
  Users,
  CheckCircle2,
  XCircle,
  Car,
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
import { studentService } from "../../student/services/studentService";

interface AnalyticsPanelProps {
  companyId?: string;
  logs: any[];
  averageWaitTime: string;
  bestWaitTime: string;
  worstWaitTime: string;
  totalCompletedCount: number;
  businessName: string;
  onClose: () => void;
}

const getDefaultMondayRange = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);

  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);

  return {
    start: monday.toISOString().slice(0, 10),
    end: nextMonday.toISOString().slice(0, 10),
  };
};
export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  companyId,
  logs,
  averageWaitTime,
  bestWaitTime,
  worstWaitTime,
  totalCompletedCount,
  onClose,
}) => {
  const defaultRange = getDefaultMondayRange();
  const [startDate, setStartDate] = useState<string>(defaultRange.start);
  const [endDate, setEndDate] = useState<string>(defaultRange.end);

  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [weeklyReport, setWeeklyReport] =
    useState<IWeeklyReportResponse | null>(null);
  const [isGraphLoading, setIsGraphLoading] = useState<boolean>(false);
  const [toppingUpId, setToppingUpId] = useState<string | null>(null);

  const handleRecordTopUp = async (
    enrollmentId: string | null,
    studentName: string,
    missingBalance: number,
  ) => {
    if (!enrollmentId) return;

    const input = window.prompt(
      `${studentName} owes R${missingBalance.toLocaleString()}.\nEnter the Rand amount being paid now:`,
      String(missingBalance),
    );

    if (input === null) return; // User clicked Cancel
    const amount = Number(input.trim());

    if (Number.isNaN(amount) || amount <= 0) {
      alert("Please enter a valid Rand amount greater than 0.");
      return;
    }

    setToppingUpId(enrollmentId);
    try {
      await studentService.recordEnrollmentPayment(enrollmentId, amount);
      await fetchMetrics(); // Immediately refreshes Expected, Collected, Missing & table row
    } catch (err: any) {
      console.error("Failed recording payment top-up:", err);
      alert(
        err?.response?.data?.error ||
          "Could not record payment top-up. Please try again.",
      );
    } finally {
      setToppingUpId(null);
    }
  };

  const fetchMetrics = async () => {
    setIsGraphLoading(true);
    try {
      const [crossBranch, reportData] = await Promise.all([
        queueService
          .getCrossBranchAnalytics(startDate, endDate)
          .catch(() => []),
        companyId
          ? queueService.getCompanyWeeklyReport(
              companyId,
              new Date(`${startDate}T00:00:00`).toISOString(),
              new Date(`${endDate}T00:00:00`).toISOString(),
            )
          : Promise.resolve(null),
      ]);

      setComparisonData(crossBranch);
      setWeeklyReport(reportData);
    } catch (err) {
      console.error("Failed loading analytics telemetry:", err);
    } finally {
      setIsGraphLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [startDate, endDate, companyId]);

  const processHourlyTimelineData = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8);
    return hours.map((hour) => {
      const label = `${hour.toString().padStart(2, "0")}:00`;
      const matches = logs.filter((log) => {
        const d = new Date(log.addedAt);
        return d.getHours() === hour;
      });
      return {
        time: label,
        "Check-Ins": matches.length,
      };
    });
  };

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-ZA", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
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
            Monday-to-Monday student registrations, payment statuses, and
            instructor lesson logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white border border-zinc-200 px-3 py-1.5 rounded-xl shadow-sm text-xs font-semibold text-zinc-700">
            <Calendar className="h-3.5 w-3.5 text-orange-600" />
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
            <h3 className="text-2xl font-black text-zinc-900">
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
      {/* TABLE 1: NEW STUDENTS REGISTERED & REVENUE LEDGER (MONDAY TO MONDAY) */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                New Students & Revenue Ledger (
                {weeklyReport?.summary.totalNewStudents ?? 0})
              </h3>
              <p className="text-[11px] text-zinc-400">
                Monday-to-Monday registrations, course prices, cash collected,
                and missing balances.
              </p>
            </div>
          </div>

          {weeklyReport && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200">
                Expected: R
                {weeklyReport.summary.totalExpectedRevenue.toLocaleString()}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                Collected: R
                {weeklyReport.summary.totalCollectedRevenue.toLocaleString()}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200">
                Missing: R
                {weeklyReport.summary.totalMissingBalance.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {isGraphLoading ? (
            <div className="py-8 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-orange-500" />
              Loading student registrations & revenue...
            </div>
          ) : !weeklyReport || weeklyReport.registeredLearners.length === 0 ? (
            <div className="text-zinc-400 text-xs font-medium border border-dashed border-zinc-200 rounded-xl p-8 text-center">
              No new students registered during this Monday-to-Monday window.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Branch</th>
                  <th className="py-2.5 px-3">Service / Code</th>
                  <th className="py-2.5 px-3">Course Price</th>
                  <th className="py-2.5 px-3">Amount Paid</th>
                  <th className="py-2.5 px-3">Missing</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {weeklyReport.registeredLearners.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-zinc-50/80 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-zinc-900">
                        {student.name}
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {student.phone || student.email}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-zinc-700">
                      {student.branchName}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-zinc-100 text-zinc-800">
                        {student.code}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-zinc-700">
                      R{student.supposedPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      R{student.amountPaid.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {student.missingBalance > 0 ? (
                        <span className="text-red-600">
                          R{student.missingBalance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-zinc-400">R0</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        {student.isPaid && student.missingBalance === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" /> Paid
                          </span>
                        ) : student.amountPaid > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Deposit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="h-3 w-3" /> Unpaid
                          </span>
                        )}

                        {student.missingBalance > 0 && student.enrollmentId && (
                          <button
                            type="button"
                            disabled={toppingUpId === student.enrollmentId}
                            onClick={() =>
                              handleRecordTopUp(
                                student.enrollmentId,
                                student.name,
                                student.missingBalance,
                              )
                            }
                            className="px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50"
                          >
                            {toppingUpId === student.enrollmentId
                              ? "Saving..."
                              : "+ Top Up"}
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-[11px] text-zinc-500 whitespace-nowrap">
                      {formatDateTime(student.joinedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* TABLE 2: COMPLETED LESSONS & INSTRUCTOR AUDIT LOG (MONDAY TO MONDAY) */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Car className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900">
              Completed Lessons Log (
              {weeklyReport?.summary.totalLessonsCompleted ?? 0})
            </h3>
            <p className="text-[11px] text-zinc-400">
              Tracks which student drove, what licence code they trained on, and
              which instructor helped them.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isGraphLoading ? (
            <div className="py-8 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-500" />
              Loading completed lessons...
            </div>
          ) : !weeklyReport || weeklyReport.completedLessons.length === 0 ? (
            <div className="text-zinc-400 text-xs font-medium border border-dashed border-zinc-200 rounded-xl p-8 text-center">
              No lessons completed during this Monday-to-Monday window.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Code Driven</th>
                  <th className="py-2.5 px-3">Instructor</th>
                  <th className="py-2.5 px-3">Branch</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Completed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {weeklyReport.completedLessons.map((lesson) => (
                  <tr
                    key={lesson._id}
                    className="hover:bg-zinc-50/80 transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-zinc-900">
                      {lesson.studentName}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-100">
                        {lesson.code}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-zinc-800">
                      {lesson.instructorName}
                    </td>
                    <td className="py-3 px-3 text-zinc-600">
                      {lesson.branchName}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-zinc-600">
                      {lesson.handlingDurationMins} mins
                    </td>
                    <td className="py-3 px-3 text-[11px] text-zinc-500 whitespace-nowrap">
                      {formatDateTime(lesson.completedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* DYNAMIC DATA GRAPHING CONTAINER LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
