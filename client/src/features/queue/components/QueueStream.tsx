import React from "react";
import { Clock, Zap, UserMinus, HelpCircle } from "lucide-react";
import type { QueueItem } from "../types/queue";

interface QueueStreamProps {
  queue: QueueItem[];
  onUpgrade: (id: string) => void;
  onSkip: (id: string) => void;
}

export const QueueStream: React.FC<QueueStreamProps> = ({
  queue,
  onUpgrade,
  onSkip,
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
            The conveyor lane is currently empty. Use the check-in panel above
            to assign vehicles.
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
                    : item.isPremium
                      ? "bg-gradient-to-b from-white to-orange-50/20 border-orange-400"
                      : "bg-white border-zinc-200 hover:border-zinc-300"
                }`}
              >
                {item.isPremium && (
                  <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-bl-lg flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5 fill-white" /> VIP SKIP
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.profile.masterSelfieUrl}
                        alt=""
                        className="h-10 w-10 rounded-xl object-cover border border-zinc-100"
                      />
                      <div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          TOKEN #{item.id.slice(-4)}
                        </div>
                        <h3 className="font-bold text-sm text-zinc-900 tracking-tight leading-tight">
                          {item.profile.name}
                        </h3>
                      </div>
                    </div>
                    <div
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : item.isPremium
                            ? "bg-orange-50 text-orange-700"
                            : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      Pos #{item.position}
                    </div>
                  </div>

                  {/* Context Details Card */}
                  <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100/80 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Course Code:</span>
                      <span className="font-bold text-zinc-700">
                        {item.targetCourseCode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Instructor:</span>
                      <span className="font-bold text-zinc-700 flex items-center gap-1">
                        {item.assignedInstructor}
                        {item.waitingForPreferredInstructor && (
                          <HelpCircle
                            className="h-3 w-3 text-amber-500"
                            title="Standby fallback activated"
                          />
                        )}
                      </span>
                    </div>
                    <div className="pt-1.5 border-t border-zinc-200/60 flex justify-between items-center text-[11px]">
                      <span className="text-zinc-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />{" "}
                        {isActive ? "Time Left:" : "Est. Wait Time:"}
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
                    <UserMinus className="h-3.5 w-3.5" /> Skip / Standby
                  </button>

                  {!item.isPremium && !isActive && (
                    <button
                      onClick={() => onUpgrade(item.id)}
                      className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 hover:bg-orange-100/80 px-2.5 py-1.5 rounded-lg border border-orange-200 transition-all cursor-pointer"
                    >
                      <Zap className="h-3.5 w-3.5 fill-current" /> Pay R100 Skip
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
