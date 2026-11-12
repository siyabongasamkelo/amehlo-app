import React from "react";
import { useClerk } from "@clerk/clerk-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { useStudent } from "../context/StudentContext";
import { Car, LogOut, Phone, Mail, Loader2, Globe } from "lucide-react";
import { CourseWalletCard } from "../components/dashboard/CourseWalletCard";
import { ActiveTicketCard } from "../components/dashboard/ActiveTicketCard";
import { LessonHistoryList } from "../components/dashboard/LessonHistoryList";

export const StudentPortal: React.FC = () => {
  const { dbUser } = useApp();
  const {
    enrollment,
    isLoadingEnrollment,
    activeTicket,
    simulatePayment,
    leaveActiveQueue,
  } = useStudent();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/student/auth");
  };

  if (isLoadingEnrollment) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-sans">
        <Loader2 className="h-7 w-7 animate-spin text-orange-600 mb-2" />
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
          Loading Your Student Dashboard...
        </p>
      </div>
    );
  }

  if (!enrollment) {
    return <Navigate to="/student/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-6 px-4 font-sans antialiased">
      <div className="max-w-md mx-auto space-y-5">
        {/* TOP PROFILE HEADER */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 bg-zinc-900 text-white rounded-2xl flex items-center justify-center font-black text-base shadow-sm">
              {dbUser?.name?.charAt(0).toUpperCase() || (
                <Car className="h-5 w-5" />
              )}
            </div>
            <div>
              <h1 className="text-base font-black text-zinc-900 leading-tight">
                {dbUser?.name || "Student Driver"}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3 text-zinc-400" /> {dbUser?.email}
                </span>
                {dbUser?.phone && (
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Phone className="h-3 w-3 text-zinc-400" /> {dbUser.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="p-2.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* LIVE ACTIVE TICKET (If currently in line) */}
        {activeTicket && (
          <ActiveTicketCard
            ticket={activeTicket}
            onLeaveQueue={leaveActiveQueue}
          />
        )}

        {/* COURSE WALLET & QUEUE GATEKEEPER */}
        <CourseWalletCard
          wallet={{
            goal:
              enrollment.goal === "learners"
                ? "Learner's Licence"
                : "Driver's Licence",
            code: enrollment.code,
            isPaid: enrollment.isPaid,
            totalLessons: enrollment.totalLessons,
            lessonsSpent: enrollment.lessonsSpent,
            lessonsRemaining: enrollment.lessonsRemaining,
          }}
          onJoinQueue={() => navigate("/student/join-online")}
          onPayNow={simulatePayment}
        />

        {/* QUICK REMOTE JOIN HINT */}
        {!activeTicket &&
          enrollment.isPaid &&
          enrollment.lessonsRemaining > 0 && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 text-zinc-600">
                <Globe className="h-4 w-4 text-orange-600 shrink-0" />
                <span>
                  At the yard? Scan the wall QR poster to check in as Arrived.
                </span>
              </div>
            </div>
          )}

        {/* COMPLETED LESSON HISTORY */}
        <LessonHistoryList lessons={[]} />
      </div>
    </div>
  );
};
