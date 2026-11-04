import React, { createContext, useContext, useState, useEffect } from "react";
import type { QueueItem, CompletionLog } from "../types/queue";

// 1. DATA ENTITY BLUEPRINTS
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "owner" | "worker";
  assignedBranchId?: string; // Workers are locked here
}

export interface BranchNode {
  id: string;
  name: string;
  phone: string;
  inviteCode: string;
}

interface AppContextType {
  user: UserProfile | null;
  branches: BranchNode[];
  activeBranchId: string | null;
  queue: QueueItem[];
  completedLogs: CompletionLog[];
  loginSimulated: (name: string, email: string, inviteCode?: string) => void;
  logoutSimulated: () => void;
  addBranchSimulated: (name: string, phone: string) => void;
  switchBranchSimulated: (id: string) => void;
  insertQueueSimulated: (name: string, phone: string, email?: string) => void;
  skipQueueSimulated: (id: string) => void;
  completeQueueSimulated: (id: string) => void;
  markAbsentSimulated: (id: string) => void; // 👻 Ghost client handler built-in!
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 2. PERSISTENCE LAYER SYNCHRONIZATION VIA LOCALSTORAGE
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("amehlo_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [branches, setBranches] = useState<BranchNode[]>(() => {
    const saved = localStorage.getItem("amehlo_branches");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "br_1",
            name: "Empangeni Central",
            phone: "035 111 2222",
            inviteCode: "AMHL-EMP-92",
          },
          {
            id: "br_2",
            name: "Richards Bay Mall",
            phone: "035 222 3333",
            inviteCode: "AMHL-RBY-14",
          },
        ];
  });

  const [activeBranchId, setActiveBranchId] = useState<string | null>(() => {
    return localStorage.getItem("amehlo_active_branch") || "br_1";
  });

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [completedLogs, setCompletedLogs] = useState<CompletionLog[]>([]);

  // Keep LocalStorage synchronized on mutations
  useEffect(() => {
    if (user) localStorage.setItem("amehlo_user", JSON.stringify(user));
    else localStorage.removeItem("amehlo_user");
  }, [user]);

  useEffect(() => {
    localStorage.setItem("amehlo_branches", JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    if (activeBranchId)
      localStorage.setItem("amehlo_active_branch", activeBranchId);
  }, [activeBranchId]);

  // 3. EMULATED ENGINE METHODS (FIGHTING COHESIVE SYSTEM LOGIC)
  const loginSimulated = (name: string, email: string, inviteCode?: string) => {
    const isWorker = inviteCode && inviteCode.trim() !== "";
    const matchedBranch = branches.find(
      (b) => b.inviteCode.toUpperCase() === inviteCode?.toUpperCase(),
    );

    const profile: UserProfile = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: isWorker ? "worker" : "owner",
      assignedBranchId: isWorker ? matchedBranch?.id || "br_1" : undefined,
    };

    setUser(profile);
    if (isWorker) {
      setActiveBranchId(matchedBranch?.id || "br_1");
    }
  };

  const logoutSimulated = () => {
    setUser(null);
    setQueue([]);
    setCompletedLogs([]);
    localStorage.removeItem("amehlo_user");
  };

  const addBranchSimulated = (name: string, phone: string) => {
    const slug = name.substring(0, 3).toUpperCase();
    const newBranch: BranchNode = {
      id: `br_${Date.now()}`,
      name,
      phone,
      inviteCode: `AMHL-${slug}-${Math.floor(10 + Math.random() * 90)}`,
    };
    setBranches([...branches, newBranch]);
    setActiveBranchId(newBranch.id); // Auto jump into newly provisioned cluster
  };

  const switchBranchSimulated = (id: string) => {
    if (user?.role === "worker") return; // Security boundary guard
    setActiveBranchId(id);
    setQueue([]); // Clear transient client lanes on system switches
  };

  // 4. TRANSITIONAL ENGINE FOR QUEUE MANAGEMENT PIPELINE
  const resequence = (list: QueueItem[]): QueueItem[] => {
    return list.map((item, idx) => ({
      ...item,
      position: idx + 1,
      status: idx === 0 ? "Active" : idx === 1 ? "Up Next" : "Waiting",
      estWait:
        idx === 0
          ? "At Front"
          : idx === 1
            ? "Next up"
            : `${(idx - 1) * 15} mins est.`,
    }));
  };

  const insertQueueSimulated = (
    name: string,
    phone: string,
    email?: string,
  ) => {
    const nextTicket = Math.floor(100 + Math.random() * 900);
    const newEntry: QueueItem = {
      id: String(nextTicket),
      profile: { id: `cust_${Date.now()}`, name, phone, email },
      position: queue.length + 1,
      status: "Waiting",
      timestampAdded: Date.now(),
    };
    setQueue(resequence([...queue, newEntry]));
  };

  const skipQueueSimulated = (id: string) => {
    const updated = [...queue];
    const targetIdx = updated.findIndex((i) => i.id === id);
    if (targetIdx === -1) return;
    const [item] = updated.splice(targetIdx, 1);
    updated.push(item);
    setQueue(resequence(updated));
  };

  const completeQueueSimulated = (id: string) => {
    const target = queue.find((i) => i.id === id);
    if (target) {
      setCompletedLogs((prev) => [
        {
          id: target.id,
          addedAt: target.timestampAdded,
          completedAt: Date.now(),
        },
        ...prev,
      ]);
    }
    setQueue(resequence(queue.filter((i) => i.id !== id)));
  };

  const markAbsentSimulated = (id: string) => {
    // 👻 Drop ghost client cleanly out of live stack loops without logging as completed throughput
    setQueue(resequence(queue.filter((i) => i.id !== id)));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        branches,
        activeBranchId,
        queue,
        completedLogs,
        loginSimulated,
        logoutSimulated,
        addBranchSimulated,
        switchBranchSimulated,
        insertQueueSimulated,
        skipQueueSimulated,
        completeQueueSimulated,
        markAbsentSimulated,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error(
      "useApp must be utilized within an AppProvider context shell.",
    );
  return context;
};
