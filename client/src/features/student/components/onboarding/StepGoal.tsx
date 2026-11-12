import React from "react";
import { BookOpen, Car } from "lucide-react";

export type GoalType = "learners" | "drivers" | null;

interface StepGoalProps {
  selectedGoal: GoalType;
  onSelect: (goal: GoalType) => void;
}

export const StepGoal: React.FC<StepGoalProps> = ({
  selectedGoal,
  onSelect,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl font-black tracking-tight text-zinc-900">
          What do you need today?
        </h2>
        <p className="text-xs text-zinc-500 font-medium">
          Choose your goal so we set up the right training track.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onSelect("learners")}
          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
            selectedGoal === "learners"
              ? "border-orange-500 bg-orange-50/40 shadow-sm"
              : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/70"
          }`}
        >
          <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-orange-600 shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900">
              Learner&apos;s Licence
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Prepare for your K53 written or computer test.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelect("drivers")}
          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
            selectedGoal === "drivers"
              ? "border-orange-500 bg-orange-50/40 shadow-sm"
              : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/70"
          }`}
        >
          <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-orange-600 shrink-0">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-900">
              Driver&apos;s Licence
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Practical yard and road driving lessons with an instructor.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
