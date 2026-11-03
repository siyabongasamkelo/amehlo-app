import React, { ChangeEvent } from "react";
import {
  Upload,
  ShieldCheck,
  ArrowLeft,
  CheckCircle,
  Image,
} from "lucide-react";

interface OnboardingStep3Props {
  capturedSelfie: string | null;
  setCapturedSelfie: (imgData: string | null) => void;
  onPrevStep: () => void;
  onCompleteRegistration: () => void;
}

export const OnboardingStep3: React.FC<OnboardingStep3Props> = ({
  capturedSelfie,
  setCapturedSelfie,
  onPrevStep,
  onCompleteRegistration,
}) => {
  // Process the uploaded image asset file cleanly in the client browser memory runtime
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Enforce basic type guard validations to ensure files are authentic images
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPEG/PNG).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // Encode file directly into a base64 string representation
      setCapturedSelfie(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5 flex flex-col items-center justify-center animate-in fade-in duration-200">
      {/* VISUAL FILE DISPLAY PREVIEW BOX */}
      <div className="w-full max-w-[220px] aspect-square bg-zinc-100 rounded-2xl border-2 border-zinc-200 overflow-hidden relative flex items-center justify-center shadow-inner bg-white">
        {capturedSelfie ? (
          <div></div>
        ) : (
          <div className="text-center p-4 text-zinc-400 space-y-1">
            <Image className="h-6 w-6 mx-auto text-zinc-300" />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              No Photo Uploaded
            </p>
          </div>
        )}
        {capturedSelfie && (
          <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
            <ShieldCheck className="h-3 w-3" /> Profile Photo Set
          </div>
        )}
      </div>

      {/* FRICTIONLESS INPUT UPLOAD CONTROLLER TIER */}
      <div className="w-full max-w-xs">
        <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 font-semibold text-xs shadow-sm cursor-pointer transition-colors text-center">
          <Upload className="h-4 w-4" />
          {capturedSelfie ? "Change Profile Photo" : "Upload or Take Photo"}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
        <span className="text-[10px] text-zinc-400 block text-center mt-1.5 leading-normal">
          Supports native phone camera snapping or media library picks.
        </span>
      </div>

      {/* STEP NAVIGATION ACTIONS TRACKS */}
      <div className="flex items-center gap-2 pt-3 border-t w-full">
        <button
          type="button"
          onClick={onPrevStep}
          className="flex-1 bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 font-bold py-3.5 px-4 rounded-xl text-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <button
          type="button"
          disabled={!capturedSelfie}
          onClick={onCompleteRegistration}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-100 disabled:text-zinc-400 text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          Complete Setup
          <CheckCircle className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
