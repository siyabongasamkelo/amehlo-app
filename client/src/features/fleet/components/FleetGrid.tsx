import React from "react";
import { Car, Truck, Fuel, CheckCircle2, AlertTriangle } from "lucide-react";
import type { FleetVehicle } from "../types";

interface FleetGridProps {
  vehicles: FleetVehicle[];
}

export const FleetGrid: React.FC<FleetGridProps> = ({ vehicles }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vehicles.map((vehicle) => {
        // Dynamic status configuration
        const isRoad = vehicle.status === "ACTIVE_ROAD";
        const isIdle = vehicle.status === "IDLE_YARD";
        const isWorkshop = vehicle.status === "MAINTENANCE";

        return (
          <div
            key={vehicle.id}
            className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 transition-all hover:border-zinc-300 ${
              isRoad
                ? "border-l-4 border-l-emerald-500"
                : isIdle
                  ? "border-l-4 border-l-zinc-400"
                  : "border-l-4 border-l-red-500"
            }`}
          >
            {/* Header Layout */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl border ${
                    vehicle.courseCode === "Code 14"
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-zinc-50 border-zinc-200 text-zinc-700"
                  }`}
                >
                  {vehicle.courseCode === "Code 14" ? (
                    <Truck className="h-5 w-5" />
                  ) : (
                    <Car className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-zinc-900 text-sm">
                    Unit {vehicle.unitNumber}
                  </div>
                  <div className="font-mono text-xs text-zinc-400 font-semibold">
                    {vehicle.registrationNumber}
                  </div>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                  vehicle.courseCode === "Code 14"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : vehicle.courseCode === "Code 10"
                      ? "bg-blue-50 text-blue-800 border-blue-200"
                      : "bg-purple-50 text-purple-800 border-purple-200"
                }`}
              >
                {vehicle.courseCode}
              </span>
            </div>

            {/* Middle Section: Active Status Metrics */}
            <div className="bg-zinc-50/70 border border-zinc-100 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Assigned Instructor:</span>
                <span className="font-semibold text-zinc-800">
                  {vehicle.assignedInstructor}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Current Task/Student:</span>
                <span className="font-medium text-zinc-700">
                  {vehicle.currentStudent ? vehicle.currentStudent : "—"}
                </span>
              </div>
            </div>

            {/* Bottom Section: Fuel & Diagnostics Indicators */}
            <div className="pt-1 flex items-center justify-between text-xs border-t border-zinc-100">
              <div className="flex items-center gap-1 text-zinc-500 font-medium">
                <Fuel
                  className={`h-3.5 w-3.5 ${vehicle.fuelLevel < 25 ? "text-red-500 animate-pulse" : "text-zinc-400"}`}
                />
                <span>{vehicle.fuelLevel}% Fuel</span>
              </div>

              {/* Status Badge Mapping */}
              <div>
                {isRoad && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    <CheckCircle2 className="h-3 w-3" /> ON ROAD
                  </span>
                )}
                {isIdle && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
                    ● STANDBY
                  </span>
                )}
                {isWorkshop && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                    <AlertTriangle className="h-3 w-3" /> WORKSHOP
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
