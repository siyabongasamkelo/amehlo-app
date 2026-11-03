import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { MetricCards } from "./components/MetricCards";
import { StudentSearchHUD } from "./components/StudentSearchHUD";
import { QueueStream } from "./components/QueueStream";
import { TvDisplay } from "./components/TvDisplay";
import { SettingsPanel } from "./components/SettingsPanel";
import { Monitor, Settings, MapPin } from "lucide-react";
import type { QueueItem, CompletionLog } from "./types/queue";

export const QueueDashboard: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [completedLogs, setCompletedLogs] = useState<CompletionLog[]>([]);
  const [ticketCounter, setTicketCounter] = useState<number>(64);

  const [isFullscreenDisplay, setIsFullscreenDisplay] =
    useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

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
        onClose={() => setIsSettingsOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased selection:bg-orange-600/10">
      <Navbar customBrandName={businessName} />

      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-6 overflow-x-hidden">
        {/* 🚀 ELIMINATED THE OFF-STYLE BANNER CONTAINER ENTITY */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Live Operations
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-zinc-400" />
              Terminal Station:{" "}
              <span className="font-semibold text-zinc-700">{branchName}</span>
            </p>
          </div>

          {/* SHADCN MINIMAL ACTION GROUP FLOATING RIGHT */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreenDisplay(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold px-4 py-2.5 shadow-sm active:scale-98 transition-all text-xs cursor-pointer"
            >
              <Monitor className="h-4 w-4 text-orange-600" />
              Launch TV Display
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold px-4 py-2.5 shadow-sm active:scale-98 transition-all text-xs cursor-pointer"
            >
              <Settings className="h-4 w-4 text-zinc-400" />
              Settings
            </button>
          </div>
        </div>

        {/* 🛠️ WE ALSO REMOVE THE INNER DUPED HEADERS INSIDE StudentSearchHUD TO PERFECT THE SPACING */}
        <StudentSearchHUD
          onInsertToQueue={handleInsertToQueue}
          hideHeader={true}
        />
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
