import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { useApp } from "../../context/AppContext";
import { useQueue } from "./context/QueueContext";
import { useServices } from "../services/context/ServiceContext";
import { useBranch } from "../branch/context/BranchContext";

import { StudentSearchHUD } from "./components/StudentSearchHUD";
import { TvDisplay } from "./components/TvDisplay";
import { SettingsPanel } from "./components/SettingsPanel";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import { DashboardHeader } from "./components/DashboardHeader";
import { QueueMetricsBar } from "./components/QueueMetricsBar";
import { QueueWorkspace } from "./components/QueueWorkspace";
import { StationQrModal } from "./modals/StationQrModal";
import { ConfirmTurnModal } from "./modals/ConfirmTurnModal";

export const QueueDashboard: React.FC = () => {
  const { dbUser: user } = useApp();
  const { branches, activeBranchId, setActiveBranchId } = useBranch();
  const {
    queue,
    rawAnalyticsLogs,
    isLoadingQueue,
    insertQueueReal,
    updateQueueStatusReal,
    averageWaitTime,
    totalCompletedCount,
    bestWaitTime,
    worstWaitTime,
  } = useQueue();
  const { services } = useServices();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  // Overlay & Modal Visibility States
  const [isFullscreenDisplay, setIsFullscreenDisplay] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [promptTicket, setPromptTicket] = useState<any | null>(null);

  const currentBranch =
    branches.find((b) => b._id === activeBranchId) || branches[0];
  const [contactPhone, setContactPhone] = useState<string>(
    currentBranch?.phone || "035 111 2222",
  );

  const handleManualInsert = async (
    name: string,
    phone: string,
    serviceId: string,
  ) => {
    if (!activeBranchId) return;
    try {
      await insertQueueReal(name, phone, serviceId);
    } catch (err) {
      console.error("Manual lane injection failure:", err);
    }
  };

  const handleTerminalSignOut = async () => {
    const confirmExit = window.confirm(
      "Are you sure you want to log out of this terminal station?",
    );
    if (!confirmExit) return;
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Failed to disconnect session:", err);
    }
  };

  const handleConfirmTurn = (ticket: any) => {
    const nextStatus = ticket.status === "Active" ? "Completed" : "Active";
    updateQueueStatusReal(ticket._id, nextStatus);
    setPromptTicket(null);
  };

  // Fullscreen Sub-Panel Interceptors
  if (isFullscreenDisplay) {
    return (
      <TvDisplay
        queue={queue}
        businessName="Amehlo Queue"
        branchName={currentBranch?.name || "Terminal Station"}
        onClose={() => setIsFullscreenDisplay(false)}
      />
    );
  }

  if (isSettingsOpen && user?.role === "owner") {
    return (
      <SettingsPanel
        businessName="Amehlo Queue"
        setBusinessName={() => {}}
        branchName={currentBranch?.name || ""}
        setBranchName={() => {}}
        contactPhone={contactPhone}
        setContactPhone={setContactPhone}
        onClose={() => setIsSettingsOpen(false)}
      />
    );
  }

  if (isAnalyticsOpen && user?.role === "owner") {
    return (
      <AnalyticsPanel
        logs={rawAnalyticsLogs}
        averageWaitTime={averageWaitTime}
        bestWaitTime={bestWaitTime}
        worstWaitTime={worstWaitTime}
        totalCompletedCount={totalCompletedCount}
        businessName={currentBranch?.name || "Terminal Station"}
        onClose={() => setIsAnalyticsOpen(false)}
      />
    );
  }

  return (
    <div className="max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6 animate-in fade-in duration-200">
      <DashboardHeader
        userRole={user?.role}
        branches={branches}
        activeBranchId={activeBranchId}
        currentBranch={currentBranch}
        onSelectBranch={setActiveBranchId}
        onOpenQr={() => setIsQrOpen(true)}
        onOpenTv={() => setIsFullscreenDisplay(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onNavigateBranches={() => navigate("/branches")}
        onSignOut={handleTerminalSignOut}
      />

      <StudentSearchHUD />

      <QueueMetricsBar
        queueLength={queue.length}
        averageWaitTime={averageWaitTime}
        totalCompletedCount={totalCompletedCount}
      />

      <QueueWorkspace
        queue={queue}
        services={services}
        userClerkId={user?.clerkId}
        userRole={user?.role} // ➔ Add this prop!
        isLoadingQueue={isLoadingQueue}
        onUpdateStatus={updateQueueStatusReal}
        onPromptAction={(ticket) => setPromptTicket(ticket)}
      />

      <StationQrModal
        isOpen={isQrOpen}
        branch={currentBranch}
        activeBranchId={activeBranchId}
        onClose={() => setIsQrOpen(false)}
      />

      <ConfirmTurnModal
        ticket={promptTicket}
        onClose={() => setPromptTicket(null)}
        onConfirm={handleConfirmTurn}
      />
    </div>
  );
};
