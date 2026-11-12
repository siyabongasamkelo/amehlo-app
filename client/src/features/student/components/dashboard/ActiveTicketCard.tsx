import React, { useState } from "react";
import { Timer, MapPin, UserCheck, Loader2, LogOut } from "lucide-react";
import type { IQueueItem } from "../../../queue/services/queueService";

interface ActiveTicketCardProps {
  ticket: IQueueItem;
  onLeaveQueue: () => Promise<void>;
}

export const ActiveTicketCard: React.FC<ActiveTicketCardProps> = ({
  ticket,
  onLeaveQueue,
}) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const isRemote = ticket.presenceStatus === "Remote";

  const handleLeave = async () => {
    const confirmed = window.confirm(
      "Leave the queue? You will lose your current spot in line.",
    );
    if (!confirmed) return;

    setIsLeaving(true);
    try {
      await onLeaveQueue();
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="bg-white border-2 border-orange-500 rounded-3xl p-6 shadow-md space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center">
            <Timer className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
              Live Queue Ticket
            </h2>
            <p className="text-[11px] text-zinc-400 font-medium">
              Updates automatically in real time
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
            isRemote
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          {isRemote ? (
            <>
              <MapPin className="h-3 w-3" /> In Transit
            </>
          ) : (
            <>
              <UserCheck className="h-3 w-3" /> At Yard
            </>
          )}
        </span>
      </div>

      {/* TICKET & POSITION */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-center">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Ticket Number
          </span>
          <span className="text-2xl font-black text-zinc-900 mt-1 block">
            #{ticket.ticketId}
          </span>
        </div>

        <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 text-center">
          <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">
            Queue Position
          </span>
          <span className="text-2xl font-black text-orange-600 mt-1 block">
            {ticket.status === "Active"
              ? "Your Turn!"
              : `Pos #${ticket.position}`}
          </span>
        </div>
      </div>

      {isRemote && (
        <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-3 text-[11px] text-amber-800 leading-relaxed">
          <strong>Arrival Rule:</strong> Scan the branch wall QR poster as soon
          as you arrive at the yard so your instructor knows you are present.
        </div>
      )}

      <button
        type="button"
        disabled={isLeaving}
        onClick={handleLeave}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold h-10 text-xs transition-all cursor-pointer disabled:opacity-50"
      >
        {isLeaving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            <LogOut className="h-3.5 w-3.5" />
            <span>Leave Queue</span>
          </>
        )}
      </button>
    </div>
  );
};
