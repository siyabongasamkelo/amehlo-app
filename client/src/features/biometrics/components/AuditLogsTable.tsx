import React from "react";
import { ShieldAlert, UserCheck, Eye } from "lucide-react";
import type { BiometricAuditLog } from "../types";

interface TableProps {
  logs: BiometricAuditLog[];
  selectedId: string;
  onSelectLog: (log: BiometricAuditLog) => void;
}

export const AuditLogsTable: React.FC<TableProps> = ({
  logs,
  selectedId,
  onSelectLog,
}) => {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
      <div>
        <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              System Verification History
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Real-time cross-reference verification streams preventing vehicle
              misuse and instructor fraud.
            </p>
          </div>
          <span className="text-xs bg-zinc-100 text-zinc-600 font-bold px-2.5 py-1 rounded-full border border-zinc-200">
            {logs.length} Total Logs Checked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="px-5 py-3">Student & Token</th>
                <th className="px-5 py-3">Vehicle / Instructor</th>
                <th className="px-5 py-3">Match Score</th>
                <th className="px-5 py-3">Status Gate</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className={`hover:bg-zinc-50/50 transition-colors cursor-pointer ${
                    selectedId === log.id
                      ? "bg-orange-50/20 text-zinc-900"
                      : "text-zinc-600"
                  }`}
                  onClick={() => onSelectLog(log)}
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-bold text-zinc-900">
                      {log.studentName}
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
                      {log.id} • {log.courseCode}
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-semibold text-zinc-800">
                      {log.vehicleReg}
                    </div>
                    <div className="text-zinc-400 mt-0.5">
                      {log.instructorName}
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            log.status === "VERIFIED"
                              ? "bg-emerald-500"
                              : log.status === "FAILED"
                                ? "bg-red-500"
                                : "bg-amber-500"
                          }`}
                          style={{ width: `${log.matchScore}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-zinc-600">
                        {log.matchScore}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {log.status === "VERIFIED" && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-xl">
                        <UserCheck className="h-3 w-3" /> VERIFIED
                      </span>
                    )}
                    {log.status === "FAILED" && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-red-600 font-bold bg-red-50 border border-red-100 px-2 py-0.5 rounded-xl">
                        <ShieldAlert className="h-3 w-3" /> FRAUD ALERT
                      </span>
                    )}
                    {log.status === "PENDING_REVIEW" && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-xl">
                        ⚠️ NO STREAM
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button className="text-orange-600 hover:text-orange-700 font-bold inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
