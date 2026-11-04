import React from "react";
import { LogOut, AlertTriangle, Phone, Mail, User } from "lucide-react";

interface LiveTicketHUDProps {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  ticketNumber: string;
  currentPosition: number;
  peopleAhead: number;
  estWaitRange: string;
  onLeave: () => void;
}

export const LiveTicketHUD: React.FC<LiveTicketHUDProps> = ({
  customerName,
  customerPhone,
  customerEmail,
  ticketNumber,
  currentPosition,
  peopleAhead,
  estWaitRange,
  onLeave,
}) => {
  const isUpNext = currentPosition <= 2;

  return (
    <div className="w-full max-w-md mx-auto space-y-5 p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* POSITION PROXIMITY CRITICAL NOTIFICATION BANNER */}
      {isUpNext && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-pulse">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              Return to Storefront
            </h4>
            <p className="text-[11px] text-amber-700 leading-tight mt-0.5 font-medium">
              You are currently next up in sequence. Please walk back
              immediately to avoid losing your slot.
            </p>
          </div>
        </div>
      )}

      {/* CORE ACTIVE TICKET RUNTIME CONTROL HUD */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-md text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-orange-500 via-orange-600 to-zinc-900" />

        <div className="flex justify-between items-center text-zinc-400 text-[10px] font-bold select-none px-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 block animate-ping" />
            <span className="text-zinc-500 tracking-wider uppercase font-mono">
              Live Sync Active
            </span>
          </div>
          <span className="font-mono tracking-wider">
            TICKET #{ticketNumber}
          </span>
        </div>

        {/* HIGH-HIERARCHY POSITION DISPATCH ENGINE */}
        <div className="py-2 space-y-1.5 select-none">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Your Position Status
          </p>
          <h2 className="text-6xl font-black text-zinc-900 tracking-tighter leading-none">
            #{currentPosition}
          </h2>
          <p className="text-xs font-bold text-zinc-600">
            {peopleAhead === 0
              ? "You are up next!"
              : `${peopleAhead} people holding priority ahead`}
          </p>
        </div>

        {/* TIME HORIZON MATRIX PANEL */}
        <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3.5 flex justify-between items-center text-left text-xs select-none">
          <span className="text-zinc-400 font-semibold">Estimated Return:</span>
          <span className="font-black text-zinc-900 tracking-tight font-mono">
            {estWaitRange}
          </span>
        </div>

        {/* METADATA PROFILE VERIFICATION CHIP CONTAINER */}
        <div className="pt-4 border-t border-zinc-100 text-left text-xs space-y-1.5 bg-zinc-50/50 p-3 rounded-2xl border border-zinc-100">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 flex items-center gap-1">
              <User className="h-3 w-3" /> Name:
            </span>
            <span className="font-bold text-zinc-800">{customerName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400 flex items-center gap-1">
              <Phone className="h-3 w-3" /> Mobile:
            </span>
            <span className="font-mono font-semibold text-zinc-700">
              {customerPhone}
            </span>
          </div>
          {customerEmail && (
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email:
              </span>
              <span className="text-zinc-500 font-medium truncate max-w-[180px]">
                {customerEmail}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* GENTLE EXIT VALVE CONTROL */}
      <div className="flex justify-center pt-1">
        <button
          onClick={() => {
            if (
              confirm(
                "Are you sure you want to abandon your queue token position?",
              )
            )
              onLeave();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-transparent text-zinc-400 hover:text-red-500 text-[11px] font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer select-none"
        >
          <LogOut className="h-3.5 w-3.5" /> Leave Queue Lane
        </button>
      </div>
    </div>
  );
};
