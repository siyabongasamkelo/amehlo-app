import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
// import { MetricCards } from "./components/MetricCards";
import { StudentSearchHUD } from "./components/StudentSearchHUD";
import { TvDisplay } from "./components/TvDisplay";
import { SettingsPanel } from "./components/SettingsPanel";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import {
  Monitor,
  Settings,
  BarChart3,
  MapPin,
  ChevronDown,
  MoreVertical,
  UserX,
  Layers,
  Clock,
  CheckCircle2,
  Briefcase,
  QrCode,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

export const QueueDashboard: React.FC = () => {
  const {
    user,
    branches,
    activeBranchId,
    queue,
    completedLogs,
    switchBranchSimulated,
    insertQueueSimulated,
    skipQueueSimulated,
    completeQueueSimulated,
    markAbsentSimulated,
  } = useApp();

  // INTERNAL VIEW AND DROPDOWN STATES
  const [isFullscreenDisplay, setIsFullscreenDisplay] =
    useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState<boolean>(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(
    null,
  );
  const [isQrOpen, setIsQrOpen] = useState<boolean>(false);

  const navigate = useNavigate();

  // LOCATE THE ACTIVE BRANCH NODE PROFILE
  const currentBranch =
    branches.find((b) => b.id === activeBranchId) || branches[0];
  const [contactPhone, setContactPhone] = useState<string>(
    currentBranch?.phone || "035 111 2222",
  );

  // CALCULATE ACTIVE QUEUE METRICS ON THE FLY
  const calculateAverageWaitTime = (): string => {
    if (completedLogs.length === 0) return "15 mins";
    const totalDurationMs = completedLogs.reduce(
      (acc, current) => acc + (current.completedAt - current.addedAt),
      0,
    );
    const averageMinutes = Math.round(totalDurationMs / 1000 / 60);
    return averageMinutes > 0 ? `${averageMinutes} mins` : "1 min";
  };

  // SCREEN VIEWS CONDITION CONTROL SYSTEM OVERRIDES
  if (isFullscreenDisplay) {
    return (
      <TvDisplay
        queue={queue}
        businessName="Amehlo Queue"
        branchName={currentBranch.name}
        onClose={() => setIsFullscreenDisplay(false)}
      />
    );
  }

  if (isSettingsOpen && user?.role === "owner") {
    return (
      <SettingsPanel
        businessName="Amehlo Queue"
        setBusinessName={() => {}}
        branchName={currentBranch.name}
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
        logs={completedLogs}
        businessName={currentBranch.name}
        onClose={() => setIsAnalyticsOpen(false)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 🚀 EVOLVED COHESIVE HEADER SYSTEM */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 pb-5">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Live Operations
          </h1>

          {/* BRANCH CONTEXT SWITCHER ROW */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <div className="relative">
              <button
                disabled={user?.role === "worker"} // 🔒 Workers are locked to their assigned terminal
                onClick={() => setIsBranchMenuOpen(!isBranchMenuOpen)}
                className={`inline-flex items-center gap-1.5 font-bold text-zinc-800 transition-colors ${
                  user?.role !== "worker"
                    ? "hover:text-orange-600 cursor-pointer"
                    : "opacity-90"
                }`}
              >
                <MapPin className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                <span>
                  Terminal Cluster:{" "}
                  <span className="underline decoration-wavy decoration-orange-400">
                    {currentBranch.name}
                  </span>
                </span>
                {user?.role === "owner" && (
                  <ChevronDown className="h-3 w-3 text-zinc-400" />
                )}
              </button>

              {/* BRANCH SELECTION FLOATING ELEMENT PANEL */}
              {isBranchMenuOpen && user?.role === "owner" && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                    Switch Active Stations
                  </div>
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        switchBranchSimulated(b.id);
                        setIsBranchMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer block ${
                        b.id === activeBranchId
                          ? "bg-orange-50 text-orange-600 font-bold"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="hidden sm:inline text-zinc-300">•</span>
            <span className="italic text-zinc-400">
              Real-time status tracking and sequential priority engine.
            </span>
          </div>
        </div>

        {/* CONTROLS HOUSING UNIT - RESTRICTED ACCORDING TO IDENTITY ROLES */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {user?.role === "owner" && (
            <button
              onClick={() => setIsAnalyticsOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold px-4 py-2.5 shadow-sm transition-all text-xs cursor-pointer"
            >
              <BarChart3 className="h-4 w-4 text-orange-600" />
              View Analytics
            </button>
          )}

          {/* ⚡ NEW: EVERYONE (OWNERS & WORKERS) GETS QUICK QR ACCESS */}
          <button
            onClick={() => setIsQrOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100/70 text-orange-700 font-bold px-4 py-2.5 shadow-sm transition-all text-xs cursor-pointer active:scale-95"
          >
            <QrCode className="h-4 w-4" />
            Show Station QR
          </button>

          <button
            onClick={() => setIsFullscreenDisplay(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold px-4 py-2.5 shadow-sm transition-all text-xs cursor-pointer"
          >
            <Monitor className="h-4 w-4 text-zinc-400" />
            Launch TV Display
          </button>

          {user?.role === "owner" && (
            <button
              onClick={() => navigate("/branches")}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold px-4 py-2.5 shadow-sm transition-all text-xs cursor-pointer"
            >
              <Settings className="h-4 w-4 text-zinc-400" />
              Manage Branches
            </button>
          )}
        </div>
      </div>
      {/* SEARCH HUD INPUT UNIT - POPULATES DATA STRAIGHT TO LIVE PIPELINE BRAIN */}
      <StudentSearchHUD onInsertToQueue={insertQueueSimulated} />

      {/* METRIC INTELLIGENCE BAR GRIDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Active Queue Capacity
            </p>
            <p className="text-2xl font-black mt-1 text-zinc-900">
              {queue.length} Holding
            </p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl text-zinc-500 border border-zinc-100">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Avg Processing Time
            </p>
            <p className="text-2xl font-black mt-1 text-zinc-900">
              {calculateAverageWaitTime()}
            </p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-xl text-zinc-500 border border-zinc-100">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Total Output Served
            </p>
            <p className="text-2xl font-black mt-1 text-emerald-600">
              {completedLogs.length} Completed
            </p>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* THE LIVE QUEUE WORKSPACE ROW GRID WITH ACTIONS DROPDOWNS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1 select-none">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            Pipeline Activity Stream
          </h2>
          <span className="text-xs text-zinc-400 font-medium font-mono uppercase">
            Priority Engine Shift ➔
          </span>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
          {queue.length === 0 ? (
            <div className="w-full bg-white border border-zinc-200 border-dashed rounded-2xl p-12 text-center text-zinc-400 text-sm font-medium">
              The operation lane is currently empty. Input an entry token above
              to ignite the tracking engine.
            </div>
          ) : (
            queue.map((item) => {
              const isActive = item.status === "Active";
              return (
                <div
                  key={item.id}
                  className={`min-w-[300px] md:min-w-[330px] snap-start rounded-2xl border p-5 flex flex-col justify-between transition-all relative shrink-0 shadow-sm ${
                    isActive
                      ? "bg-white border-emerald-500 shadow-md shadow-emerald-50"
                      : "bg-white border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                          TICKET ID
                        </span>
                        <h3 className="font-black text-xl text-zinc-900 tracking-tight leading-none mt-0.5">
                          #{item.id}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          Pos #{item.position}
                        </span>

                        {/* ELITE POP-ACTION GHOST CLIENT TRIGGER ACCORDION */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveActionMenuId(
                                activeActionMenuId === item.id ? null : item.id,
                              )
                            }
                            className="h-7 w-7 inline-flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {activeActionMenuId === item.id && (
                            <div className="absolute right-0 mt-1 w-44 rounded-xl border border-zinc-200 bg-white p-1 shadow-lg z-40 animate-in fade-in slide-in-from-top-1 duration-150">
                              <button
                                onClick={() => {
                                  markAbsentSimulated(item.id);
                                  setActiveActionMenuId(null);
                                }}
                                className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <UserX className="h-3.5 w-3.5" /> Flag Absent
                                (Ghost)
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* DYNAMIC METADATA GRID DISPLAY CARD WITH SERVICES INTEGRATION POOL */}
                    <div className="bg-zinc-50 rounded-xl p-3.5 border border-zinc-100 text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Name:</span>
                        <span className="font-bold text-zinc-700">
                          {item.profile.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Contact Line:</span>
                        <span className="font-semibold text-zinc-600 font-mono">
                          {item.profile.phone}
                        </span>
                      </div>

                      {/* MULTI-SERVICE SPECIFIC PRIORITY TARGET VALUE BADGE */}
                      <div className="flex justify-between items-center pt-1 border-t border-dashed border-zinc-200">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Briefcase className="h-3 w-3" /> Assigned Task:
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 font-bold uppercase tracking-wider text-[9px]">
                          Standard Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE SYSTEM ACTION BUTTON COCKPIT TRAILING STRAPS */}
                  <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => skipQueueSimulated(item.id)}
                      className="text-[11px] font-bold text-zinc-500 hover:text-zinc-700 flex items-center gap-1 bg-zinc-50 hover:bg-zinc-100 px-3 py-2 rounded-xl border border-zinc-200 transition-all cursor-pointer select-none"
                    >
                      Shift to Back
                    </button>
                    <button
                      onClick={() => completeQueueSimulated(item.id)}
                      className="text-[11px] font-bold text-emerald-600 hover:text-white flex items-center gap-1 bg-emerald-50 hover:bg-emerald-600 px-4 py-2 rounded-xl border border-emerald-200 transition-all cursor-pointer w-1/2 justify-center shadow-sm select-none"
                    >
                      Complete Turn
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* 🪟 FLOATING STATION QR GATEWAY OVERLAY MODAL */}
      {isQrOpen && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-5 animate-in zoom-in-95 duration-150 relative">
            {/* HEADER SPECS */}
            <div className="text-center space-y-1 select-none">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <QrCode className="h-4 w-4 text-orange-600" /> Counter Check-In
                Sign
              </h3>
              <p className="text-[11px] text-zinc-400 font-medium">
                Let the customer scan this camera panel to secure their live
                tracking ticket.
              </p>
            </div>

            {/* DYNAMIC QR RENDERING BOX UNIT */}
            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl flex flex-col items-center justify-center text-center">
              {/* WE INJECT OUR CLIENT-SIDE VECTOR ENGAGEMENT ENGINE HERE */}
              <div className="p-3 bg-white border border-zinc-200 rounded-xl shadow-sm">
                <QRCodeSVG
                  value={`${window.location.origin}/customer/join?branch=${activeBranchId}`}
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="mt-3 text-[11px] font-black text-zinc-800 tracking-wide font-mono uppercase">
                {currentBranch.name}
              </div>
              <div className="text-[9px] font-bold font-mono tracking-wider text-zinc-400">
                STATION LINK KEY: {currentBranch.inviteCode}
              </div>
            </div>

            {/* ESCAPE AND DISMISS UNIT VALVE ACTION */}
            <button
              onClick={() => setIsQrOpen(false)}
              className="w-full inline-flex items-center justify-center h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              Dismiss Check-In Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
