import React from "react";
import { Sliders } from "lucide-react";
import type { FleetVehicle } from "./types";
import { FleetGrid } from "./components/FleetGrid";

const MOCK_FLEET_VEHICLES: FleetVehicle[] = [
  {
    id: "v_1",
    unitNumber: "01",
    registrationNumber: "ND 882-901",
    courseCode: "Code 8",
    assignedInstructor: "Instructor Jabu",
    status: "ACTIVE_ROAD",
    currentStudent: "Siyabonga Mabuza",
    fuelLevel: 68,
    nextServiceKm: 145000,
  },
  {
    id: "v_2",
    unitNumber: "02",
    registrationNumber: "ND 411-094",
    courseCode: "Code 10",
    assignedInstructor: "Instructor Sipho",
    status: "IDLE_YARD",
    fuelLevel: 85,
    nextServiceKm: 92000,
  },
  {
    id: "v_3",
    unitNumber: "03",
    registrationNumber: "ND 771-552",
    courseCode: "Code 14",
    assignedInstructor: "Instructor Khaya",
    status: "MAINTENANCE",
    fuelLevel: 12,
    nextServiceKm: 210000,
  },
];

export const LiveFleet: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Sector Header Layout */}
      <div className="border-b border-zinc-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-orange-600" /> Live Fleet Matrix
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Monitor real-time fleet asset conditions, in-cabin tasks, and active
            road allocations across Empangeni yards.
          </p>
        </div>
      </div>

      {/* Grid Execution Render */}
      <FleetGrid vehicles={MOCK_FLEET_VEHICLES} />
    </div>
  );
};
