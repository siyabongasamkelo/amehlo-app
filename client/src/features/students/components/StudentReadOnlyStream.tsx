import React from "react";
import { Clock } from "lucide-react";
import type { QueueItem } from "../../queue/types/queue";

interface StudentReadOnlyStreamProps {
  globalQueue: QueueItem[];
  myProfileId: string;
}

export const StudentReadOnlyStream: React.FC<StudentReadOnlyStreamProps> = ({
  globalQueue,
  myProfileId,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-0.5">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-orange-600" /> Active Sequence
          Tracking Feed
        </h4>
        <span className="text-[10px] font-medium text-zinc-400">
          Flow direction ➔
        </span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-0.5 snap-x scrollbar-thin">
        {globalQueue.length === 0 ? (
          <div className="w-full bg-white border border-zinc-200 border-dashed rounded-xl py-8 text-center text-zinc-400 text-xs">
            No active fleet vehicles are running on the conveyor track right
            now.
          </div>
        ) : (
          globalQueue.map((item) => {
            const isMe = item.profile.id === myProfileId;
            const isActive = item.status === "Active";

            return (
              <div
                key={item.id}
                className={`min-w-[190px] snap-start rounded-xl border p-3.5 space-y-3 flex flex-col justify-between shrink-0 shadow-sm transition-all duration-200 ${
                  isMe
                    ? "bg-orange-600 border-orange-600 text-white"
                    : isActive
                      ? "bg-white border-emerald-500"
                      : "bg-white border-zinc-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="overflow-hidden">
                    <div
                      className={`text-[9px] font-mono ${isMe ? "text-orange-200" : "text-zinc-400"}`}
                    >
                      TOKEN #{item.id.slice(-4)}
                    </div>
                    <h5
                      className={`font-bold text-xs truncate mt-0.5 ${isMe ? "text-white" : "text-zinc-900"}`}
                    >
                      {isMe ? "👉 YOU (Holding Token)" : "Anonymised Driver"}
                    </h5>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-black ${isMe ? "bg-white text-orange-600" : isActive ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}
                  >
                    Pos #{item.position}
                  </span>
                </div>

                <div
                  className={`rounded-lg p-2 text-[11px] space-y-1 ${isMe ? "bg-orange-700/40 text-orange-50" : "bg-zinc-50 border border-zinc-100 text-zinc-600"}`}
                >
                  <div className="flex justify-between">
                    <span>Class:</span>
                    <span className="font-bold">{item.targetCourseCode}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-current/10">
                    <span>{isActive ? "Time Left:" : "Wait:"}</span>
                    <span className="font-bold">
                      {isActive ? item.elapsed : item.estWait}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
