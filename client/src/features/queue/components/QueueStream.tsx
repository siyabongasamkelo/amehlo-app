import React from "react";
import { Clock, UserMinus, CheckCircle2 } from "lucide-react";
import type { QueueItem } from "../types/queue";

interface QueueStreamProps {
  queue: QueueItem[];
  onSkip: (id: string) => void;
  onComplete: (id: string) => void;
}

export const QueueStream: React.FC<QueueStreamProps> = ({
  queue,
  onSkip,
  onComplete,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-600" /> Live Stream Sequence
        </h2>
        <span className="text-xs text-zinc-400 font-medium">
          Flow direction ➔ Next up shifts left
        </span>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-zinc-200">
        {queue.length === 0 ? (
          <div className="w-full bg-white border border-zinc-200 border-dashed rounded-2xl p-12 text-center text-zinc-400 text-sm">
            The lane lane is currently empty. Input an entry above to start the
            sequence.
          </div>
        ) : (
          queue.map((item) => {
            const isActive = item.status === "Active";
            return (
              <div
                key={item.id}
                className={`min-w-[290px] md:min-w-[330px] snap-start rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden shrink-0 shadow-sm ${
                  isActive
                    ? "bg-white border-emerald-500 shadow-md shadow-emerald-50"
                    : "bg-white border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] font-mono text-zinc-400">
                        TICKET NUMBER
                      </div>
                      <h3 className="font-black text-xl text-zinc-900 tracking-tight leading-none mt-1">
                        #{item.id}
                      </h3>
                    </div>
                    <div
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      Pos #{item.position}
                    </div>
                  </div>

                  <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100/80 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Name:</span>
                      <span className="font-bold text-zinc-700">
                        {item.profile.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Phone:</span>
                      <span className="font-semibold text-zinc-600">
                        {item.profile.phone}
                      </span>
                    </div>
                    {item.profile.email && (
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Email:</span>
                        <span className="text-zinc-500 truncate max-w-[180px]">
                          {item.profile.email}
                        </span>
                      </div>
                    )}
                    <div className="pt-1.5 border-t border-zinc-200/60 flex justify-between items-center text-[11px]">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />{" "}
                        {isActive ? "Status Room:" : "Est. Wait Time:"}
                      </span>
                      <span
                        className={`font-bold ${isActive ? "text-emerald-600" : "text-zinc-800"}`}
                      >
                        {isActive ? item.elapsed : item.estWait}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSkip(item.id)}
                    className="text-[11px] font-semibold text-zinc-500 hover:text-red-600 flex items-center gap-1 bg-zinc-50 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:border-red-200 transition-all cursor-pointer"
                  >
                    <UserMinus className="h-3.5 w-3.5" /> Move to Back
                  </button>

                  <button
                    onClick={() => onComplete(item.id)}
                    className="text-[11px] font-semibold text-emerald-600 hover:text-white flex items-center gap-1 bg-emerald-50 hover:bg-emerald-600 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-all cursor-pointer w-1/2 justify-center"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Complete Turn
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
