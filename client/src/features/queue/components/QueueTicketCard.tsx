import React, { useState } from "react";
import { MoreVertical, UserX, Briefcase, MapPin } from "lucide-react";

interface QueueTicketCardProps {
  item: any;
  serviceBadgeLabel: string;
  onUpdateStatus: (ticketId: string, status: string) => void;
  onPromptAction: (ticket: any) => void;
}

export const QueueTicketCard: React.FC<QueueTicketCardProps> = ({
  item,
  serviceBadgeLabel,
  onUpdateStatus,
  onPromptAction,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isActive = item.status === "Active";

  return (
    <div
      className={`min-w-[300px] md:min-w-[330px] snap-start rounded-2xl border p-5 flex flex-col justify-between transition-all relative shrink-0 shadow-sm ${
        isActive
          ? "bg-white border-emerald-500 shadow-md shadow-emerald-50"
          : "bg-white border-zinc-200 hover:border-zinc-300"
      }`}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              TICKET ID
            </span>
            <h3 className="font-black text-xl text-zinc-900 tracking-tight leading-none mt-0.5">
              #{item.ticketId}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {isActive ? "At Counter" : `Pos #${item.position}`}
            </span>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="h-7 w-7 inline-flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {isMenuOpen && (
                <div
                  className="absolute right-0 mt-1 w-44 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg z-40 animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseLeave={() => setIsMenuOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateStatus(item._id, "Absent");
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <UserX className="h-3.5 w-3.5" /> Flag Absent (Ghost)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-100 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Name:</span>
            <span className="font-bold text-zinc-700">{item?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Contact:</span>
            <span className="font-semibold text-zinc-600 font-mono">
              {item?.phone}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-dashed border-zinc-200">
            <span className="text-zinc-400 flex items-center gap-1">
              <Briefcase className="h-3 w-3" /> Task Lane:
            </span>
            <span className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-100 text-orange-700 font-black uppercase tracking-wider text-[9px] truncate max-w-[120px] text-right">
              {serviceBadgeLabel}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-dashed border-zinc-200">
            <span className="text-zinc-400 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-zinc-400" /> Patron Radar:
            </span>
            {item.presenceStatus === "Remote" ? (
              <span className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-black uppercase tracking-wider text-[9px] flex items-center gap-0.5">
                <span className="h-1 w-1 rounded-full bg-amber-500 animate-ping" />{" "}
                App Transit
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-black uppercase tracking-wider text-[9px] flex items-center gap-0.5">
                <span className="h-1 w-1 rounded-full bg-emerald-500" /> In
                Store
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onUpdateStatus(item._id, "Waiting")}
          className="text-[11px] font-bold text-zinc-500 hover:text-zinc-700 flex items-center gap-1 bg-zinc-50 hover:bg-zinc-100 px-3 py-2 rounded-xl border border-zinc-200 transition-all cursor-pointer select-none"
        >
          Shift to Back
        </button>

        <button
          type="button"
          onClick={() => onPromptAction(item)}
          className={`text-[11px] font-bold px-4 py-2 rounded-xl border transition-all cursor-pointer w-1/2 justify-center shadow-sm select-none flex items-center gap-1 ${
            isActive
              ? "bg-zinc-900 border-zinc-900 text-white hover:bg-zinc-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white"
          }`}
        >
          {isActive ? "Complete" : "Call Next"}
        </button>
      </div>
    </div>
  );
};
