import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { MetricCards } from "./components/MetricCards";
import { StudentSearchHUD } from "./components/StudentSearchHUD";
import { QueueStream } from "./components/QueueStream";
import { RegisterStudentModal } from "./components/registration/RegisterStudentModal";
import type { MasterProfile, QueueItem } from "./types/queue";
import { StudentRoster } from "../students/StudentRoster";
import { PriorityPricing } from "../finance/PriorityPricing";
import { BiometricAudits } from "../biometrics/BiometricAudits";
import { LiveFleet } from "../fleet/LiveFleet";
import { RevenueEngine } from "../finance/RevenueEngine";

// 📚 INITIAL DATABASE PROFILE SEEDS (Walk-Ins or App signups discoverable via the HUD)
const INITIAL_PROFILES: MasterProfile[] = [
  {
    id: "usr_1",
    name: "Siyabonga Mabuza",
    email: "siya@gmail.com",
    phone: "0821112223",
    whatsappNo: "27821112223",
    gender: "Male",
    drivingSchool: "Amehlo Elite",
    branch: "Empangeni",
    masterSelfieUrl: "",
    lessonsAvailable: 5,
    paymentStatus: "Paid",
    overallScore: 88,
    defaultCourseCode: "Code 8",
  },
  {
    id: "usr_2",
    name: "Amare Khumalo",
    email: "amare@gmail.com",
    phone: "0714445556",
    whatsappNo: "27714445556",
    gender: "Male",
    drivingSchool: "Amehlo Elite",
    branch: "Empangeni",
    masterSelfieUrl: "",
    lessonsAvailable: 12,
    paymentStatus: "Paid",
    overallScore: 92,
    defaultCourseCode: "Code 10",
    preferredInstructorDefault: "Instructor Jabu",
  },
  {
    id: "usr_3",
    name: "Zane Pillay",
    email: "zane@gmail.com",
    phone: "0849990001",
    whatsappNo: "27849990001",
    gender: "Male",
    drivingSchool: "Amehlo Elite",
    branch: "Empangeni",
    masterSelfieUrl: "",
    lessonsAvailable: 8,
    paymentStatus: "Paid",
    overallScore: 81,
    defaultCourseCode: "Code 14",
  },
];

export const QueueDashboard: React.FC = () => {
  // Add a simple View type at the top of your orchestrator
  type ActiveView =
    | "queue"
    | "students"
    | "pricing"
    | "fraud"
    | "fleet"
    | "revenue";

  // Inside your main component:
  // const [currentView, setCurrentView] = useState<ActiveView>("queue");

  const [activeView, setActiveView] = useState<ActiveView>("queue");

  // ⚡ Crucial: Initializing the master profiles state ledger
  const [profiles, setProfiles] = useState<MasterProfile[]>(INITIAL_PROFILES);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isRegModalOpen, setIsRegModalOpen] = useState<boolean>(false);

  // Recalculates waiting sequence indices and fluid 40-minute ETA blocks rolling forward
  const resequenceQueue = (currentList: QueueItem[]): QueueItem[] => {
    return currentList.map((item, idx) => {
      let status: "Active" | "Up Next" | "Waiting" = "Waiting";
      if (idx === 0) status = "Active";
      else if (idx === 1) status = "Up Next";

      return {
        ...item,
        position: idx + 1,
        status,
        elapsed: idx === 0 ? "22 mins left" : undefined,
        estWait:
          idx === 0
            ? "Active"
            : idx === 1
              ? "Next up"
              : `${(idx - 1) * 40} mins`,
      };
    });
  };

  // Triggers when the SearchHUD selects an available student account and inserts them into cars
  const handleInsertToQueue = (
    profile: MasterProfile,
    instructor: string,
    isPremium: boolean,
  ) => {
    if (queue.some((item) => item.profile.id === profile.id)) {
      alert(
        "This student is already holding an active position in the live session stream.",
      );
      return;
    }

    const newSession: QueueItem = {
      id: `sess_${Date.now()}`,
      profile,
      position: queue.length + 1,
      status: "Waiting",
      assignedInstructor: instructor,
      targetCourseCode: profile.defaultCourseCode,
      isPremium,
      waitingForPreferredInstructor: instructor !== "Any Available",
    };

    let updatedList = [...queue, newSession];

    if (isPremium) {
      const active = updatedList.filter((i) => i.status === "Active");
      const waiting = updatedList.filter((i) => i.status !== "Active");
      const sortedWaiting = [...waiting].sort((a, b) =>
        a.isPremium && !b.isPremium ? -1 : !a.isPremium && b.isPremium ? 1 : 0,
      );
      updatedList = [...active, ...sortedWaiting];
    }

    setQueue(resequenceQueue(updatedList));
  };

  // Appends newly generated profiles from our manual fallback webcam wizard modal straight to local memory array
  const handleManualProfileEnrollment = (newProfile: MasterProfile) => {
    setProfiles((prev) => [newProfile, ...prev]);
  };

  const handlePremiumUpgrade = (id: string) => {
    const updated = queue.map((item) =>
      item.id === id ? { ...item, isPremium: true } : item,
    );
    const active = updated.filter((i) => i.status === "Active");
    const waiting = updated.filter((i) => i.status !== "Active");
    const sortedWaiting = [...waiting].sort((a, b) =>
      a.isPremium && !b.isPremium
        ? -1
        : !a.isPremium && b.isPremium
          ? 1
          : a.position - b.position,
    );
    setQueue(resequenceQueue([...active, ...sortedWaiting]));
  };

  const handleSkipStudent = (id: string) => {
    const targetIdx = queue.findIndex((item) => item.id === id);
    if (targetIdx === -1) return;

    const updatedList = [...queue];
    const [skipped] = updatedList.splice(targetIdx, 1);
    skipped.isPremium = false; // Revoke shortcuts on no-show
    updatedList.push(skipped);

    setQueue(resequenceQueue(updatedList));
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased selection:bg-orange-600/10">
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          isOpen={sidebarOpen}
        />

        <main className="flex-1 bg-zinc-100/40 p-6 md:p-8 space-y-6 overflow-x-hidden">
          {/* ⚡ CONDITIONAL LAYOUT CONDENSER */}
          {activeView === "queue" && (
            <>
              <StudentSearchHUD
                masterProfiles={profiles}
                onInsertToQueue={handleInsertToQueue}
                onOpenRegistration={() => setIsRegModalOpen(true)}
              />
              <MetricCards queue={queue} />
              <QueueStream
                queue={queue}
                onUpgrade={handlePremiumUpgrade}
                onSkip={handleSkipStudent}
              />
            </>
          )}

          {activeView === "students" && (
            <StudentRoster
              masterProfiles={profiles}
              onOpenRegistration={() => setIsRegModalOpen(true)}
            />
          )}

          {activeView === "pricing" && <PriorityPricing queue={queue} />}
          {activeView === "fraud" && <BiometricAudits />}
          {activeView === "fleet" && <LiveFleet />}
          {activeView === "revenue" && <RevenueEngine />}

          {/* Fallback placeholders for other views while prototyping */}
          {activeView !== "queue" && activeView !== "students" && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center text-zinc-400">
              <p className="font-bold text-zinc-700 capitalize">
                {activeView} Workspace View
              </p>
              <p className="text-xs mt-1">
                Prototype space under construction.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Modern Multi-step Webcam Registration Wizard Overlay */}
      <RegisterStudentModal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        onRegisterComplete={handleManualProfileEnrollment}
        currentBranch="Empangeni"
        drivingSchoolName="Amehlo Elite Driving School"
      />
    </div>
  );
};
