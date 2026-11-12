import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useApp } from "../../../context/AppContext";
import { queueService } from "../services/queueService";
import type { IQueueItem } from "../services/queueService";
import { useBranch } from "../../branch/context/BranchContext";

interface QueueContextType {
  queue: IQueueItem[];
  isLoadingQueue: boolean;
  averageWaitTime: string;
  bestWaitTime: string;
  worstWaitTime: string;
  totalCompletedCount: number;
  rawAnalyticsLogs: any[];
  loadLiveQueueMetrics: (branchId: string) => Promise<void>;
  insertQueueReal: (
    name: string,
    phone: string,
    serviceId: string,
  ) => Promise<void>;
  updateQueueStatusReal: (
    ticketId: string,
    status: "Waiting" | "Active" | "Completed" | "Absent",
  ) => Promise<void>;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

const SOCKET_URL =
  import.meta.env.VITE_APP_ENV === "development"
    ? "http://localhost:5000"
    : "https://amehlo-app.onrender.com";

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { dbUser } = useApp();
  const { activeBranchId } = useBranch();

  const [queue, setQueue] = useState<IQueueItem[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState<boolean>(false);

  // Analytics States
  const [totalCompletedCount, setTotalCompletedCount] = useState<number>(0);
  const [averageWaitTime, setAverageWaitTime] = useState<string>("0 mins");
  const [bestWaitTime, setBestWaitTime] = useState<string>("0 mins");
  const [worstWaitTime, setWorstWaitTime] = useState<string>("0 mins");
  const [rawAnalyticsLogs, setRawAnalyticsLogs] = useState<any[]>([]);

  const socketRef = useRef<Socket | null>(null);

  const loadLiveQueueMetrics = async (branchId: string) => {
    setIsLoadingQueue(true);
    try {
      const [liveTickets, analyticsData] = await Promise.all([
        queueService.getBranchQueue(branchId),
        queueService.getBranchAnalytics(branchId),
      ]);

      setQueue(liveTickets);
      setAverageWaitTime(analyticsData?.averageWaitTime || "0 mins");
      setBestWaitTime(analyticsData?.bestWaitTime || "0 mins");
      setWorstWaitTime(analyticsData?.worstWaitTime || "0 mins");
      setTotalCompletedCount(analyticsData?.totalCompleted || 0);
      setRawAnalyticsLogs(analyticsData?.rawLogs || []);
    } catch (err) {
      console.error("Queue monitoring synchronization fault:", err);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  const insertQueueReal = async (
    name: string,
    phone: string,
    serviceId: string,
  ) => {
    if (!activeBranchId) return;
    try {
      await queueService.insertTicket(activeBranchId, name, phone, serviceId);
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
      } else if (status === "Active") {
        await queueService.startTurn(ticketId);
      } else if (status === "Completed") {
        const activeClerkId = dbUser?.clerkId || "SYSTEM_OPERATOR";
        await queueService.completeTurn(ticketId, activeClerkId);
      } else if (status === "Absent") {
        await queueService.purgeGhostClient(ticketId);
      }
    } catch (err) {
      console.error("Pipeline progression operational error:", err);
    }
  };

  // Real-time WebSocket & queue metrics tracker for the active branch
  useEffect(() => {
    if (!activeBranchId) {
      setQueue([]);
      return;
    }

    loadLiveQueueMetrics(activeBranchId);

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Websocket hardware layer linked successfully:", socket.id);
      socket.emit("join_branch_room", activeBranchId);
    });

    socket.on("queue_updated", () => {
      console.log(
        "Real-time network event heard. Re-hydrating analytics logs...",
      );
      loadLiveQueueMetrics(activeBranchId);
    });

    return () => {
      socket.disconnect();
    };
  }, [activeBranchId]);

  return (
    <QueueContext.Provider
      value={{
        queue,
        isLoadingQueue,
        averageWaitTime,
        bestWaitTime,
        worstWaitTime,
        totalCompletedCount,
        rawAnalyticsLogs,
        loadLiveQueueMetrics,
        insertQueueReal,
        updateQueueStatusReal,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) throw new Error("useQueue must be used within a QueueProvider");
  return context;
};
