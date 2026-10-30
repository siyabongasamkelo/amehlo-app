import React from "react";
import { CheckCircle2, Clock } from "lucide-react";
import type { RevenueInvoice, BranchPerformance } from "../types";

interface LedgerProps {
  invoices: RevenueInvoice[];
  branches: BranchPerformance[];
}

export const RevenueOverviewLedger: React.FC<LedgerProps> = ({
  invoices,
  branches,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Branch Cashflow Matrix Breakdown */}
      <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden h-fit">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Regional Branch Metrics
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Live performance across tracking hubs.
          </p>
        </div>
        <div className="divide-y divide-zinc-100">
          {branches.map((b) => (
            <div
              key={b.branchName}
              className="p-4 space-y-2 hover:bg-zinc-50/30 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-zinc-900 text-sm">
                  {b.branchName}
                </span>
                <span className="text-[10px] font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-500 font-bold border border-zinc-200">
                  {b.activeLessonsCount} Lessons Today
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-emerald-50/30 border border-emerald-100 p-2 rounded-xl">
                  <div className="text-[10px] font-semibold text-emerald-600 uppercase">
                    Collected
                  </div>
                  <div className="font-bold text-emerald-700 mt-0.5">
                    R {b.totalCollected}
                  </div>
                </div>
                <div className="bg-amber-50/30 border border-amber-100 p-2 rounded-xl">
                  <div className="text-[10px] font-semibold text-amber-600 uppercase">
                    Pending
                  </div>
                  <div className="font-bold text-amber-700 mt-0.5">
                    R {b.pendingInvoices}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Dynamic Invoice Shortcut Trail */}
      <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
        <div>
          <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <div>
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Recent Transaction Ledger
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Historical verification trail of registrations processed today.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 font-semibold uppercase tracking-wider">
                  <th className="px-5 py-3">Invoice Reference</th>
                  <th className="px-5 py-3">Student & Branch</th>
                  <th className="px-5 py-3">Course Type</th>
                  <th className="px-5 py-3">Amount Charged</th>
                  <th className="px-5 py-3 text-right">Status Gate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-zinc-50/50 transition-colors text-zinc-600"
                  >
                    <td className="px-5 py-4 font-mono text-[11px] text-zinc-400">
                      {inv.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-zinc-900">
                        {inv.studentName}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {inv.branch} Hub
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-zinc-700">
                      {inv.courseCode}
                    </td>
                    <td className="px-5 py-4 font-bold text-zinc-900">
                      R {inv.amount}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {inv.paymentStatus === "Paid" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="h-3 w-3" /> CLEAR
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                          <Clock className="h-3 w-3" /> PENDING
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
