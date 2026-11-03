import React from "react";
import { X } from "lucide-react";
import type { QueueItem } from "../types/queue";

interface TvDisplayProps {
  queue: QueueItem[];
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
  const activePerson = queue.find((i) => i.status === "Active");
  const nextPerson = queue.find((i) => i.status === "Up Next");

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between p-8 relative animate-in fade-in duration-300">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white cursor-pointer"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="text-center pt-8">
        <p className="text-sm font-bold tracking-widest text-orange-500 uppercase">
          {businessName} • {branchName}
        </p>
        <h1 className="text-3xl font-black tracking-tight mt-2 text-zinc-100">
          Please Wait For Your Turn
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto w-full my-auto">
        {/* NOW SERVING FOCUS CARD */}
        <div className="bg-zinc-900 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 font-bold tracking-wider text-xs uppercase rounded-full border border-emerald-500/20">
            Now Serving
          </span>
          {activePerson ? (
            <>
              <div className="text-7xl font-black text-emerald-400">
                #{activePerson.id}
              </div>
              <div className="text-3xl font-bold text-zinc-100 truncate px-4">
                {activePerson.profile.name}
              </div>
            </>
          ) : (
            <div className="text-zinc-500 text-xl py-12 font-medium">
              Lane Is Open / Waiting
            </div>
          )}
        </div>

        {/* NEXT UP FOCUS CARD */}
        <div className="bg-zinc-900 border border-orange-500/20 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <span className="px-4 py-1.5 bg-orange-500/10 text-orange-400 font-bold tracking-wider text-xs uppercase rounded-full border border-orange-500/20">
            Next Up
          </span>
          {nextPerson ? (
            <>
              <div className="text-6xl font-black text-orange-400">
                #{nextPerson.id}
              </div>
              <div className="text-2xl font-bold text-zinc-300 truncate px-4">
                {nextPerson.profile.name}
              </div>
            </>
          ) : (
            <div className="text-zinc-500 text-xl py-12 font-medium">
              No one waiting next
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs font-mono text-zinc-600 border-t border-zinc-900 pt-6">
        AmehloQueue Engine Active
      </div>
    </div>
  );
};
