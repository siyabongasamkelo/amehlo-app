import React from "react";
import { Timer, Loader2, AlertCircle } from "lucide-react";

interface RemoteTicketMonitorProps {
  ticket: { ticketId: string; name: string };
  position: number | null;
  onCancel: () => void;
  isCancelling: boolean;
}

export const RemoteTicketMonitor: React.FC<RemoteTicketMonitorProps> = ({
  ticket,
  position,
  onCancel,
  isCancelling,
}) => {
  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-200 text-center">
      {/* Visual Header Identity */}
      <div className="space-y-1">
        <div className="h-12 w-12 bg-orange-50 border border-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm animate-pulse">
          <Timer className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-black tracking-tight text-zinc-900">
          Remote Spot Secured!
        </h2>
        <p className="text-xs text-zinc-400 font-medium">
          Ticket Holder: {ticket.name}
        </p>
      </div>

      {/* Grid Displaying Token ID and Sequential Queue Position */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Your Token
          </span>
          <span className="text-2xl font-black text-zinc-900 tracking-tight mt-1 block">
            #{ticket.ticketId}
          </span>
        </div>
        <div className="bg-orange-50/40 border border-orange-100 rounded-2xl p-4 transition-all duration-300">
          <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">
            Line Position
          </span>
          <span className="text-2xl font-black text-orange-600 tracking-tight mt-1 block">
            {position !== null ? `Pos #${position}` : "Up Next"}
          </span>
        </div>
      </div>

      {/* Store Presence Compliance Callout */}
      <div className="bg-zinc-50 border border-zinc-100 p-3.5 rounded-2xl text-left text-zinc-500 text-xs space-y-1">
        <p className="font-bold text-center text-[11px] uppercase tracking-wide text-orange-600 flex items-center justify-center gap-1">
          <AlertCircle className="h-3.5 w-3.5" /> Next Steps For Arrival
        </p>
        <p className="text-center text-[11px] leading-relaxed">
          Your sequence spot is active. To protect your priority queue ordering,{" "}
          <strong>scan the wall counter QR poster immediately</strong> when you
          step inside the store.
        </p>
      </div>

      {/* Safety Guarded Discard Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isCancelling}
          onClick={onCancel}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold h-10 text-xs tracking-tight transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {isCancelling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Cancel Spot & Leave Queue"
          )}
        </button>
      </div>
    </div>
  );
};
