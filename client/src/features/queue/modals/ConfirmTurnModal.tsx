import React, { useState, useEffect } from "react";
import { CheckCircle2, Play, X, UserCheck } from "lucide-react";
import { customerService } from "../../customer/services/customerService";
import type { IStaffData } from "../../customer/services/customerService";

interface ConfirmTurnModalProps {
  ticket: any | null;
  branchId?: string | null;
  defaultStaffClerkId?: string;
  onClose: () => void;
  onConfirm: (ticket: any, selectedInstructorId?: string) => void;
}

export const ConfirmTurnModal: React.FC<ConfirmTurnModalProps> = ({
  ticket,
  branchId,
  defaultStaffClerkId,
  onClose,
  onConfirm,
}) => {
  const [instructors, setInstructors] = useState<IStaffData[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>("");

  const isCompleting = ticket?.status === "Active";

  useEffect(() => {
    if (!ticket || !isCompleting || !branchId) return;

    // Pre-select the assigned preferredWorkerId if present, else fallback
    setSelectedInstructorId(
      ticket.preferredWorkerId || defaultStaffClerkId || "",
    );

    customerService
      .getBranchWorkers(branchId)
      .then((staff) => {
        setInstructors(staff);
        if (
          !ticket.preferredWorkerId &&
          staff.length > 0 &&
          !defaultStaffClerkId
        ) {
          setSelectedInstructorId(staff[0].clerkId);
        }
      })
      .catch((err) => console.error("Failed loading branch instructors:", err));
  }, [ticket, isCompleting, branchId, defaultStaffClerkId]);

  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-zinc-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl ${
                isCompleting
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-orange-50 text-orange-600 border border-orange-100"
              }`}
            >
              {isCompleting ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-900">
                {isCompleting ? "Complete Lesson & Log" : "Call Student Next"}
              </h3>
              <p className="text-xs text-zinc-500">
                Ticket #{ticket.ticketId} •{" "}
                <strong className="text-zinc-800">{ticket.name}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isCompleting ? (
          <div className="space-y-2 bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Which instructor helped this student?</span>
            </label>
            <select
              value={selectedInstructorId}
              onChange={(e) => setSelectedInstructorId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-white text-xs font-bold text-zinc-900 focus:outline-none focus:border-emerald-500"
            >
              {instructors.length === 0 ? (
                <option value={defaultStaffClerkId || ""}>
                  Current Desk Operator
                </option>
              ) : (
                instructors.map((inst) => (
                  <option key={inst.clerkId} value={inst.clerkId}>
                    {inst.name}
                  </option>
                ))
              )}
            </select>
            <p className="text-[11px] text-zinc-400">
              This credits the lesson to the selected instructor on your
              Monday-to-Monday report and deducts 1 lesson from the student.
            </p>
          </div>
        ) : (
          <p className="text-xs text-zinc-600 bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
            Move <strong>{ticket.name}</strong> to active service? Their lesson
            timer starts now.
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onConfirm(ticket, isCompleting ? selectedInstructorId : undefined)
            }
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm cursor-pointer active:scale-95 transition-all ${
              isCompleting
                ? "bg-emerald-600 hover:bg-emerald-500"
                : "bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            {isCompleting ? "Confirm & Log Lesson" : "Call Student"}
          </button>
        </div>
      </div>
    </div>
  );
};
