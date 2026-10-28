import React from "react";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  ShieldAlert,
  Settings,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <aside
      className={`${isOpen ? "w-64" : "w-0 -translate-x-64"} lg:translate-x-0 lg:w-64 border-r border-zinc-200 bg-zinc-50 p-4 transition-all duration-300 overflow-hidden flex flex-col justify-between shrink-0`}
    >
      <div className="space-y-6">
        <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Management Portal
        </div>
        <nav className="space-y-1">
          <a
            href="#live"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-orange-50/60 text-orange-600 font-medium text-sm transition-all border border-orange-100/50"
          >
            <LayoutDashboard className="h-4 w-4" />
            Queue Dashboard
          </a>
          <a
            href="#students"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 text-sm transition-all"
          >
            <Users className="h-4 w-4" />
            Student Roster
          </a>
          <a
            href="#pricing"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 text-sm transition-all"
          >
            <TrendingUp className="h-4 w-4" />
            Priority Pricing (R100)
          </a>
          <a
            href="#fraud"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 text-sm transition-all"
          >
            <ShieldAlert className="h-4 w-4" />
            AI Biometric Audits
          </a>
        </nav>
      </div>

      <div className="border-t border-zinc-200 pt-4 space-y-1">
        <a
          href="#settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 text-sm transition-all"
        >
          <Settings className="h-4 w-4" />
          Settings
        </a>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-zinc-500 hover:text-red-600 text-sm transition-all text-left">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};
