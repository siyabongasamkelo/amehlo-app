import React, { useState, useEffect } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, UserCheck, Loader2, QrCode } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { useStudent } from "../context/StudentContext";
import { studentService } from "../services/studentService";
import { ServiceAndInstructorPicker } from "../../queue/ServiceAndInstructorPicker";

export const StudentQrCheckIn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get("branchId") || searchParams.get("branch");
  const navigate = useNavigate();

  const { dbUser } = useApp();
  const { enrollment, isLoadingEnrollment, activeTicket, setActiveTicket } =
    useStudent();

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmingArrival, setIsConfirmingArrival] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-confirm physical arrival if student already joined remotely for this branch!
  useEffect(() => {
    if (
      branchId &&
      activeTicket &&
      activeTicket.branchId === branchId &&
      activeTicket.presenceStatus === "Remote"
    ) {
      setIsConfirmingArrival(true);
      studentService
        .confirmStudentArrival(activeTicket._id)
        .then((updated) => {
          setActiveTicket(updated);
          navigate("/student/portal", { replace: true });
        })
        .catch(() => setIsConfirmingArrival(false));
    }
  }, [branchId, activeTicket?._id]);

  if (!dbUser || dbUser.role !== "student") {
    return <Navigate to="/student/auth" replace />;
  }

  if (isLoadingEnrollment || isConfirmingArrival) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-sans">
        <Loader2 className="h-7 w-7 animate-spin text-orange-600 mb-2" />
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          {isConfirmingArrival
            ? "Confirming Your Yard Arrival..."
            : "Checking Student Wallet..."}
        </p>
      </div>
    );
  }

  if (!branchId) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-center max-w-sm w-full space-y-2">
          <QrCode className="h-8 w-8 text-red-500 mx-auto" />
          <h2 className="text-sm font-bold text-zinc-900 uppercase">
            Invalid Yard QR Code
          </h2>
          <p className="text-xs text-zinc-500">
            Please scan the official QR poster at the driving school branch.
          </p>
        </div>
      </div>
    );
  }

  if (!enrollment?.isPaid || enrollment.lessonsRemaining <= 0 || activeTicket) {
    return <Navigate to="/student/portal" replace />;
  }

  const handleYardJoin = async () => {
    if (!selectedServiceId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const ticket = await studentService.joinStudentQueue({
        studentClerkId: dbUser.clerkId,
        branchId,
        serviceId: selectedServiceId,
        isRemoteJoin: false, // Scanned physical QR = Arrived at Yard!
        preferredWorkerId: selectedWorkerId,
      });
      setActiveTicket(ticket);
      navigate("/student/portal");
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not check in at branch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-sans antialiased">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/student/portal")}
            className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-900 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </button>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
            Yard QR Check-In
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-lg font-black text-zinc-900">
            At-Yard Lesson Check-In
          </h1>
          <p className="text-xs text-zinc-500">
            Checking in as{" "}
            <strong className="text-zinc-800">{dbUser.name}</strong> (
            {enrollment.code})
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl p-3">
            {error}
          </div>
        )}

        <ServiceAndInstructorPicker
          branchId={branchId}
          selectedServiceId={selectedServiceId}
          onSelectService={setSelectedServiceId}
          selectedWorkerId={selectedWorkerId}
          onSelectWorker={setSelectedWorkerId}
        />

        <button
          type="button"
          disabled={isSubmitting || !selectedServiceId}
          onClick={handleYardJoin}
          className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <UserCheck className="h-4 w-4 text-emerald-400" />
              <span>Confirm Yard Check-In</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
