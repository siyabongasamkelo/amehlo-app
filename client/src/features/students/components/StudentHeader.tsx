import React from "react";
import { LogOut, RefreshCw } from "lucide-react";
import type { MasterProfile } from "../../queue/types/queue";

interface StudentHeaderProps {
  currentStudent: MasterProfile;
  isRefreshing: boolean;
  onRefreshSync: () => void;
  onSignOut: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({
  //   currentStudent,
  isRefreshing,
  onRefreshSync,
  onSignOut,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 h-16 flex items-center justify-between">
      {/* Reused Branding Block from Navbar.tsx */}
      <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-900">
        <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-orange-600/20">
          A
        </div>
        Amehlo<span className="text-orange-600">App</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded ml-1 sm:inline hidden">
          Student Portal
        </span>
      </div>

      {/* Sync Operations and Utility Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRefreshSync}
          className={`p-2 hover:bg-zinc-100 rounded-xl text-zinc-500 transition-all ${isRefreshing ? "animate-spin text-orange-600" : ""}`}
          title="Force refresh live queue sync feed"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <button
          onClick={onSignOut}
          className="p-2 hover:bg-red-50 rounded-xl text-zinc-400 hover:text-red-600 transition-colors"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
