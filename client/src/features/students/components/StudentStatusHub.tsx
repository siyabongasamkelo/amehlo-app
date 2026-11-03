import React from "react";
import { Clock, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { MasterProfile, QueueItem } from "../../queue/types/queue";

interface StudentStatusHubProps {
  currentStudent: MasterProfile;
  myActiveSession: QueueItem | undefined;
  isBlocked: boolean;
  onUpgradePremium: (id: string) => void;
}

export const StudentStatusHub: React.FC<StudentStatusHubProps> = ({
  currentStudent,
  myActiveSession,
  isBlocked,
  onUpgradePremium,
}) => {
  return (
    <div className="space-y-4">
      {/* WELCOME IDENTITY BADGE GRID */}
      <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
        <div className="relative h-12 w-12 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center">
          {currentStudent.masterSelfieUrl ? (
            <img
              src={currentStudent.masterSelfieUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-bold text-sm text-zinc-400 uppercase">
              {currentStudent.name.slice(0, 2)}
            </span>
          )}
          <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full" />
        </div>
        <div className="overflow-hidden">
          <h2 className="font-bold text-base text-zinc-900 tracking-tight truncate">
            Molo, {currentStudent.name.split(" ")[0]}
          </h2>
          <p className="text-xs text-zinc-400 truncate">
            {currentStudent.drivingSchool} • {currentStudent.branch} Branch
          </p>
        </div>
      </div>

      {/* CONDITIONAL OPERATIONAL FEED */}
      {myActiveSession ? (
        <div
          className={`border rounded-2xl p-5 relative overflow-hidden shadow-sm transition-all duration-300 bg-white ${
            myActiveSession.status === "Active"
              ? "border-emerald-500 shadow-emerald-50"
              : myActiveSession.isPremium
                ? "border-orange-400"
                : "border-zinc-200"
          }`}
        >
          {myActiveSession.isPremium && (
            <div className="absolute top-0 right-0 bg-orange-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-bl-lg flex items-center gap-1">
              <Zap className="h-2.5 w-2.5 fill-white" /> VIP BYPASS
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-zinc-400 block">
                  YOUR ACTIVE TRANSACTION BLOCK
                </span>
                <h3 className="font-black text-lg text-zinc-900 tracking-tight">
                  {myActiveSession.status === "Active"
                    ? "🎉 You are in the Car!"
                    : `Position #${myActiveSession.position} in Line`}
                </h3>
              </div>
              <div
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${myActiveSession.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-zinc-100 text-zinc-700"}`}
              >
                {myActiveSession.status}
              </div>
            </div>

            <div className="bg-zinc-50 border border-zinc-100/80 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Instructor:</span>
                <span className="font-bold text-zinc-700">
                  {myActiveSession.assignedInstructor}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Fleet Class:</span>
                <span className="font-bold text-zinc-700">
                  {myActiveSession.targetCourseCode}
                </span>
              </div>
              <div className="pt-2 border-t border-zinc-200/60 flex justify-between items-center">
                <span className="text-zinc-400 font-medium flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-orange-600" />
                  {myActiveSession.status === "Active"
                    ? "Time Remaining:"
                    : "Est. Wait Time:"}
                </span>
                <span
                  className={`font-black text-sm ${myActiveSession.status === "Active" ? "text-emerald-600" : "text-zinc-900"}`}
                >
                  {myActiveSession.status === "Active"
                    ? myActiveSession.elapsed
                    : myActiveSession.estWait}
                </span>
              </div>
            </div>

            {!myActiveSession.isPremium &&
              myActiveSession.status !== "Active" && (
                <button
                  onClick={() => onUpgradePremium(myActiveSession.id)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-orange-600/10 transition-all cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5 fill-white animate-pulse" /> Skip
                  the Line? Pay R100 Priority Fee
                </button>
              )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider">
              Session Check-In Engine
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              You are currently outside the queue. Ask the front desk
              receptionist to scan your token key to insert you into today's
              timeline loop.
            </p>
          </div>

          {isBlocked ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-red-800 uppercase tracking-wider">
                  BLOCKED: NO CREDIT CLEARANCE
                </div>
                <p className="text-xs text-red-600/90 leading-normal">
                  Clear your ledger account balances at the physical desk office
                  to unlock active session allocation slots.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Account
                Cleared for Sessions
              </div>
              <span className="font-mono bg-white px-2 py-0.5 border border-emerald-200 text-emerald-700 font-bold rounded">
                {currentStudent.defaultCourseCode}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
