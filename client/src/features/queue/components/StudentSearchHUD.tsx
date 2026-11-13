import React, { useState, useEffect } from "react";
import { UserPlus, AlertCircle, Loader2 } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { useBranch } from "../../branch/context/BranchContext";
import { useCompany } from "../../company/context/CompanyContext";
import { useServices } from "../../services/context/ServiceContext";
import { customerService } from "../../customer/services/customerService";
import type { IStaffData } from "../../customer/services/customerService";
import { studentService } from "../../student/services/studentService";
import type { ISearchedStudent } from "../../student/services/studentService";
import { StudentSearchBox } from "./StudentSearchBox";
import { QueueRoutingSelects } from "./QueueRoutingSelects";

export const StudentSearchHUD: React.FC = () => {
  const { dbUser } = useApp();
  const { activeBranchId } = useBranch();
  const { activeCompany } = useCompany();
  const { services, isLoadingServices } = useServices();

  const companyId = activeCompany?._id || dbUser?.assignedCompanyId;

  const [selectedStudent, setSelectedStudent] =
    useState<ISearchedStudent | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [branchStaff, setBranchStaff] = useState<IStaffData[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!activeBranchId) return;
    const fetchBranchRoster = async () => {
      setIsLoadingStaff(true);
      try {
        const staffData =
          await customerService.getBranchWorkers(activeBranchId);
        setBranchStaff(staffData);
      } catch (err) {
        console.error("Failed loading staff roster:", err);
      } finally {
        setIsLoadingStaff(false);
      }
    };
    fetchBranchRoster();
  }, [activeBranchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !activeBranchId || !selectedServiceId) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await studentService.joinStudentQueue({
        studentClerkId: selectedStudent.clerkId,
        branchId: activeBranchId,
        serviceId: selectedServiceId,
        isRemoteJoin: false,
        preferredWorkerId:
          selectedWorkerId.trim() !== "" ? selectedWorkerId : null,
      });

      setSelectedStudent(null);
      setSelectedServiceId("");
      setSelectedWorkerId("");
    } catch (err: any) {
      const backendError =
        err?.response?.data?.error ||
        "Could not add student to queue. Verify payment & remaining lessons.";
      setErrorMsg(backendError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-zinc-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-3.5 animate-in fade-in duration-150"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
            Desk Student Check-In
          </h3>
        </div>
        <p className="text-[11px] text-zinc-400 font-medium">
          Search enrolled driving school students to assign a lane
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* UNIFIED SINGLE-ROW TOOLBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-center">
        <div className="lg:col-span-5">
          <StudentSearchBox
            companyId={companyId}
            selectedStudent={selectedStudent}
            onSelectStudent={setSelectedStudent}
            onClearStudent={() => setSelectedStudent(null)}
            onClearError={() => setErrorMsg(null)}
          />
        </div>

        <div className="lg:col-span-5">
          <QueueRoutingSelects
            services={services}
            isLoadingServices={isLoadingServices}
            selectedServiceId={selectedServiceId}
            onSelectService={setSelectedServiceId}
            branchStaff={branchStaff}
            isLoadingStaff={isLoadingStaff}
            selectedWorkerId={selectedWorkerId}
            onSelectWorker={setSelectedWorkerId}
          />
        </div>

        <div className="lg:col-span-2">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              isLoadingServices ||
              isLoadingStaff ||
              !selectedStudent ||
              !selectedServiceId
            }
            className="w-full h-10 inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-4 shadow-sm active:scale-95 transition-all text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <UserPlus className="h-3.5 w-3.5" />
            )}
            <span>Add to Queue</span>
          </button>
        </div>
      </div>
    </form>
  );
};
