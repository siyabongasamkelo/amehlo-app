import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, QrCode } from "lucide-react";

interface BranchQrStationProps {
  businessName: string;
  branchName: string;
  branchId: string;
}

export const BranchQrStation: React.FC<BranchQrStationProps> = ({
  businessName,
  branchName,
  branchId,
}) => {
  // Construct the exact production web address link for this branch endpoint
  const targetUrl = `${window.location.origin}/customer/join?branch=${branchId}`;
  const qrRef = useRef<HTMLDivElement>(null);

  const handlePrintSignage = () => {
    // Standard window utility to trigger local printer overlays cleanly
    window.print();
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between items-center text-center space-y-4 max-w-sm mx-auto">
      <div className="w-full">
        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center justify-center gap-2">
          <QrCode className="h-4 w-4 text-orange-600" /> Digital QR Station
        </h3>
        <p className="text-[11px] text-zinc-400 mt-0.5 px-2">
          Point phone camera here to join the live operations pipeline.
        </p>
      </div>

      {/* THE LIVE GENERATED VECTOR BOX */}
      <div
        ref={qrRef}
        className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col items-center w-full print:p-0 print:border-none"
      >
        <div className="p-3 bg-white border border-zinc-300/80 rounded-xl shadow-inner flex items-center justify-center">
          <QRCodeSVG
            value={targetUrl}
            size={140}
            level="H" // High error correction (means it still scans even if printed poster gets scratched!)
            includeMargin={false}
            imageSettings={{
              src: "/amehlo-mini-logo.png", // Optional: Custom center brand badge icon!
              x: undefined,
              y: undefined,
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
        </div>

        <div className="text-[11px] text-zinc-700 font-bold font-mono tracking-wider mt-3 truncate max-w-full uppercase px-1">
          {businessName}
        </div>
        <div className="text-[9px] text-zinc-400 font-semibold font-mono truncate max-w-full tracking-wide">
          📍 {branchName}
        </div>
      </div>

      {/* EXPORT ACTION BUTTON UNITS */}
      <button
        type="button"
        onClick={handlePrintSignage}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-bold py-2.5 shadow-sm text-xs transition-all cursor-pointer active:scale-95"
      >
        <Printer className="h-3.5 w-3.5 text-zinc-500" />
        Print Store Wall Signage
      </button>
    </div>
  );
};
