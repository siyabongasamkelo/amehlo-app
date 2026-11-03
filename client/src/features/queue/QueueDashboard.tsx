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

// 📱 IMPORT THE NEW COMPONENT FRAGMENT WE JUST BUILT
import { StudentDashboard } from "../students/StudentDashboard";

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
    lessonsAvailable: 0, // Enforcing Strict Financial Gate for testing
    paymentStatus: "Pending",
    overallScore: 81,
    defaultCourseCode: "Code 14",
  },
];

export const QueueDashboard: React.FC = () => {
  // 🔄 EXTEND ACTIVE VIEWS MATRIX WITH THE STUDENT VIEW PORTKEY
  type ActiveView =
    | "queue"
    | "students"
    | "pricing"
    | "fraud"
    | "fleet"
    | "revenue"
    | "student_mobile_mode"; // New testing route key

  const [activeView, setActiveView] = useState<ActiveView>("queue");
  const [profiles, setProfiles] = useState<MasterProfile[]>(INITIAL_PROFILES);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [isRegModalOpen, setIsRegModalOpen] = useState<boolean>(false);

  // 👤 PICK A MOCK STUDENT CONTEXT TO ACT AS THE LOGGED-IN MOBILE USER (e.g., Siyabonga)
  const [currentLoggedInStudent, setCurrentLoggedInStudent] =
    useState<MasterProfile>(profiles[0]);

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

  const handleInsertToQueue = (
    profile: MasterProfile,
    instructor: string,
    isPremium: boolean,
  ) => {
    if (queue.some((item) => item.profile.id === profile.id)) {
      alert("This student is already holding an active position.");
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
    skipped.isPremium = false;
    updatedList.push(skipped);

    setQueue(resequenceQueue(updatedList));
  };

  // 📱 IF USER CHOOSES STUDENT MOBILE MODE, RENDER ITS FULL SCREEN COMPONENT COMPLETELY INDEPENDENT
  if (activeView === "student_mobile_mode") {
    return (
      <StudentDashboard
        currentStudent={currentLoggedInStudent}
        globalQueue={queue}
        onUpgradePremium={handlePremiumUpgrade}
        onSignOut={() => setActiveView("queue")} // Signing out returns you to Admin Screen view
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased selection:bg-orange-600/10">
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* 🛠️ TEMPORARY TESTING HUD BLOCK AT THE VERY TOP OF ADMIN PANEL */}
      <div className="bg-zinc-900 text-white px-6 py-2.5 flex items-center justify-between text-xs font-semibold shrink-0">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          AmehloApp Environment Panel — Sandbox Simulation Portal
        </span>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400">Simulate Mobile Session User:</span>
          <select
            value={currentLoggedInStudent.id}
            onChange={(e) => {
              const selected = profiles.find((p) => p.id === e.target.value);
              if (selected) setCurrentLoggedInStudent(selected);
            }}
            className="bg-zinc-800 text-white border border-zinc-700 rounded px-2 py-0.5 focus:outline-none"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.paymentStatus})
              </option>
            ))}
          </select>
          <button
            onClick={() => setActiveView("student_mobile_mode")}
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-1 rounded transition-colors cursor-pointer"
          >
            Launch Student Mobile view ➔
          </button>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-6.5rem)]">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          isOpen={sidebarOpen}
        />

        <main className="flex-1 bg-zinc-100/40 p-6 md:p-8 space-y-6 overflow-x-hidden">
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
