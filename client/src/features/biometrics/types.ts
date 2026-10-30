export interface BiometricAuditLog {
  id: string;
  studentName: string;
  courseCode: string;
  instructorName: string;
  timestamp: string;
  matchScore: number;
  status: "VERIFIED" | "FAILED" | "PENDING_REVIEW";
  vehicleReg: string;
}
