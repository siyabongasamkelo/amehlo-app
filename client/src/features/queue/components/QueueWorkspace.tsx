import React, { useState } from "react";
import { Sparkles, Briefcase, Loader2 } from "lucide-react";
import { QueueTicketCard } from "./QueueTicketCard";

interface QueueWorkspaceProps {
  queue: any[];
  services: any[];
  userClerkId?: string;
  isLoadingQueue: boolean;
  onUpdateStatus: (ticketId: string, status: string) => void;
  onPromptAction: (ticket: any) => void;
}

export const QueueWorkspace: React.FC<QueueWorkspaceProps> = ({
  queue,
  services,
  userClerkId,
  isLoadingQueue,
  onUpdateStatus,
  onPromptAction,
}) => {
  const [activeTab, setActiveTab] = useState<"personal" | "shared">("personal");

  const personalTickets = queue.filter(
    (t) => t.preferredWorkerId === userClerkId,
  );
  const sharedTickets = queue.filter((t) => !t.preferredWorkerId);
  const displayedTickets =
    activeTab === "personal" ? personalTickets : sharedTickets;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-100 pb-2">
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "personal"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Sparkles
              className={`h-3.5 w-3.5 ${
                activeTab === "personal" ? "text-orange-500" : "text-zinc-400"
              }`}
            />
            <span>My Personal Lane</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-md font-mono bg-zinc-200 text-zinc-700 font-bold">
              {personalTickets.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("shared")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "shared"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5 text-zinc-400" />
            <span>General Shared Pool</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-md font-mono bg-zinc-200 text-zinc-700 font-bold">
              {sharedTickets.length}
            </span>
          </button>
        </div>

        <span className="text-xs text-zinc-400 font-medium font-mono uppercase select-none hidden sm:inline">
          Priority Routing Filter ➔
        </span>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
        {isLoadingQueue ? (
          <div className="w-full bg-white border border-zinc-200 border-dashed rounded-2xl p-12 text-center text-zinc-400 text-sm font-medium flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
            Syncing network timeline pipeline...
          </div>
        ) : displayedTickets.length === 0 ? (
          <div className="w-full bg-white border border-zinc-200 border-dashed rounded-2xl p-12 text-center text-zinc-400 text-sm font-medium">
            {activeTab === "personal"
              ? "No clients have signed up to see you specifically right now. Check the shared pool!"
              : "The general unassigned operation pool is currently empty."}
          </div>
        ) : (
          displayedTickets.map((item) => {
            const categoryMatch = services.find(
              (s) => s._id === item.serviceId,
            );
            const serviceBadgeLabel = categoryMatch
              ? categoryMatch.name
              : "Standard Priority";

            return (
              <QueueTicketCard
                key={item._id}
                item={item}
                serviceBadgeLabel={serviceBadgeLabel}
                onUpdateStatus={onUpdateStatus}
                onPromptAction={onPromptAction}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
