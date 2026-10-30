import React from "react";
import { DollarSign, TrendingUp, CreditCard } from "lucide-react";
import type { RevenueInvoice, BranchPerformance } from "./types";
import { RevenueOverviewLedger } from "./components/RevenueOverviewLedger";

const MOCK_INVOICES: RevenueInvoice[] = [
  {
    id: "INV-1024",
    studentName: "Siyabonga Mabuza",
    courseCode: "Code 8",
    amount: 2400,
    paymentStatus: "Paid",
    branch: "Empangeni",
    timestamp: "16:12",
  },
  {
    id: "INV-1023",
    studentName: "Amare Khumalo",
    courseCode: "Code 10",
    amount: 4500,
    paymentStatus: "Paid",
    branch: "Empangeni",
    timestamp: "15:30",
  },
  {
    id: "INV-1022",
    studentName: "Zane Pillay",
    courseCode: "Code 14",
    amount: 6800,
    paymentStatus: "Pending",
    branch: "Richards Bay",
    timestamp: "14:15",
  },
];

const MOCK_BRANCHES: BranchPerformance[] = [
  {
    branchName: "Empangeni Central",
    totalCollected: 6900,
    pendingInvoices: 0,
    activeLessonsCount: 8,
  },
  {
    branchName: "Richards Bay Hub",
    totalCollected: 0,
    pendingInvoices: 6800,
    activeLessonsCount: 3,
  },
];

export const RevenueEngine: React.FC = () => {
  const totalCollected = MOCK_BRANCHES.reduce(
    (acc, b) => acc + b.totalCollected,
    0,
  );
  const totalPending = MOCK_BRANCHES.reduce(
    (acc, b) => acc + b.pendingInvoices,
    0,
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Section Header */}
      <div className="border-b border-zinc-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-orange-600" /> Revenue Engine
          command
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Track localized high-margin package volumes, billing audits, and
          outstanding regional pipeline positions.
        </p>
      </div>

      {/* Analytics Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Gross Income Today
            </p>
            <p className="text-2xl font-bold mt-1 text-zinc-900">
              R {totalCollected}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Pipeline Receivables
            </p>
            <p className="text-2xl font-bold mt-1 text-zinc-900">
              R {totalPending}
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-orange-50/20 border border-orange-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
              Consolidated Total
            </p>
            <p className="text-2xl font-bold mt-1 text-orange-600">
              R {totalCollected + totalPending}
            </p>
          </div>
          <div className="p-3 bg-orange-600 rounded-xl text-white shadow-sm">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Tables Execution Render */}
      <RevenueOverviewLedger
        invoices={MOCK_INVOICES}
        branches={MOCK_BRANCHES}
      />
    </div>
  );
};
