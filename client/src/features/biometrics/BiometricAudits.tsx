import React, { useState } from "react";
import { Shield } from "lucide-react";
import type { BiometricAuditLog } from "./types";
import { AuditLogsTable } from "./components/AuditLogsTable";
import { BiometricInspector } from "./components/BiometricInspector";

const MOCK_AUDIT_LOGS: BiometricAuditLog[] = [
  {
    id: "AUD-8821",
    studentName: "Siyabonga Mabuza",
    courseCode: "Code 8",
    instructorName: "Any Available (Fleet Unit 3)",
    timestamp: "2026-10-30 16:12",
    matchScore: 97.4,
    status: "VERIFIED",
    vehicleReg: "ND 882-901",
  },
  {
    id: "AUD-8794",
    studentName: "Amare Khumalo",
    courseCode: "Code 10",
    instructorName: "Instructor Jabu",
    timestamp: "2026-10-30 15:30",
    matchScore: 94.1,
    status: "VERIFIED",
    vehicleReg: "ND 411-094",
  },
  {
    id: "AUD-8761",
    studentName: "Zane Pillay",
    courseCode: "Code 14",
    instructorName: "Instructor Sipho",
    timestamp: "2026-10-30 14:15",
    matchScore: 34.2,
    status: "FAILED",
    vehicleReg: "ND 771-552",
  },
  {
    id: "AUD-8640",
    studentName: "Thando Ndlovu",
    courseCode: "Code 8",
    instructorName: "Instructor Jabu",
    timestamp: "2026-10-29 11:05",
    matchScore: 0.0,
    status: "PENDING_REVIEW",
    vehicleReg: "ND 882-901",
  },
];

export const BiometricAudits: React.FC = () => {
  const [selectedAudit, setSelectedAudit] = useState<BiometricAuditLog>(
    MOCK_AUDIT_LOGS[2],
  ); // Default focus on the failed audit row

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* SECTOR TITLE HEAD */}
      <div className="border-b border-zinc-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-600 fill-orange-600/10" /> AI
          Biometric Audit Control
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Cross-examine cockpit identity integrity captures directly against
          front desk biometric master indices.
        </p>
      </div>

      {/* CORE SYMMETRY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AuditLogsTable
            logs={MOCK_AUDIT_LOGS}
            selectedId={selectedAudit.id}
            onSelectLog={setSelectedAudit}
          />
        </div>
        <div className="lg:col-span-1">
          <BiometricInspector log={selectedAudit} />
        </div>
      </div>
    </div>
  );
};
