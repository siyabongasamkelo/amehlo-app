import React from "react";
import { AlertCircle, User } from "lucide-react";

interface ConfirmTurnModalProps {
  ticket: any | null;
  onClose: () => void;
  onConfirm: (ticket: any) => void;
}

export const ConfirmTurnModal: React.FC<ConfirmTurnModalProps> = ({
  ticket,
  onClose,
  onConfirm,
}) => {
  if (!ticket) return null;

  const isActive = ticket.status === "Active";

  return (
    <div className="fixed inset-0 bg-zinc-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-5 animate-in zoom-in-95 duration-150 relative">
        <div className="flex items-center gap-3 border-b border-zinc-100 pb-3">
          <div
            className={`p-2.5 rounded-xl ${
              isActive
                ? "bg-orange-50 text-orange-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {isActive ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
              {isActive ? "Complete Customer Turn" : "Confirm Queue Call"}
            </h3>
            <p className="text-[11px] text-zinc-400 font-medium">
              Verify counter activity tracking log.
            </p>
          </div>
        </div>

        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-xs space-y-2.5">
          <p className="text-zinc-600 font-medium leading-relaxed">
            {isActive ? (
              <>
                Are you finished providing services for{" "}
                <strong className="text-zinc-900 font-black">
                  #{ticket.ticketId} - {ticket.name}
                </strong>
                ? This action archives their file entries permanently into
                corporate analytics logs.
              </>
            ) : (
              <>
                Are you ready to initiate active processing for client token{" "}
                <strong className="text-zinc-900 font-black">
                  #{ticket.ticketId} - {ticket.name}
                </strong>
                ? Make sure they are present at your station terminal counter
                position.
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 inline-flex items-center justify-center h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold text-xs transition-all cursor-pointer select-none"
          >
            Cancel Action
          </button>

          <button
            type="button"
            onClick={() => onConfirm(ticket)}
            className={`w-1/2 inline-flex items-center justify-center h-10 rounded-xl text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer select-none ${
              isActive
                ? "bg-zinc-900 hover:bg-zinc-800"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          >
            {isActive ? "Yes, Complete Turn" : "Yes, Call Customer"}
          </button>
        </div>
      </div>
    </div>
  );
};
