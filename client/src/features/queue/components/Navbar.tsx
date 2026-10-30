import React from "react";
import { Menu } from "lucide-react";

type ActiveView =
  | "queue"
  | "students"
  | "pricing"
  | "fraud"
  | "fleet"
  | "revenue";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  activeView,
  onViewChange,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-900">
          <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-orange-600/20">
            A
          </div>
          Amehlo<span className="text-orange-600">App</span>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-zinc-500">
        <button
          onClick={() => onViewChange("queue")}
          className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${
            activeView === "queue"
              ? "text-zinc-900 bg-zinc-100"
              : "hover:text-zinc-900"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onViewChange("fleet")}
          className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${
            activeView === "fleet"
              ? "text-zinc-900 bg-zinc-100"
              : "hover:text-zinc-900"
          }`}
        >
          Live Fleet
        </button>
        <button
          onClick={() => onViewChange("revenue")}
          className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${
            activeView === "revenue"
              ? "text-zinc-900 bg-zinc-100"
              : "hover:text-zinc-900"
          }`}
        >
          Revenue Engine
        </button>
        <button
          onClick={() => onViewChange("fraud")}
          className={`px-4 py-2 rounded-md transition-colors cursor-pointer ${
            activeView === "fraud"
              ? "text-zinc-900 bg-zinc-100"
              : "hover:text-zinc-900"
          }`}
        >
          Biometrics
        </button>
      </nav>

      <div className="flex items-center gap-4">
        <button className="text-sm font-medium text-zinc-500 hover:text-orange-600 transition-colors hidden sm:block">
          Support
        </button>
        <button className="relative inline-flex items-center justify-center rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-orange-600/10 hover:bg-orange-500 active:scale-98 transition-all">
          Sign In
        </button>
      </div>
    </header>
  );
};
