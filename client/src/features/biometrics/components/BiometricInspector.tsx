import React from "react";
import { Camera, ShieldAlert, Cpu } from "lucide-react";
import type { BiometricAuditLog } from "../types";

interface InspectorProps {
  log: BiometricAuditLog;
}

export const BiometricInspector: React.FC<InspectorProps> = ({ log }) => {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-5 h-fit">
      <div>
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
          <Cpu className="h-4 w-4 text-orange-600" /> Biometric Analysis
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">Token Context: {log.id}</p>
      </div>

      {/* SNAPSHOT WORKSPACE CORES */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            1. Master Registration
          </span>
          <div className="h-28 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col items-center justify-center text-center p-3 relative overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-600 text-xs mb-1">
              {log.studentName.charAt(0)}
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">
              Secure Snapshot
            </span>
            <div className="absolute bottom-0 inset-x-0 bg-zinc-900/70 text-[9px] text-zinc-200 py-0.5 font-mono text-center">
              Baseline
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            2. Live In-Car Stream
          </span>
          <div
            className={`h-28 border rounded-xl flex flex-col items-center justify-center text-center p-3 relative overflow-hidden ${
              log.status === "VERIFIED"
                ? "bg-emerald-50/30 border-emerald-200 text-emerald-600"
                : log.status === "FAILED"
                  ? "bg-red-50/30 border-red-200 text-red-600"
                  : "bg-amber-50/30 border-amber-200 text-amber-600"
            }`}
          >
            <Camera className="h-5 w-5 mb-1 opacity-70" />
            <span className="text-[10px] font-semibold">
              {log.status === "VERIFIED"
                ? "Match OK"
                : log.status === "FAILED"
                  ? "Mismatched"
                  : "Offline"}
            </span>
            <div className="absolute bottom-0 inset-x-0 bg-zinc-900/70 text-[9px] text-zinc-200 py-0.5 font-mono text-center">
              {log.vehicleReg}
            </div>
          </div>
        </div>
      </div>

      {/* METADATA BLOCK SUMMARY */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-2.5 text-xs text-zinc-600 font-medium">
        <div className="flex justify-between">
          <span className="text-zinc-400">Target Driver:</span>
          <span className="font-bold text-zinc-800">{log.studentName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Assigned Unit:</span>
          <span className="text-zinc-700">{log.instructorName}</span>
        </div>
        <div className="flex justify-between items-center border-t border-zinc-200/60 pt-2 mt-1">
          <span className="text-zinc-500 font-bold">Confidence Margin:</span>
          <span
            className={`font-mono font-bold text-sm ${log.status === "VERIFIED" ? "text-emerald-600" : log.status === "FAILED" ? "text-red-600" : "text-amber-600"}`}
          >
            {log.matchScore}%
          </span>
        </div>
      </div>

      {/* COUNTER FRAUD ACTIVE CONTROLS */}
      {log.status !== "VERIFIED" && (
        <div className="pt-1 flex gap-2">
          <button className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2 rounded-xl text-xs transition-all active:scale-98 cursor-pointer">
            Override Status
          </button>
          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl text-xs transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1">
            <ShieldAlert className="h-3.5 w-3.5" /> Lock Ignition
          </button>
        </div>
      )}
    </div>
  );
};
