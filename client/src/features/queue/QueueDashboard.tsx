import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { MetricCards } from "./components/MetricCards";
import { StudentSearchHUD } from "./components/StudentSearchHUD";
import { QueueStream } from "./components/QueueStream";
import { TvDisplay } from "./components/TvDisplay";
import { SettingsPanel } from "./components/SettingsPanel";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import {
  Monitor,
  Settings,
  BarChart3,
  MapPin,
  MoreVertical,
} from "lucide-react";
import type { QueueItem, CompletionLog } from "./types/queue";

export const QueueDashboard: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [completedLogs, setCompletedLogs] = useState<CompletionLog[]>([]);
  const [ticketCounter, setTicketCounter] = useState<number>(64);

  // VIEW STATE MATRIX
  const [isFullscreenDisplay, setIsFullscreenDisplay] =
    useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const [businessName, setBusinessName] = useState<string>("AmehloQueue");
  const [branchName, setBranchName] = useState<string>("Empangeni Central");
  const [contactPhone, setContactPhone] = useState<string>("035 111 2222");

  const resequenceQueue = (currentList: QueueItem[]): QueueItem[] => {
    return currentList.map((item, idx) => {
      let status: "Active" | "Up Next" | "Waiting" = "Waiting";
      if (idx === 0) status = "Active";
      else if (idx === 1) status = "Up Next";

      return {
        ...item,
        position: idx + 1,
        status,
        estWait:
          idx === 0
            ? "At Front"
            : idx === 1
              ? "Next up"
              : `${(idx - 1) * 20} mins est.`,
      };
    });
  };

  const handleInsertToQueue = (name: string, phone: string, email?: string) => {
    const nextTicket = ticketCounter + 1;
    setTicketCounter(nextTicket);

    const newSession: QueueItem = {
      id: String(nextTicket),
      profile: { id: `usr_${Date.now()}`, name, phone, email },
      position: queue.length + 1,
      status: "Waiting",
      timestampAdded: Date.now(),
    };

    setQueue(resequenceQueue([...queue, newSession]));
  };

  const handleSkipStudent = (id: string) => {
    const targetIdx = queue.findIndex((item) => item.id === id);
    if (targetIdx === -1) return;

    const updatedList = [...queue];
    const [skipped] = updatedList.splice(targetIdx, 1);
    updatedList.push(skipped);

    setQueue(resequenceQueue(updatedList));
  };

  const handleRemoveFromQueue = (id: string) => {
    const targetItem = queue.find((item) => item.id === id);
    if (targetItem) {
      setCompletedLogs((prev) => [
        {
          id: targetItem.id,
          addedAt: targetItem.timestampAdded,
          completedAt: Date.now(),
        },
        ...prev,
      ]);
    }
    setQueue(resequenceQueue(queue.filter((item) => item.id !== id)));
  };

  if (isFullscreenDisplay) {
    return (
      <TvDisplay
        queue={queue}
        businessName={businessName}
        branchName={branchName}
        onClose={() => setIsFullscreenDisplay(false)}
      />
    );
  }

  if (isSettingsOpen) {
    return (
      <SettingsPanel
        businessName={businessName}
        setBusinessName={setBusinessName}
        branchName={branchName}
        setBranchName={setBranchName}
        contactPhone={contactPhone}
        setContactPhone={setContactPhone}
        onClose={() => setIsSettingsOpen(false)}
      />
    );
  }

  if (isAnalyticsOpen) {
    return (
      <AnalyticsPanel
        logs={completedLogs}
        businessName={businessName}
        onClose={() => setIsAnalyticsOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased selection:bg-orange-600/10">
      <Navbar customBrandName={businessName} />

      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-6 overflow-x-hidden">
        {/* ELITE COMPACT HEADER BLOCK */}
        <div className="flex justify-between items-start border-b border-zinc-200 pb-4 relative">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Live Operations
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-zinc-400" /> Station
                Terminal:{" "}
                <span className="font-semibold text-zinc-700">
                  {branchName}
                </span>
              </span>
              <span className="hidden sm:inline text-zinc-300">•</span>
              <span className="italic text-zinc-400">
                Real-time status tracking and sequential priority engine.
              </span>
            </p>
          </div>

          {/* MINIMAL SHADCN DROP-MENU TRIGGER */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)}
              className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 shadow-sm transition-all active:scale-95 cursor-pointer"
              aria-label="Management options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Terminal Control
                </div>
                <button
                  onMouseDown={() => setIsAnalyticsOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                  View Analytics
                </button>
                <button
                  onMouseDown={() => setIsFullscreenDisplay(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <Monitor className="h-4 w-4 text-zinc-400" />
                  Launch TV Display
                </button>
                <div className="h-px bg-zinc-100 my-1" />
                <button
                  onMouseDown={() => setIsSettingsOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <Settings className="h-4 w-4 text-zinc-400" />
                  Settings
                </button>
              </div>
            )}
          </div>
        </div>

        {/* INPUT COMPONENT WITH HIDDEN HEADER */}
        <StudentSearchHUD onInsertToQueue={handleInsertToQueue} />
        <MetricCards queue={queue} logs={completedLogs} />
        <QueueStream
          queue={queue}
          onSkip={handleSkipStudent}
          onComplete={handleRemoveFromQueue}
        />
      </main>
    </div>
  );
};
