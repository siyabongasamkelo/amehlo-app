import React from "react";
import { MapPin, UserCheck } from "lucide-react";

interface TransitBadgeProps {
  presenceStatus: "Remote" | "Arrived";
}

export const TransitBadge: React.FC<TransitBadgeProps> = ({
  presenceStatus,
}) => {
  const isRemote = presenceStatus === "Remote";

  return (
    <div className="flex justify-center select-none">
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wide border ${
          isRemote
            ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
            : "bg-emerald-50 text-emerald-700 border-emerald-200"
        }`}
      >
        {isRemote ? (
          <>
            <MapPin className="h-3 w-3 text-amber-600" /> In Transit (Remote
            Booking)
          </>
        ) : (
          <>
            <UserCheck className="h-3 w-3 text-emerald-600" /> Physical Presence
            (Arrived)
          </>
        )}
      </span>
    </div>
  );
};
