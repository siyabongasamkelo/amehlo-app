import React from "react";
import { CheckCircle2, Calendar, User, MapPin } from "lucide-react";

export interface ILessonHistoryItem {
  id: string;
  date: string;
  instructorName: string;
  branchName: string;
  topic: string;
}

interface LessonHistoryListProps {
  lessons: ILessonHistoryItem[];
}

export const LessonHistoryList: React.FC<LessonHistoryListProps> = ({
  lessons,
}) => {
  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
          Completed Lesson Log
        </h3>
        <span className="text-[11px] font-bold text-zinc-400">
          {lessons.length} Sessions
        </span>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-6 bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl text-xs text-zinc-400 font-medium">
          No completed lessons recorded yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>{lesson.topic}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3 w-3 text-zinc-400" />
                    {lesson.instructorName}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-zinc-400" />
                    {lesson.branchName}
                  </span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-zinc-400 shrink-0">
                <Calendar className="h-3 w-3" />
                {lesson.date}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
