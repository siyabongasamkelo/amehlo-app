import React from "react";

interface StoreRulesAlertProps {
  status: string;
}

export const StoreRulesAlert: React.FC<StoreRulesAlertProps> = ({ status }) => {
  if (status == "Completed") return null;

  return (
    <div className="bg-zinc-50 border border-zinc-100/80 rounded-2xl p-3.5 text-left text-zinc-500 text-xs space-y-1">
      <p className="font-bold text-center text-[11px] uppercase tracking-wide text-orange-600">
        ⚠️ Store Queue Rule
      </p>
      <p className="text-center text-[11px]">
        Your number is held, but the counter will prioritize active patrons if
        you aren't inside the store when called.{" "}
        <strong>Scan the wall poster QR when you walk in to activate!</strong>
      </p>
    </div>
  );
};
