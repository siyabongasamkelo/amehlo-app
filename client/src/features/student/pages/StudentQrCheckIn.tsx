import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  UserCheck,
  Loader2,
  QrCode,
  CheckCircle2,
  AlertCircle,
  LogIn,
  Wallet,
} from "lucide-react";
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
  const [justConfirmedArrival, setJustConfirmedArrival] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          setJustConfirmedArrival(true);
        })
        .catch((err) => {
          setError(
            err.response?.data?.error || "Failed to confirm yard arrival.",
          );
        })
        .finally(() => setIsConfirmingArrival(false));
    }
  }, [branchId, activeTicket?._id]);

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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 text-center max-w-sm w-full space-y-3 shadow-sm">
          <QrCode className="h-8 w-8 text-red-500 mx-auto" />
          <h2 className="text-sm font-black text-zinc-900 uppercase">
            Invalid Yard QR Code
          </h2>
          <p className="text-xs text-zinc-500">
            Please scan the official QR poster at the driving school branch.
          </p>
        </div>
      </div>
    );
  }

  if (!dbUser || dbUser.role !== "student") {
    const redirectPath = `/student/qr-checkin?branchId=${branchId}`;
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 text-center max-w-sm w-full space-y-4 shadow-sm">
          <div className="h-11 w-11 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
            <LogIn className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-black text-zinc-900">
              Sign In to Check In
            </h2>
            <p className="text-xs text-zinc-500">
              Log in to your student account to confirm your arrival at the
              yard.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate(
                `/student/auth?redirect=${encodeURIComponent(redirectPath)}`,
              )
            }
            className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs cursor-pointer"
          >
            Continue to Student Sign In
          </button>
        </div>
      </div>
    );
  }
  if (activeTicket) {
    const isSameBranch = activeTicket.branchId === branchId;

    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-6 shadow-xl space-y-5 text-center">
          <div
            className={`h-12 w-12 rounded-2xl flex items-center justify-center mx-auto ${
              isSameBranch
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {isSameBranch ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : (
              <AlertCircle className="h-6 w-6" />
            )}
          </div>

          <div className="space-y-1.5">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                isSameBranch
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {isSameBranch
                ? justConfirmedArrival
                  ? "Arrival Confirmed"
                  : "Already Checked In"
                : "Active Ticket Elsewhere"}
            </span>

            <h1 className="text-lg font-black text-zinc-900 pt-1">
              {isSameBranch
                ? `You're in the Yard Queue (#${activeTicket.ticketId})`
                : `You Already Have Ticket #${activeTicket.ticketId}`}
            </h1>

            <p className="text-xs text-zinc-500">
              {isSameBranch
                ? `Your status is ${activeTicket.presenceStatus} (Position #${activeTicket.position}). Hang tight until your instructor calls you.`
                : "You already have an active lesson ticket in line at another branch."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl p-3">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate("/student/portal")}
            className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs cursor-pointer"
          >
            View Live Ticket on Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!enrollment || !enrollment.isPaid || enrollment.lessonsRemaining <= 0) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-6 shadow-xl space-y-5 text-center">
          <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <Wallet className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-black text-zinc-900">
              {!enrollment
                ? "Complete Course Setup First"
                : !enrollment.isPaid
                  ? "Course Payment Required"
                  : "No Lessons Remaining"}
            </h1>
            <p className="text-xs text-zinc-500">
              {!enrollment
                ? "Please finish selecting your licence code and lesson bundle before checking in."
                : !enrollment.isPaid
                  ? "Your lesson bundle is currently unpaid. Complete payment on your dashboard to join the queue."
                  : "You have used all lessons in your current bundle. Top up on your dashboard to book another session."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/student/portal")}
            className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs cursor-pointer"
          >
            Go to Student Dashboard
          </button>
        </div>
      </div>
    );
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
        isRemoteJoin: false,
        preferredWorkerId: selectedWorkerId,
      });
      setActiveTicket(ticket);
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
