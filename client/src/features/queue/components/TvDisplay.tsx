import React from "react";
import { X, Volume2, ArrowRight } from "lucide-react";
import type { IQueueItem } from "../services/queueService";

interface TvDisplayProps {
  queue: IQueueItem[];
  businessName: string;
  branchName: string;
  onClose: () => void;
}

export const TvDisplay: React.FC<TvDisplayProps> = ({
  queue,
  businessName,
  branchName,
  onClose,
}) => {
  // ➔ Real-time status lookup using your actual MongoDB status enum flags
  const activePerson = queue.find((i) => i.status === "Active");

  // Look for the next person in line who is still in the "Waiting" status pool
  const nextPerson = queue.find(
    (i) => i.status === "Waiting" && i._id !== activePerson?._id,
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col justify-between p-6 md:p-12 relative animate-in fade-in duration-300 font-sans antialiased">
      {/* 🚀 MINIMALIST LIGHT DISMISS VALVE TRAP */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-100 transition-all text-zinc-400 hover:text-zinc-700 shadow-sm active:scale-95 cursor-pointer"
      >
        <X className="h-6 w-6" />
      </button>

      {/* HEADER META INFO LAYOUT */}
      <div className="text-center pt-4 space-y-1">
        <p className="text-xs font-black tracking-widest text-orange-600 uppercase select-none">
          {businessName} Workspace • {branchName}
        </p>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-900">
          Please Wait For Your Turn
        </h1>
      </div>

      {/* COMPACT SPLIT MONITOR CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full my-auto items-stretch">
        {/* NOW SERVING FOCUS CANVAS CARD */}
        <div className="bg-white border-2 border-emerald-500 rounded-3xl p-8 text-center flex flex-col justify-center space-y-6 shadow-xl shadow-emerald-50 relative overflow-hidden">
          <div className="absolute top-4 left-4 right-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold tracking-wider text-[10px] uppercase rounded-xl border border-emerald-200/60 shadow-sm">
              <Volume2 className="h-3.5 w-3.5 animate-pulse" /> Now Serving
            </span>
          </div>

          {activePerson ? (
            <div className="pt-6 space-y-2">
              <div className="text-7xl md:text-8xl font-black text-emerald-600 tracking-tighter">
                #{activePerson.ticketId}
              </div>
              <div className="text-2xl md:text-3xl font-black text-zinc-800 truncate px-4">
                {activePerson.name}
              </div>
            </div>
          ) : (
            <div className="text-zinc-400 text-sm md:text-base py-16 font-semibold italic select-none">
              Lane Is Open / Awaiting Next Client
            </div>
          )}
        </div>

        {/* NEXT UP FOCUS CANVAS CARD */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 text-center flex flex-col justify-center space-y-6 shadow-md hover:border-zinc-300 transition-all relative overflow-hidden">
          <div className="absolute top-4 left-4 right-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 text-zinc-600 font-bold tracking-wider text-[10px] uppercase rounded-xl border border-zinc-200 shadow-sm">
              <ArrowRight className="h-3.5 w-3.5" /> Next Up
            </span>
          </div>

          {nextPerson ? (
            <div className="pt-6 space-y-2">
              <div className="text-6xl md:text-7xl font-black text-zinc-900 tracking-tighter">
                #{nextPerson.ticketId}
              </div>
              <div className="text-xl md:text-2xl font-bold text-zinc-600 truncate px-4">
                {nextPerson.name}
              </div>
            </div>
          ) : (
            <div className="text-zinc-400 text-sm md:text-base py-16 font-semibold italic select-none">
              No additional tickets in line
            </div>
          )}
        </div>
      </div>

      {/* FOOTER COHESIVE METADATA UNIT */}
      <div className="text-center text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase select-none border-t border-zinc-200/60 pt-6">
        Amehlo Queue Real-time Terminal Display Active
      </div>
    </div>
  );
};
