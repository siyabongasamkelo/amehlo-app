import React from "react";
import { QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface StationQrModalProps {
  isOpen: boolean;
  branch: any;
  activeBranchId: string | null;
  onClose: () => void;
}

export const StationQrModal: React.FC<StationQrModalProps> = ({
  isOpen,
  branch,
  activeBranchId,
  onClose,
}) => {
  if (!isOpen || !branch) return null;

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-5 animate-in zoom-in-95 duration-150 relative">
        <div className="text-center space-y-1 select-none">
          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <QrCode className="h-4 w-4 text-orange-600" /> Counter Check-In Sign
          </h3>
          <p className="text-[11px] text-zinc-400 font-medium">
            Let the customer scan this camera panel to secure their live
            tracking ticket.
          </p>
        </div>

        <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-white border border-zinc-200 rounded-xl shadow-sm">
            <QRCodeSVG
              value={`${window.location.origin}/customer/join?branchId=${activeBranchId}`}
              size={160}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="mt-3 text-[11px] font-black text-zinc-800 tracking-wide font-mono uppercase">
            {branch.name}
          </div>
          <div className="text-[9px] font-bold font-mono tracking-wider text-zinc-400">
            STATION LINK KEY: {branch.inviteCode}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full inline-flex items-center justify-center h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          Dismiss Check-In Panel
        </button>
      </div>
    </div>
  );
};
