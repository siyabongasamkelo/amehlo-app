import React, { useState } from "react";
import { Layers, Award, BookOpen } from "lucide-react";
import type { MasterProfile, QueueItem } from "../queue/types/queue";

// Atomic Fragment File Imports
import { StudentHeader } from "./components/StudentHeader";
import { StudentStatusHub } from "./components/StudentStatusHub";
import { StudentReadOnlyStream } from "./components/StudentReadOnlyStream";

interface StudentDashboardProps {
  currentStudent: MasterProfile;
  globalQueue: QueueItem[];
  onUpgradePremium: (id: string) => void;
  onSignOut: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentStudent,
  globalQueue,
  onUpgradePremium,
  onSignOut,
}) => {
  // Syncing states mapping cleanly to our internal UI refresh animations
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [k53HighScore] = useState<number | null>(92);

  // Evaluate structural constraints and conditional triggers
  const myActiveSession = globalQueue.find(
    (item) => item.profile.id === currentStudent.id,
  );
  const isBlocked =
    currentStudent.lessonsAvailable === 0 ||
    currentStudent.paymentStatus === "Pending";

  const handleManualSyncRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased selection:bg-orange-600/10 flex flex-col">
      {/* 🧩 PORTAL BRAND HEADER HOOK */}
      <StudentHeader
        currentStudent={currentStudent}
        isRefreshing={isRefreshing}
        onRefreshSync={handleManualSyncRefresh}
        onSignOut={onSignOut}
      />

      {/* 📱 MOBILE VIEW COMPONENT CANVAS FRAME */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-5 pb-12">
        {/* 🧩 DYNAMIC INTERACTIVE STATUS HUB */}
        <StudentStatusHub
          currentStudent={currentStudent}
          myActiveSession={myActiveSession}
          isBlocked={isBlocked}
          onUpgradePremium={onUpgradePremium}
        />

        {/* 📊 PERSONAL VALUE CARD METRICS (Direct style-match from MetricCards.tsx) */}
        <div className="grid grid-cols-2 gap-4">
          {/* Module 1: Lessons Remaining Token Counter */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Lessons Left
              </p>
              <p className="text-base font-black text-zinc-900 mt-1">
                {currentStudent.lessonsAvailable} Available
              </p>
            </div>
            <div
              className={`p-2 rounded-lg border shrink-0 ${isBlocked ? "bg-red-50 text-red-500 border-red-100" : "bg-zinc-50 text-zinc-500 border-zinc-100"}`}
            >
              <Layers className="h-4 w-4" />
            </div>
          </div>

          {/* Module 2: Localized K53 Progress Simulator Score */}
          <div className="bg-gradient-to-br from-white to-orange-50/20 border border-zinc-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                K53 Sim Score
              </p>
              <p className="text-base font-black text-zinc-900 mt-1">
                {k53HighScore ? `${k53HighScore}% Pass` : "0%"}
              </p>
            </div>
            <div className="p-2 bg-orange-50 border border-orange-100 rounded-lg text-orange-600 shrink-0">
              <Award className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* 🧩 ANONYMISED CONVEYOR TIMELINE STREAM */}
        <StudentReadOnlyStream
          globalQueue={globalQueue}
          myProfileId={currentStudent.id}
        />

        {/* 🎯 K53 ADAPTIVE ENTRY BANNER HUB */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-4 cursor-pointer hover:scale-[1.01] active:scale-98 transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-orange-400 font-bold uppercase tracking-wider">
              <BookOpen className="h-3.5 w-3.5" /> K53 Mastery Center
            </div>
            <h4 className="font-bold text-sm tracking-tight text-white">
              Sharpen your road rules!
            </h4>
            <p className="text-[11px] text-zinc-400 leading-normal max-w-[220px]">
              Kill time in the waiting room by running high-fidelity countdown
              test sims.
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-lg text-orange-500 shadow-inner shrink-0">
            K53
          </div>
        </div>
      </main>
    </div>
  );
};
