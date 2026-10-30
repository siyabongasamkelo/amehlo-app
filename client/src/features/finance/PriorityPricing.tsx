import React, { useState } from "react";
import { Zap, TrendingUp, Users, Sliders } from "lucide-react";
import type { QueueItem } from "../queue/types/queue";

interface PriorityPricingProps {
  queue: QueueItem[];
}

// Simple historical mock data for line-skips to populate the audit ledger
const INITIAL_PREMIUM_LOGS = [
  {
    id: "tx_1",
    name: "Amare Khumalo",
    time: "10:14 AM",
    feePaid: 100,
    status: "Completed",
  },
  {
    id: "tx_2",
    name: "Zane Pillay",
    time: "11:30 AM",
    feePaid: 100,
    status: "Completed",
  },
  {
    id: "tx_3",
    name: "Siyabonga Mabuza",
    time: "02:15 PM",
    feePaid: 100,
    status: "Active in Queue",
  },
];

export const PriorityPricing: React.FC<PriorityPricingProps> = ({ queue }) => {
  const [premiumFee, setPremiumFee] = useState<number>(100);
  const [logs, setLogs] = useState(INITIAL_PREMIUM_LOGS);

  // Calculate live numbers based on the queue state handed down from the orchestrator
  const currentLivePremiumCount = queue.filter((item) => item.isPremium).length;
  const historicTotalRevenue = logs.reduce((acc, log) => acc + log.feePaid, 0);
  const liveQueueRevenue = currentLivePremiumCount * premiumFee;

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="border-b border-zinc-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-600 fill-current" /> Priority
          Pricing Engine
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Configure on-demand premium line bypass parameters and track
          convenience margin revenues.
        </p>
      </div>

      {/* REVENUE INSIGHT METRICS BLOCKS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Config Summary */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Active Skip Rate
            </p>
            <p className="text-2xl font-bold mt-1 text-zinc-900">
              R {premiumFee}
            </p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl text-zinc-500 border border-zinc-100">
            <Sliders className="h-5 w-5" />
          </div>
        </div>

        {/* Live Queue Velocity Added Value */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Live Premium Bypasses
            </p>
            <p className="text-2xl font-bold mt-1 text-zinc-900">
              {currentLivePremiumCount} Students
            </p>
          </div>
          <div className="p-3 bg-orange-50/50 rounded-xl text-orange-600 border border-orange-100/30">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Micro-Transaction Vault */}
        <div className="bg-gradient-to-br from-white to-orange-50/20 border border-orange-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
              Total Premium Collected
            </p>
            <p className="text-2xl font-bold mt-1 text-orange-600">
              R {historicTotalRevenue + liveQueueRevenue}
            </p>
          </div>
          <div className="p-3 bg-orange-600 rounded-xl text-white shadow-sm shadow-orange-600/20">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ENGINE CONTROLS & LEDGER LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Setting Engine Tweaker */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
              Fee Customisation
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Adjust how much convenience friction to charge for jumping
              position priority loops.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-zinc-600">
              Bypass Fee Tier (ZAR)
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setPremiumFee(100)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${premiumFee === 100 ? "bg-orange-600 text-white border-orange-600" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"}`}
              >
                R100
              </button>
              <button
                onClick={() => setPremiumFee(150)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${premiumFee === 150 ? "bg-orange-600 text-white border-orange-600" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"}`}
              >
                R150
              </button>
              <button
                onClick={() => setPremiumFee(200)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${premiumFee === 200 ? "bg-orange-600 text-white border-orange-600" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"}`}
              >
                R200
              </button>
            </div>
          </div>

          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-500 leading-relaxed">
            💡 <strong className="text-zinc-700">Prototype Note:</strong>{" "}
            Updating this configuration immediately affects estimated premium
            collections from existing unserviced tokens on the live screen
            matrix.
          </div>
        </div>

        {/* Right: Dynamic High-Margin Ledger */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                Premium Shortcut Audit Trail
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Historical verification ledger of transactional bypass
                activations processed today.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    <th className="px-5 py-3">Transaction ID</th>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3">Execution Time</th>
                    <th className="px-5 py-3">Amount Collected</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {/* Append any items from the active working queue that match premium criteria */}
                  {queue
                    .filter((q) => q.isPremium)
                    .map((item) => (
                      <tr
                        key={item.id}
                        className="bg-orange-50/20 text-zinc-900 font-medium"
                      >
                        <td className="px-5 py-4 font-mono text-[11px] text-orange-600">
                          tx_live_{item.id.slice(-4)}
                        </td>
                        <td className="px-5 py-4 font-bold">
                          {item.profile.name}
                        </td>
                        <td className="px-5 py-4 text-zinc-500">Just Now</td>
                        <td className="px-5 py-4 font-bold text-orange-600">
                          R {premiumFee}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold text-[10px]">
                            Queue Active
                          </span>
                        </td>
                      </tr>
                    ))}

                  {/* Render standard historical seed states */}
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-zinc-50/50 transition-colors text-zinc-600"
                    >
                      <td className="px-5 py-4 font-mono text-[11px] text-zinc-400">
                        {log.id}
                      </td>
                      <td className="px-5 py-4 font-semibold text-zinc-900">
                        {log.name}
                      </td>
                      <td className="px-5 py-4 text-zinc-400">{log.time}</td>
                      <td className="px-5 py-4 font-bold text-zinc-900">
                        R {log.feePaid}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[10px]">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
