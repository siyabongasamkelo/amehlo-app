import React from "react";
import { Truck } from "lucide-react";
import type { GoalType } from "./StepGoal";

interface StepCodeProps {
  goal: GoalType;
  selectedCode: string;
  onSelect: (code: string) => void;
}

export const StepCode: React.FC<StepCodeProps> = ({
  goal,
  selectedCode,
  onSelect,
}) => {
  const options =
    goal === "learners"
      ? [
          {
            id: "Code 1 (Learners)",
            title: "Code 1 — Motorcycles",
            desc: "Motorcycles, scooters, and three-wheelers.",
          },
          {
            id: "Code 2 (Learners)",
            title: "Code 2 — Light Motor Vehicles",
            desc: "Cars, bakkies, and minibuses under 3,500 kg.",
          },
          {
            id: "Code 3 (Learners)",
            title: "Code 3 — Heavy Motor Vehicles",
            desc: "Trucks and heavy vehicles over 3,500 kg.",
          },
        ]
      : [
          {
            id: "Code 8",
            title: "Code 8 — Light Motor Vehicle",
            desc: "Standard passenger cars and light bakkies.",
          },
          {
            id: "Code 10",
            title: "Code 10 — Heavy Motor Vehicle",
            desc: "Trucks and heavy vehicles exceeding 3,500 kg.",
          },
          {
            id: "Code 14",
            title: "Code 14 — Extra-Heavy Articulated",
            desc: "Heavy trucks with trailers (horse & trailer).",
          },
        ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl font-black tracking-tight text-zinc-900">
          Which licence code?
        </h2>
        <p className="text-xs text-zinc-500 font-medium">
          Select the vehicle class you are training for.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
              selectedCode === item.id
                ? "border-orange-500 bg-orange-50/40 shadow-sm"
                : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/70"
            }`}
          >
            <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-900">
                {item.title}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
