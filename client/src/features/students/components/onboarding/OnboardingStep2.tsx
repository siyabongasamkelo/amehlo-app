import React from "react";
import { Layers, ArrowRight, ArrowLeft, MapPin } from "lucide-react";

interface OnboardingStep2Props {
  // Region passed from Step 1 to dynamically toggle branch list options
  selectedRegion: "Gauteng" | "KwaZulu-Natal" | "";
  // Step 2 Form States
  selectedBranch: string;
  setSelectedBranch: (val: string) => void;
  courseCode: "Code 8" | "Code 10" | "Code 14" | "";
  setCourseCode: (val: "Code 8" | "Code 10" | "Code 14" | "") => void;
  // Step Navigation Controllers
  onNextStep: () => void;
  onPrevStep: () => void;
}

export const OnboardingStep2: React.FC<OnboardingStep2Props> = ({
  selectedRegion,
  selectedBranch,
  setSelectedBranch,
  courseCode,
  setCourseCode,
  onNextStep,
  onPrevStep,
}) => {
  // Hardcoded real-world branch matrices mapped to geographical provincial zones
  const branchesByRegion = {
    Gauteng: ["Johannesburg Central", "Pretoria Hub", "Soweto Campus"],
    "KwaZulu-Natal": ["Empangeni Elite", "Durban Central", "Pinetown Hub"],
  };

  const activeBranches = selectedRegion ? branchesByRegion[selectedRegion] : [];
  const isFormValid = selectedBranch !== "" && courseCode !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) onNextStep();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 animate-in fade-in duration-200"
    >
      {/* 📍 FIELD 1: DYNAMIC FLEET BRANCH SELECTOR */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-zinc-400" /> Select Driving School
          Branch
        </label>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-orange-500 bg-white transition-colors cursor-pointer"
        >
          <option value="" disabled>
            -- Choose an active branch near you --
          </option>
          {activeBranches.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
      </div>

      {/* 🛞 FIELD 2: HIGH-CONTRAST VISUAL FLEET COURSE SELECTOR */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-zinc-400" /> Target Licensing
          Class
        </label>

        <div className="space-y-2.5">
          {(
            [
              {
                code: "Code 8",
                type: "Light Motor Vehicle",
                desc: "Standard sedan/hatchback controls",
              },
              {
                code: "Code 10",
                type: "Heavy Motor Vehicle",
                desc: "Rigid trucks and commercial assets",
              },
              {
                code: "Code 14",
                type: "Heavy Articulated Rig",
                desc: "Horse-and-trailer industrial haulage",
              },
            ] as const
          ).map((course) => {
            const isSelected = courseCode === course.code;
            return (
              <button
                key={course.code}
                type="button"
                onClick={() => setCourseCode(course.code)}
                className={`w-full text-left p-4 border rounded-xl transition-all flex items-start gap-3.5 cursor-pointer ${
                  isSelected
                    ? "bg-zinc-950 border-zinc-950 text-white shadow-md"
                    : "bg-white border-zinc-200 hover:border-zinc-300 text-zinc-800"
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-orange-600 text-white"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {course.code.split(" ")[1]}
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-xs tracking-tight">
                    {course.type}
                  </div>
                  <div
                    className={`text-[10px] mt-0.5 ${isSelected ? "text-zinc-300" : "text-zinc-400"}`}
                  >
                    {course.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* NAVIGATION CONTROLS BOTTOM BUTTONS ROW */}
      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={onPrevStep}
          className="flex-1 bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 font-bold py-3.5 px-4 rounded-xl text-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <button
          type="submit"
          disabled={!isFormValid}
          className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-md shadow-orange-600/10 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          Continue
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </form>
  );
};
