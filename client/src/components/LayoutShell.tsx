import React from "react";
import { Navbar } from "../features/queue/components/Navbar";
import { useApp } from "../context/AppContext";

interface LayoutShellProps {
  children: React.ReactNode;
}

export const LayoutShell: React.FC<LayoutShellProps> = ({ children }) => {
  const { user, logoutSimulated } = useApp();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased flex flex-col justify-between selection:bg-orange-600/10">
      {/* STICKY HEADER CAP */}
      <Navbar customBrandName="Amehlo" />

      {/* DYNAMIC VIEW ROUTING MAIN CANVAS */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 overflow-x-hidden">
        {children}
      </main>

      {/* NEW MINIMALIST SHADCN FOOTER COMPONENT */}
      <footer className="w-full border-t border-zinc-200 bg-white/60 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] font-medium text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          <span className="font-black tracking-wider text-zinc-800 uppercase">
            Amehlo
          </span>
          <span>
            • Real-time Operations Network © {new Date().getFullYear()}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 font-mono tracking-wide uppercase">
          {user ? (
            <div className="flex items-center gap-3">
              <span>
                TAG:{" "}
                <span className="font-bold text-zinc-600">
                  {user.name} ({user.role})
                </span>
              </span>
              <button
                onClick={logoutSimulated}
                className="text-red-500 hover:text-red-600 font-bold transition-colors cursor-pointer"
              >
                Disconnect Terminals
              </button>
            </div>
          ) : (
            <span>Secured Session Terminal • Offline Status</span>
          )}
        </div>
      </footer>
    </div>
  );
};
