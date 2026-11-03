import React from "react";
import { ArrowLeft, Building2, QrCode, Printer } from "lucide-react";

interface SettingsPanelProps {
  businessName: string;
  setBusinessName: (val: string) => void;
  branchName: string;
  setBranchName: (val: string) => void;
  contactPhone: string;
  setContactPhone: (val: string) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  businessName,
  setBusinessName,
  branchName,
  setBranchName,
  contactPhone,
  setContactPhone,
  onClose,
}) => {
  const qrSlug = `${businessName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${branchName.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Back-Stage Settings
          </h1>
          <p className="text-xs text-zinc-500">
            Configure business profiles and print physical check-in assets.
          </p>
        </div>
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Live Queue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4 md:col-span-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="h-4 w-4 text-orange-600" /> Identity
              Registration
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Input details to update terminal headers and ticket meta fields.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Trading / Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Sizwe's Barber Shop"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Branch Location
              </label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="e.g. Empangeni Main St"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Contact Tel / Desk Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. 035 772 1101"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between items-center text-center space-y-4">
          <div className="w-full">
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center justify-center gap-2">
              <QrCode className="h-4 w-4 text-orange-600" /> QR Station
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5 px-2">
              Generated code linked specifically to this station terminal
              profile.
            </p>
          </div>

          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col items-center w-full">
            <div className="h-32 w-32 bg-white border border-zinc-300 rounded-xl flex items-center justify-center font-mono text-[9px] text-zinc-400 font-bold shadow-inner relative overflow-hidden">
              <div className="absolute inset-3 bg-gradient-to-br from-orange-600 to-zinc-900 rounded opacity-10 mix-blend-multiply" />
              <div className="z-10 p-2 text-center select-none uppercase tracking-wider font-black text-zinc-800 leading-tight">
                QR CODE
                <br />
                <span className="text-[7px] text-orange-600 font-mono font-medium block mt-1 truncate max-w-[100px]">
                  {qrSlug}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-zinc-700 font-bold font-mono tracking-wider mt-3 truncate max-w-full uppercase px-1">
              {businessName || "No Name"}
            </div>
            <div className="text-[9px] text-zinc-400 font-medium font-mono truncate max-w-full">
              {branchName || "No Branch"}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              alert(
                `Exporting poster for endpoint: amehloqueue.co/join/${qrSlug}`,
              )
            }
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-semibold py-2.5 shadow-sm text-xs transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4 text-zinc-500" />
            Print Wall Signage Poster
          </button>
        </div>
      </div>
    </div>
  );
};
