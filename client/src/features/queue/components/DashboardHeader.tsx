import React, { useState } from "react";
import {
  Settings,
  BarChart3,
  MapPin,
  ChevronDown,
  Monitor,
  QrCode,
  LogOut,
} from "lucide-react";

interface DashboardHeaderProps {
  userRole?: string;
  branches: any[];
  activeBranchId: string | null;
  currentBranch: any;
  onSelectBranch: (branchId: string) => void;
  onOpenQr: () => void;
  onOpenTv: () => void;
  onOpenAnalytics: () => void;
  onNavigateBranches: () => void;
  onSignOut: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userRole,
  branches,
  activeBranchId,
  currentBranch,
  onSelectBranch,
  onOpenQr,
  onOpenTv,
  onOpenAnalytics,
  onNavigateBranches,
  onSignOut,
}) => {
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-5">
      <div className="space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">
          Live Operations Cockpit
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <div className="relative">
            <button
              disabled={userRole === "worker"}
              onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
              className={`inline-flex items-center gap-1.5 font-bold text-zinc-800 transition-colors ${
                userRole !== "worker" && branches.length > 0
                  ? "hover:text-orange-600 cursor-pointer"
                  : "opacity-90"
              }`}
            >
              <MapPin className="h-3.5 w-3.5 text-orange-600 shrink-0" />
              <span>
                Terminal Station:{" "}
                <span className="underline decoration-wavy decoration-orange-400">
                  {currentBranch?.name || "No branch active"}
                </span>
              </span>
              {userRole === "owner" && branches.length > 0 && (
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              )}
            </button>

            {isBranchMenuOpen && userRole === "owner" && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                  Switch Active Stations
                </div>
                {branches.map((b) => (
                  <button
                    key={b._id}
                    onClick={() => {
                      onSelectBranch(b._id);
                      setIsBranchMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer block ${
                      b._id === activeBranchId
                        ? "bg-orange-50 text-orange-600 font-bold"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="hidden sm:inline text-zinc-300">•</span>
          <span className="italic text-zinc-400">
            Real-time multi-lane priority tracking and routing engine.
          </span>
        </div>
      </div>

      {/* CORE OPERATIONS DROPDOWN MENU */}
      <div className="relative">
        <button
          onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-bold px-4 py-2.5 shadow-sm transition-all active:scale-95 cursor-pointer text-xs h-10 select-none"
        >
          <Settings className="h-4 w-4 text-zinc-500" />
          <span>Terminal Core Menu</span>
          <ChevronDown className="h-3 w-3 text-zinc-400 ml-1" />
        </button>

        {isActionMenuOpen && (
          <div
            className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            onMouseLeave={() => setIsActionMenuOpen(false)}
          >
            <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400 select-none">
              Terminal Core Operations
            </div>

            <button
              disabled={!currentBranch}
              onClick={() => {
                if (currentBranch) onOpenQr();
                setIsActionMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-orange-50/60 hover:text-orange-700 rounded-xl transition-all cursor-pointer text-left disabled:opacity-40"
            >
              <QrCode className="h-4 w-4 text-orange-600" />
              Show Station QR Code
            </button>

            <button
              disabled={!currentBranch}
              onClick={() => {
                if (currentBranch) onOpenTv();
                setIsActionMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-all cursor-pointer text-left disabled:opacity-40"
            >
              <Monitor className="h-4 w-4 text-zinc-400" />
              Launch TV Display
            </button>

            {userRole === "owner" && (
              <>
                <div className="h-px bg-zinc-100 my-1" />
                <button
                  onClick={() => {
                    onOpenAnalytics();
                    setIsActionMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-all cursor-pointer text-left"
                >
                  <BarChart3 className="h-4 w-4 text-zinc-400" />
                  View Analytics
                </button>

                <button
                  onClick={() => {
                    onNavigateBranches();
                    setIsActionMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-all cursor-pointer text-left"
                >
                  <Settings className="h-4 w-4 text-zinc-400" />
                  Manage System Branches
                </button>
              </>
            )}

            <div className="h-px bg-zinc-100 my-1" />
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all cursor-pointer text-left"
            >
              <LogOut className="h-4 w-4 text-red-500" />
              Log Out of Station
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
