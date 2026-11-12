import React from "react";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";

interface StepPackageProps {
  selectedCode: string;
  lessonsCount: number;
  isSaving: boolean;
  onSelectCount: (count: number) => void;
  onFinish: () => void;
}

const PACKAGES = [
  {
    count: 5,
    title: "5 Lessons Starter",
    desc: "Ideal for test prep or a quick skills brush-up.",
  },
  {
    count: 10,
    title: "10 Lessons Standard",
    desc: "Most popular choice for yard and road confidence.",
    badge: "Popular",
  },
  {
    count: 20,
    title: "20 Lessons Full Course",
    desc: "Complete beginner-to-test training package.",
  },
];

export const StepPackage: React.FC<StepPackageProps> = ({
  selectedCode,
  lessonsCount,
  isSaving,
  onSelectCount,
  onFinish,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl font-black tracking-tight text-zinc-900">
          Choose your lesson bundle
        </h2>
        <p className="text-xs text-zinc-500 font-medium">
          Selected:{" "}
          <span className="font-bold text-orange-600">{selectedCode}</span>. Pay
          online or at reception to activate.
        </p>
      </div>

      <div className="space-y-3">
        {PACKAGES.map((pkg) => {
          const isSelected = lessonsCount === pkg.count;
          return (
            <button
              key={pkg.count}
              type="button"
              onClick={() => onSelectCount(pkg.count)}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                isSelected
                  ? "border-orange-500 bg-orange-50/40 shadow-sm"
                  : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/70"
              }`}
            >
              <div className="pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-900">
                    {pkg.title}
                  </span>
                  {pkg.badge && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                      <Sparkles className="h-2.5 w-2.5" /> {pkg.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{pkg.desc}</p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected
                    ? "border-orange-600 bg-orange-600 text-white"
                    : "border-zinc-300 bg-white"
                }`}
              >
                {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={isSaving}
        onClick={onFinish}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-11 text-xs shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <span>Complete Setup</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
};
