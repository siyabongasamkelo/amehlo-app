import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useUser } from "@clerk/clerk-react";
import { io, Socket } from "socket.io-client";
import { userService } from "../features/user/userService";
import type { IUserData } from "../features/user/userService";
import { companyService } from "../features/company/services/companyService";
import type { ICompanyData } from "../features/company/services/companyService";
import type { IBranchData } from "../features/branch/services/branchService";
import { branchService } from "../features/branch/services/branchService";
import type { IQueueItem } from "../features/queue/services/queueService";
import { queueService } from "../features/queue/services/queueService";

interface AppContextType {
  dbUser: IUserData | null;
  activeCompany: ICompanyData | null;
  branches: IBranchData[];
  isLoadingProfile: boolean;
  isLoadingBranches: boolean;
  activeBranchId: string | null;
  queue: IQueueItem[];
  completedLogs: IQueueItem[];
  isLoadingQueue: boolean;

  bestWaitTime: string;
  worstWaitTime: string;
  rawAnalyticsLogs: any[];
  averageWaitTime: string;
  totalCompletedCount: number;
  syncAndHydrateProfile: (inviteCode?: string) => Promise<void>;

  setActiveBranchId: (id: string | null) => void;
  loadLiveQueueMetrics: (branchId: string) => Promise<void>;
  insertQueueReal: (name: string, phone: string) => Promise<void>;
  updateQueueStatusReal: (
    ticketId: string,
    status: "Waiting" | "Active" | "Completed" | "Absent",
  ) => Promise<void>;
  // syncAndHydrateProfile: () => Promise<void>;
  loadCompanyBranches: (companyId: string) => Promise<void>;
  setActiveCompany: (company: ICompanyData | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SOCKET_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://onrender.com";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const [dbUser, setDbUser] = useState<IUserData | null>(null);
  const [activeCompany, setActiveCompany] = useState<ICompanyData | null>(null);
  const [branches, setBranches] = useState<IBranchData[]>([]);
  const [queue, setQueue] = useState<IQueueItem[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [isLoadingBranches, setIsLoadingBranches] = useState<boolean>(false);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  // ⚡ COMPUTE STATE MANAGEMENT UNITS
  const [totalCompletedCount, setTotalCompletedCount] = useState<number>(0);
  const [averageWaitTime, setAverageWaitTime] = useState<string>("0 mins");
  const [bestWaitTime, setBestWaitTime] = useState<string>("0 mins");
  const [worstWaitTime, setWorstWaitTime] = useState<string>("0 mins");
  const [rawAnalyticsLogs, setRawAnalyticsLogs] = useState<any[]>([]);

  const isHydratingRef = useRef<boolean>(false);
  const lastSyncedClerkIdRef = useRef<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // ➔ Initial Static Fallback Loader
  const loadLiveQueueMetrics = async (branchId: string) => {
    setIsLoadingQueue(true);
    try {
      const [liveTickets, analyticsData] = await Promise.all([
        queueService.getBranchQueue(branchId),
        queueService.getBranchAnalytics(branchId),
      ]);

      // 🎯 FIXED: Fully unblocked by applying the updated interface matching your backend payload
      setQueue(liveTickets);
      setAverageWaitTime(analyticsData?.averageWaitTime || "0 mins");
      setBestWaitTime(analyticsData?.bestWaitTime || "0 mins");
      setWorstWaitTime(analyticsData?.worstWaitTime || "0 mins");
      setTotalCompletedCount(analyticsData?.totalCompleted || 0);
      setRawAnalyticsLogs(analyticsData?.rawLogs || []);
    } catch (err) {
      console.error("Queue monitoring synchronization fault:", err);
    }
    bits: {
      setIsLoadingQueue(false);
    }
  };

  const insertQueueReal = async (name: string, phone: string) => {
    if (!activeBranchId) return;
    try {
      await queueService.insertTicket(activeBranchId, name, phone);
    } catch (err) {
      console.error("Failed inserting item to network path:", err);
      throw err;
    }
  };

  const updateQueueStatusReal = async (
    ticketId: string,
    status: "Waiting" | "Active" | "Completed" | "Absent",
  ) => {
    if (!activeBranchId) return;
    try {
      if (status === "Waiting") {
        await queueService.skipTurn(ticketId);
      } else if (status === "Completed") {
        await queueService.completeTurn(ticketId);
      } else if (status === "Absent") {
        await queueService.purgeGhostClient(ticketId);
      }
    } catch (err) {
      console.error("Pipeline progression operational error:", err);
    }
  };

  const loadCompanyBranches = async (companyId: string) => {
    setIsLoadingBranches(true);
    try {
      const data = await branchService.getCompanyBranches(companyId);
      setBranches(data);
    } catch (err) {
      console.error("Failed fetching physical stations:", err);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const syncAndHydrateProfile = async (inviteCode?: string) => {
    if (!clerkUser?.id || isHydratingRef.current) return;

    isHydratingRef.current = true;
    setIsLoadingProfile(true);

    try {
      let userProfile;
      try {
        userProfile = await userService.getUserProfile(clerkUser.id);
      } catch (err: any) {
        if (err.response?.status === 404) {
          console.log(
            "New user detected in Clerk, performing lazy database sync...",
          );

          // ⚡ AUTOMATED ROLE RESOLUTION DETERMINATION ENGINE:
          // If an invite code token exists, register them as a worker node, otherwise create an owner path
          const registrationRole = inviteCode?.trim()
            ? "worker"
            : (clerkUser.publicMetadata?.role as string) || "owner";

          userProfile = await userService.syncClerkUser({
            clerkId: clerkUser.id,
            name: clerkUser.fullName || clerkUser.username || "Anonymous Node",
            email: clerkUser.primaryEmailAddress?.emailAddress || "",
            role: registrationRole as "owner" | "worker",
            inviteCode: inviteCode?.trim() || undefined, // Pass token code metrics downstream to backend if active
          });
        } else {
          throw err;
        }
      }

      setDbUser(userProfile);
      lastSyncedClerkIdRef.current = clerkUser.id;

      const companies = await companyService.getOwnerCompanies(userProfile._id);
      if (companies.length > 0) {
        setActiveCompany(companies[0]);
      }
    } catch (err) {
      console.error("Critical Hydration Core structural breakdown:", err);
    } finally {
      setIsLoadingProfile(false);
      isHydratingRef.current = false;
    }
  };

  // 📡 WEBSOCKET CONNECTION LIFECYCLE MANAGEMENT LOOP
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Websocket hardware layer linked successfully:", socket.id);
    });

    socket.on("queue_updated", () => {
      if (activeBranchId) {
        console.log(
          "Real-time network event heard. Re-hydrating analytics logs...",
        );
        loadLiveQueueMetrics(activeBranchId);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [activeBranchId]);

  // 🚪 LOCATION ROOM CHANNELS LIFE SWITCH
  useEffect(() => {
    if (activeBranchId && socketRef.current) {
      loadLiveQueueMetrics(activeBranchId);
      socketRef.current.emit("join_branch_room", activeBranchId);
    }
  }, [activeBranchId]);

  useEffect(() => {
    if (branches.length > 0 && !activeBranchId) {
      setActiveBranchId(branches[0]._id);
    }
  }, [branches, activeBranchId]);

  useEffect(() => {
    if (activeCompany?._id) {
      loadCompanyBranches(activeCompany._id);
    } else {
      setBranches([]);
    }
  }, [activeCompany?._id]);

  useEffect(() => {
    const clerkIdString = clerkUser?.id;

    if (isClerkLoaded && clerkIdString) {
      if (lastSyncedClerkIdRef.current === clerkIdString) return;
      syncAndHydrateProfile();
    } else if (isClerkLoaded && !clerkIdString) {
      setDbUser(null);
      setActiveCompany(null);
      setBranches([]);
      lastSyncedClerkIdRef.current = null;
      setIsLoadingProfile(false);
    }
  }, [clerkUser?.id, isClerkLoaded]);

  return (
    <AppContext.Provider
      value={{
        dbUser,
        activeCompany,
        branches,
        isLoadingProfile,
        isLoadingBranches,
        activeBranchId,
        queue,
        completedLogs: [],
        isLoadingQueue,
        setActiveBranchId,
        loadLiveQueueMetrics,
        insertQueueReal,
        updateQueueStatusReal,
        syncAndHydrateProfile,
        loadCompanyBranches,
        setActiveCompany,
        averageWaitTime,
        totalCompletedCount,
        bestWaitTime,
        worstWaitTime,
        rawAnalyticsLogs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
