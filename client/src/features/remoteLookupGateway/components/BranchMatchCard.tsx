import React from "react";
import { Building2, MapPin, X } from "lucide-react";

interface BranchMatchCardProps {
  branch: { name: string; phone: string };
  onReset: () => void;
}

export const BranchMatchCard: React.FC<BranchMatchCardProps> = ({
  branch,
  onReset,
}) => {
  return (
    <div className="bg-orange-50/40 border border-orange-100 rounded-2xl p-4 flex items-start justify-between relative">
      <div className="space-y-1">
        <span className="text-[9px] font-bold text-orange-600 uppercase tracking-widest block font-mono">
          Target Station Matches
        </span>
        <h3 className="text-xs font-black text-zinc-900 uppercase flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-zinc-500" /> {branch.name}
        </h3>
        <p className="text-[11px] text-zinc-500 flex items-center gap-1 font-medium">
          <MapPin className="h-3 w-3 text-zinc-400" /> Branch Phone:{" "}
          {branch.phone}
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="h-6 w-6 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-600 cursor-pointer shadow-sm"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
