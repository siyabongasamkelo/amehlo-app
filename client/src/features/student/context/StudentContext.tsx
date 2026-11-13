import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { io } from "socket.io-client";
import { useApp } from "../../../context/AppContext";
import { studentService } from "../services/studentService";
import type { IEnrollmentData } from "../services/studentService";
import type { IQueueItem } from "../../queue/services/queueService";

const SOCKET_URL =
  import.meta.env.VITE_APP_ENV === "development"
    ? "http://localhost:5000"
    : "https://amehlo-app.onrender.com";

interface StudentContextType {
  isSyncingStudent: boolean;
  enrollment: IEnrollmentData | null;
  isLoadingEnrollment: boolean;
  activeTicket: IQueueItem | null;
  lessonHistory: any[];
  setActiveTicket: React.Dispatch<React.SetStateAction<IQueueItem | null>>;
  syncStudentAccount: (phone?: string) => Promise<void>;
  saveOnboardingEnrollment: (
    goal: "learners" | "drivers",
    code: string,
    lessonsCount: number,
  ) => Promise<void>;
  refreshEnrollment: () => Promise<void>;
  simulatePayment: () => Promise<void>;
  leaveActiveQueue: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user: clerkUser } = useUser();
  const { dbUser, setDbUser } = useApp();

  const [isSyncingStudent, setIsSyncingStudent] = useState<boolean>(false);
  const [enrollment, setEnrollment] = useState<IEnrollmentData | null>(null);
  const [isLoadingEnrollment, setIsLoadingEnrollment] =
    useState<boolean>(false);
  const [activeTicket, setActiveTicket] = useState<IQueueItem | null>(null);
  const [lessonHistory, setLessonHistory] = useState<ILessonHistoryItem[]>([]);

  // 3. Update refreshEnrollment:
  const refreshEnrollment = async () => {
    if (!dbUser || dbUser.role !== "student") {
      setEnrollment(null);
      setLessonHistory([]);
      return;
    }

    setIsLoadingEnrollment(true);
    try {
      const [enrollmentData, ticketData, historyData] = await Promise.all([
        studentService.getStudentEnrollment(dbUser.clerkId),
        studentService.getStudentActiveTicket(dbUser.clerkId),
        studentService.getStudentLessonHistory(dbUser.clerkId),
      ]);
      setEnrollment(enrollmentData);
      setActiveTicket(ticketData);
      setLessonHistory(historyData);
    } catch (err) {
      console.error("Failed loading student course & ticket state:", err);
    } finally {
      setIsLoadingEnrollment(false);
    }
  };

  useEffect(() => {
    if (dbUser?.role === "student") {
      refreshEnrollment();
    } else {
      setEnrollment(null);
      setActiveTicket(null);
    }
  }, [dbUser?._id, dbUser?.role]);

  // Real-time Socket.IO listener when the student has an active queue ticket
  useEffect(() => {
    if (!activeTicket?._id || !activeTicket?.branchId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      upgrade: false,
    });

    socket.on("connect", () => {
      socket.emit("join_branch_room", activeTicket.branchId);
    });

    socket.on("queue_updated", (updatedQueue: any) => {
      const queueArray = Array.isArray(updatedQueue)
        ? updatedQueue
        : updatedQueue?.queue || [];

      const freshRecord = queueArray.find(
        (t: any) =>
          t._id?.toString() === activeTicket._id?.toString() ||
          t.ticketId === activeTicket.ticketId,
      );

      if (freshRecord) {
        setActiveTicket((prev) =>
          prev
            ? {
                ...prev,
                position: freshRecord.position,
                status: freshRecord.status,
                presenceStatus:
                  freshRecord.presenceStatus || prev.presenceStatus,
              }
            : null,
        );
      } else {
        // Ticket was completed or removed — clear active ticket & refresh remaining lesson count!
        setActiveTicket(null);
        refreshEnrollment();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [activeTicket?._id, activeTicket?.branchId]);

  const syncStudentAccount = async (phone?: string) => {
    if (!clerkUser?.id || isSyncingStudent) return;

    setIsSyncingStudent(true);
    try {
      const studentProfile = await studentService.syncStudentUser({
        clerkId: clerkUser.id,
        name: clerkUser.fullName || clerkUser.username || "Student Driver",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        phone: phone?.trim() || undefined,
      });
      setDbUser(studentProfile);
    } finally {
      setIsSyncingStudent(false);
    }
  };

  // Implementation inside StudentProvider:
  const saveOnboardingEnrollment = async (
    companyId: string,
    goal: "learners" | "drivers",
    code: string,
    lessonsCount: number,
    branchId?: string,
  ) => {
    if (!dbUser?.clerkId) return;

    const [updatedUser, savedEnrollment] = await Promise.all([
      studentService.assignStudentSchool(dbUser.clerkId, companyId, branchId),
      studentService.createEnrollment({
        studentClerkId: dbUser.clerkId,
        goal,
        code,
        lessonsCount,
      }),
    ]);

    setDbUser(updatedUser);
    setEnrollment(savedEnrollment);
  };

  const simulatePayment = async () => {
    if (!enrollment?._id) return;
    const updated = await studentService.payForEnrollment(enrollment._id);
    setEnrollment(updated);
  };

  const leaveActiveQueue = async () => {
    if (!activeTicket?._id) return;
    await studentService.leaveStudentQueue(activeTicket._id);
    setActiveTicket(null);
  };

  return (
    <StudentContext.Provider
      value={{
        isSyncingStudent,
        enrollment,
        isLoadingEnrollment,
        activeTicket,
        setActiveTicket,
        syncStudentAccount,
        saveOnboardingEnrollment,
        refreshEnrollment,
        simulatePayment,
        leaveActiveQueue,
        lessonHistory,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return context;
};
