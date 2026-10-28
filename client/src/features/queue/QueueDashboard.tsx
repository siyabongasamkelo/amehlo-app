import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { MetricCards } from "./components/MetricCards";
import { StudentSearchHUD } from "./components/StudentSearchHUD";
import { QueueStream } from "./components/QueueStream";
import type { MasterProfile, QueueItem } from "./types/queue";

// Mock DB representing fully registered users via mobile or admin fallback
const GLOBAL_DATABASE_PROFILES: MasterProfile[] = [
  {
    id: "usr_1",
    name: "Siyabonga Mabuza",
    email: "siya@gmail.com",
    phone: "0821112223",
    whatsappNo: "27821112223",
    gender: "Male",
    drivingSchool: "Amehlo Elite",
    branch: "Empangeni",
    masterSelfieUrl: "https://unsplash.com",
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
    masterSelfieUrl: "https://unsplash.com",
    lessonsAvailable: 12,
    paymentStatus: "Paid",
    overallScore: 92,
    defaultCourseCode: "Code 10",
    preferredInstructorDefault: "Instructor Jabu",
  },
  {
    id: "usr_3",
    name: "Thando Ndlovu",
    email: "thando@gmail.com",
    phone: "0637778889",
    whatsappNo: "27637778889",
    gender: "Female",
    drivingSchool: "Amehlo Elite",
    branch: "Richards Bay",
    masterSelfieUrl: "https://unsplash.com",
    lessonsAvailable: 0,
    paymentStatus: "Pending",
    overallScore: 74,
    defaultCourseCode: "Code 8",
  },
  {
    id: "usr_4",
    name: "Zane Pillay",
    email: "zane@gmail.com",
    phone: "0849990001",
    whatsappNo: "27849990001",
    gender: "Male",
    drivingSchool: "Amehlo Elite",
    branch: "Empangeni",
    masterSelfieUrl: "https://unsplash.com",
    lessonsAvailable: 8,
    paymentStatus: "Paid",
    overallScore: 81,
    defaultCourseCode: "Code 14",
  },
];

export const QueueDashboard: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    // Structural Business Rules Enforced
    if (queue.some((item) => item.profile.id === profile.id)) return; // Prevent double insertion

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
    skipped.isPremium = false; // Demote shortcut status on skip
    updatedList.push(skipped);

    setQueue(resequenceQueue(updatedList));
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased selection:bg-orange-600/10">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar isOpen={sidebarOpen} />
        <main className="flex-1 bg-zinc-100/40 p-6 md:p-8 space-y-6 overflow-x-hidden">
          <StudentSearchHUD
            masterProfiles={GLOBAL_DATABASE_PROFILES}
            onInsertToQueue={handleInsertToQueue}
          />
          <MetricCards queue={queue} />
          <QueueStream
            queue={queue}
            onUpgrade={handlePremiumUpgrade}
            onSkip={handleSkipStudent}
          />
        </main>
      </div>
    </div>
  );
};
