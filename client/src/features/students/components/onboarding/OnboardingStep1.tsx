import React from "react";
import { User, Phone, MapPin, ArrowRight } from "lucide-react";

interface OnboardingStep1Props {
  // Master flat form states passed down from the central wizard controller
  name: string;
  setName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  selectedRegion: "Gauteng" | "KwaZulu-Natal" | "";
  setSelectedRegion: (val: "Gauteng" | "KwaZulu-Natal" | "") => void;
  // Step navigation transition trigger
  onNextStep: () => void;
}

export const OnboardingStep1: React.FC<OnboardingStep1Props> = ({
  name,
  setName,
  phone,
  setPhone,
  selectedRegion,
  setSelectedRegion,
  onNextStep,
}) => {
  // Simple validation to keep step 1 hard-locked until entries are legitimate
  const isFormValid =
    name.trim().length > 2 &&
    phone.trim().length >= 10 &&
    selectedRegion !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) onNextStep();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 animate-in fade-in duration-200"
    >
      {/* 👤 FIELD 1: FULL LEGAL IDENTITY */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-zinc-400" /> Full Legal Name
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Thabo Khumalo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-orange-500 bg-white transition-colors"
        />
      </div>

      {/* 📱 FIELD 2: SOUTH AFRICAN CONTACT CHANNEL */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-zinc-400" /> Mobile / WhatsApp
          Number
        </label>
        <input
          type="tel"
          required
          placeholder="e.g. 082 555 1234"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-orange-500 bg-white transition-colors"
        />
      </div>

      {/* 📍 FIELD 3: NATIONAL REGIONAL LOCALITY */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-zinc-400" /> Provincial Region
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {(["Gauteng", "KwaZulu-Natal"] as const).map((region) => {
            const isSelected = selectedRegion === region;
            return (
              <button
                key={region}
                type="button"
                onClick={() => setSelectedRegion(region)}
                className={`py-3 px-3 text-xs font-bold rounded-xl border transition-all text-center cursor-pointer ${
                  isSelected
                    ? "bg-zinc-900 border-zinc-900 text-white shadow-sm shadow-zinc-900/10"
                    : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                {region}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
          Selecting your province customizes your fleet branch connections
          dynamically in the next step.
        </p>
      </div>

      {/* STEP ACCELERATOR INTERACTIVE TRIGGER */}
      <button
        type="submit"
        disabled={!isFormValid}
        className="w-full mt-4 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-md shadow-orange-600/10 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
      >
        Continue to Course Setup
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </form>
  );
};
