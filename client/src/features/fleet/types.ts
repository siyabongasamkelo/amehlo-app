export interface FleetVehicle {
  id: string;
  unitNumber: string;
  registrationNumber: string;
  courseCode: "Code 8" | "Code 10" | "Code 14";
  assignedInstructor: string;
  status: "ACTIVE_ROAD" | "IDLE_YARD" | "MAINTENANCE";
  currentStudent?: string;
  fuelLevel: number; // Percentage
  nextServiceKm: number;
}
