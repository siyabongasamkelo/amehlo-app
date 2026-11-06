import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useUser } from "@clerk/clerk-react";
import { io, Socket } from "socket.io-client"; // ➔ Import the WebSocket client library
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
  setActiveBranchId: (id: string | null) => void;
  loadLiveQueueMetrics: (branchId: string) => Promise<void>;
  insertQueueReal: (name: string, phone: string) => Promise<void>;
  updateQueueStatusReal: (
    ticketId: string,
    status: "Waiting" | "Active" | "Completed" | "Absent",
  ) => Promise<void>;
  syncAndHydrateProfile: () => Promise<void>;
  loadCompanyBranches: (companyId: string) => Promise<void>;
  setActiveCompany: (company: ICompanyData | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// 🔒 ROOT LEVEL OUT-OF-RENDER INITIALIZATION
const SOCKET_URL = "http://localhost:5000";

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
  const [completedLogs, setCompletedLogs] = useState<IQueueItem[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  const isHydratingRef = useRef<boolean>(false);
  const lastSyncedClerkIdRef = useRef<string | null>(null);

  // 📞 STATIC SOCKET REFS PERSISTING ACROSS SESSIONS
  const socketRef = useRef<typeof Socket | null>(null);

  // ➔ Initial Static Fallback Loader (Only run for fresh layout changes or boots)
  const loadLiveQueueMetrics = async (branchId: string) => {
    setIsLoadingQueue(true);
    try {
      const liveTickets = await queueService.getBranchQueue(branchId);
      setQueue(liveTickets);
      setCompletedLogs([]);
    } catch (err) {
      console.error("Initial queue hydration failure:", err);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  // ➔ Create a real entry via legacy service fallback mapping
  const insertQueueReal = async (name: string, phone: string) => {
    if (!activeBranchId) return;
    try {
      // Backend automatically broadcasts updates to everyone over socket after this triggers
      await queueService.insertTicket(activeBranchId, name, phone);
    } catch (err) {
      console.error("Failed inserting item to network path:", err);
      throw err;
    }
  };
  // ➔ Real-time action requests sent directly onto HTTP handlers (Sockets intercept the response stream)
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

  const syncAndHydrateProfile = async () => {
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
          const registrationRole =
            (clerkUser.publicMetadata?.role as string) || "owner";

          userProfile = await userService.syncClerkUser({
            clerkId: clerkUser.id,
            name: clerkUser.fullName || clerkUser.username || "Anonymous Node",
            email: clerkUser.primaryEmailAddress?.emailAddress || "",
            role: registrationRole,
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

  // 📡 PERSISTENT BACKGROUND WEBSOCKET CONNECTION LIFECYCLE
  useEffect(() => {
    // Open a single telephone pipe directly to the Express backend memory layer
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Websocket hardware layer linked successfully:", socket.id);
    });

    // 🎯 THE FIX: Listen for broadcast events from your controller to change state instantly
    socket.on("queue_updated", (updatedQueue: IQueueItem[]) => {
      console.log(
        "Real-time pipeline data stream update packet arrived:",
        updatedQueue,
      );
      setQueue(updatedQueue); // Overwrites state cleanly without any loading flashes
    });

    return () => {
      socket.disconnect();
      console.log("Persistent socket line closed safely.");
    };
  }, []);

  // 🚪 LOCATION ROOM CHANNELS LIFE SWITCH
  useEffect(() => {
    if (activeBranchId && socketRef.current) {
      // Pull initial dataset for the new physical station workspace node
      loadLiveQueueMetrics(activeBranchId);

      // Inform the server node to lock this browser context into the branch cluster channel
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
        completedLogs,
        isLoadingQueue,
        setActiveBranchId,
        loadLiveQueueMetrics,
        insertQueueReal,
        updateQueueStatusReal,
        syncAndHydrateProfile,
        loadCompanyBranches,
        setActiveCompany,
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
