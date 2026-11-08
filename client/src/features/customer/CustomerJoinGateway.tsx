import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { customerService } from "./services/customerService";
import { io } from "socket.io-client";
import {
  QrCode,
  UserCheck,
  Timer,
  Loader2,
  CheckCircle2,
  Briefcase,
  MapPin,
} from "lucide-react";
import axios from "axios";

export const CustomerJoinGateway: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Match the exact branch key emitted from your dashboard QR Code layout
  const branchId = searchParams.get("branchId") || searchParams.get("branch");

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");

  // System States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isVerifyingArrival, setIsVerifyingArrival] = useState(false); // 🎯 Arrival loading lock

  // Custom Services Cache State
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  // Auto Memory Hydration on Page Refresh
  const [myTicket, setMyTicket] = useState<any | null>(() => {
    const saved = localStorage.getItem("amehlo_active_ticket");
    return saved ? JSON.parse(saved) : null;
  });
  const [livePosition, setLivePosition] = useState<number | null>(() => {
    const saved = localStorage.getItem("amehlo_active_ticket");
    return saved ? JSON.parse(saved).position : null;
  });

  const SOCKET_URL =
    import.meta.env.VITE_APP_ENV === "development"
      ? "http://localhost:5000"
      : "https://amehlo-app.onrender.com";
  // 📡 🎯 DETECT QR SCAN ARRIVAL INTERCEPTOR ON MOUNT
  useEffect(() => {
    if (!branchId || !myTicket) return;

    // Check if the saved local ticket matches this scanned branch and is still marked remote
    if (
      myTicket.branchId === branchId &&
      myTicket.presenceStatus === "Remote"
    ) {
      setIsVerifyingArrival(true);

      customerService
        .confirmPhysicalArrival(myTicket._id)
        .then((data) => {
          // Update local storage to reflect physical arrival validation safely
          const arrivedTicket = { ...myTicket, presenceStatus: "Arrived" };
          localStorage.setItem(
            "amehlo_active_ticket",
            JSON.stringify(arrivedTicket),
          );
          setMyTicket(arrivedTicket);
        })
        .catch((err) => {
          console.error("Presence check-in auto-trigger failed:", err);
        })
        .finally(() => {
          setIsVerifyingArrival(false);
        });
    }
  }, [branchId, myTicket?._id]);

  // 📡 FETCH ACTIVE LANES FOR THIS SPECIFIC BRANCH INSTANTLY ON MOUNT
  useEffect(() => {
    if (!branchId) return;

    const fetchLanes = async () => {
      setIsLoadingServices(true);
      try {
        const baseUrl = SOCKET_URL;
        const res = await axios.get(
          `${baseUrl}/api/services/branch/${branchId}`,
        );
        setAvailableServices(res.data.services || []);
      } catch (err) {
        console.error("Failed loading mobile lane routes:", err);
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchLanes();
  }, [branchId]);
  // 📡 WEBSOCKET CONNECTION LIFECYCLE MANAGEMENT LOOP
  useEffect(() => {
    if (!branchId || !myTicket || myTicket.status === "Completed") return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      upgrade: false,
    });

    socket.on("connect", () => {
      socket.emit("join_branch_room", branchId);
    });

    socket.on("queue_updated", (updatedQueue: any) => {
      const queueArray = Array.isArray(updatedQueue)
        ? updatedQueue
        : updatedQueue?.queue || [];

      const freshRecord = queueArray.find(
        (t: any) =>
          (t._id &&
            myTicket._id &&
            t._id.toString() === myTicket._id.toString()) ||
          t.ticketId === myTicket.ticketId,
      );

      if (freshRecord) {
        setLivePosition(freshRecord.position);
        // Retain the local presenceStatus field across server state sync pulses
        localStorage.setItem(
          "amehlo_active_ticket",
          JSON.stringify({
            ...myTicket,
            position: freshRecord.position,
            presenceStatus:
              freshRecord.presenceStatus || myTicket.presenceStatus,
          }),
        );
        setMyTicket((prev: any) =>
          prev
            ? {
                ...prev,
                position: freshRecord.position,
                presenceStatus:
                  freshRecord.presenceStatus || prev.presenceStatus,
              }
            : null,
        );
      } else {
        localStorage.removeItem("amehlo_active_ticket");
        setLivePosition(null);
        setMyTicket((prev: any) =>
          prev ? { ...prev, status: "Completed" } : null,
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [branchId, myTicket?._id, myTicket?.status]);

  // ➔ HANDLER: SUBMIT FORM AND REGISTER TOKEN IN PIPELINE
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) {
      setError("Invalid or missing operational branch location token.");
      return;
    }
    if (!selectedServiceId) {
      setError("Please select a service department before proceeding.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Defaults to true when booking through standard mobile web interface (Remote check-in)
      const ticket = await customerService.joinQueueFromMobile(
        branchId,
        name.trim(),
        phone.trim(),
        selectedServiceId,
        email.trim() || undefined,
        true,
      );

      localStorage.setItem("amehlo_active_ticket", JSON.stringify(ticket));
      setMyTicket(ticket);
      setLivePosition(ticket.position);
    } catch (err: any) {
      console.error("Mobile terminal check-in fault:", err);
      setError(
        err.response?.data?.error ||
          "Failed to secure a queue sequence number.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!myTicket?._id) return;
    const confirmLeave = window.confirm(
      "Are you sure you want to leave the queue? You will lose your spot entirely.",
    );
    if (!confirmLeave) return;

    setIsLeaving(true);
    try {
      await customerService.leaveQueueFromMobile(myTicket._id);
      localStorage.removeItem("amehlo_active_ticket");
      setMyTicket(null);
      setLivePosition(null);
      setName("");
      setPhone("");
      setEmail("");
      setSelectedServiceId("");
    } catch (err) {
      console.error("Failed to cleanly exit tracking pipeline:", err);
      alert("Could not remove you from the live line. Please try again.");
    } finally {
      setIsLeaving(false);
    }
  };

  // 📱 INTERCEPTOR STATE: AUTOMATIC QR ARRIVAL SYNC PULSE
  if (isVerifyingArrival) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center space-y-3 font-sans">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">
          Welcoming Your Arrival...
        </h2>
        <p className="text-xs text-zinc-400">
          Verifying location keys. Activating your priority slot at the counter
          terminal...
        </p>
      </div>
    );
  }

  // 📱 INVALID STATE BARRIER INTERCEPTOR
  if (!branchId) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 text-center max-w-sm w-full font-sans shadow-sm">
          <QrCode className="h-8 w-8 text-red-500 mx-auto mb-2 animate-pulse" />
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
            Invalid Check-In Code
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Please re-scan the official physical wall counter QR code sign to
            secure your ticket sequence entry.
          </p>
        </div>
      </div>
    );
  }

  // 📱 SCREEN STATE B: CUSTOMER IN LINE (REAL-TIME PROGRESS MONITOR)
  if (myTicket) {
    const isRemote = myTicket.presenceStatus === "Remote";

    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-sans antialiased">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-xl max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="space-y-1">
            <div className="h-12 w-12 bg-orange-50 border border-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-sm">
              {myTicket.status === "Completed" ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              ) : (
                <Timer className="h-6 w-6 animate-pulse" />
              )}
            </div>
            <h2 className="text-lg font-black tracking-tight text-zinc-900">
              {myTicket.status === "Completed"
                ? "You've Been Served!"
                : "Secure Ticket Pipeline Active"}
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              Ticket Holder: {myTicket.name}
            </p>
          </div>

          {/* 🎯 SUB-BADGE CONTEXT INDICATING PRESENCE MATRIX LAYER */}
          <div className="flex justify-center select-none">
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wide border ${
                isRemote
                  ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {isRemote ? (
                <>
                  <MapPin className="h-3 w-3 text-amber-600" /> In Transit
                  (Remote Checking)
                </>
              ) : (
                <>
                  <UserCheck className="h-3 w-3 text-emerald-600" /> Physical
                  Presence (Arrived)
                </>
              )}
            </span>
          </div>

          {myTicket.status === "Completed" ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-emerald-800 text-xs font-semibold">
              Your turn is complete. Thank you for using Amehlo automated queue
              infrastructure terminals!
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Your Token
                </span>
                <span className="text-2xl font-black text-zinc-900 tracking-tight mt-1 block">
                  #{myTicket.ticketId}
                </span>
              </div>
              <div className="bg-orange-50/40 border border-orange-100 rounded-2xl p-4 text-center transition-all duration-300">
                <span className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">
                  Line Position
                </span>
                <span className="text-2xl font-black text-orange-600 tracking-tight mt-1 block">
                  {livePosition !== null ? `Pos #${livePosition}` : "Up Next"}
                </span>
              </div>
            </div>
          )}

          {isRemote && myTicket.status !== "Completed" && (
            <div className="bg-zinc-50 border border-zinc-100/80 rounded-2xl p-3.5 text-left text-zinc-500 text-xs space-y-1">
              <p className="font-bold text-zinc-700 text-center text-[11px] uppercase tracking-wide text-orange-600">
                ⚠️ Store Queue Rule
              </p>
              <p className="text-center text-[11px]">
                Your number is held, but the counter will prioritize active
                patrons if you aren't inside the store when called.{" "}
                <strong>
                  Scan the wall poster QR when you walk in to activate!
                </strong>
              </p>
            </div>
          )}

          <p className="text-[11px] text-zinc-400 font-medium leading-relaxed max-w-xs mx-auto select-none">
            {myTicket.status !== "Completed" &&
              "Keep this window open. Your terminal tracking coordinates sync automatically via event-driven channels."}
          </p>

          {myTicket.status !== "Completed" && (
            <div className="pt-2">
              <button
                type="button"
                disabled={isLeaving}
                onClick={handleLeaveQueue}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold h-10 text-xs tracking-tight transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isLeaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Leave Queue & Cancel Spot"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  // 📱 SCREEN STATE A: INTAKE REGISTRATION & SERVICE MATCH SELECTION
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-sans antialiased">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-6 shadow-xl space-y-6 animate-in fade-in duration-200">
        <div className="text-center space-y-1 select-none">
          <div className="h-10 w-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm font-black text-lg">
            A
          </div>
          <h2 className="text-lg font-black tracking-tight text-zinc-900">
            Secure Live Entry Token
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
            Register details below to secure a position in the active queue
            terminal pipeline stream.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl p-3 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-5">
          {/* MODERN INTERACTIVE SERVICE MATCH SELECTION MATRIX */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> Select Required Service Line
            </label>

            {isLoadingServices ? (
              <div className="flex items-center justify-center py-6 text-zinc-400 text-xs gap-2 bg-zinc-50 border border-zinc-100 rounded-2xl">
                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />{" "}
                Mapping active departments...
              </div>
            ) : availableServices.length === 0 ? (
              <div className="text-center py-4 bg-amber-50 border border-amber-100 text-amber-800 text-xs font-medium rounded-xl">
                This branch has not provisioned custom service lanes yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {availableServices.map((srv) => {
                  const isSelected = selectedServiceId === srv._id;
                  return (
                    <button
                      key={srv._id}
                      type="button"
                      onClick={() => setSelectedServiceId(srv._id)}
                      className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                        isSelected
                          ? "bg-orange-50/50 border-orange-500 text-orange-700 shadow-sm shadow-orange-50"
                          : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100/70"
                      }`}
                    >
                      <span className="truncate">{srv.name}</span>
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all shrink-0 ${
                          isSelected
                            ? "border-orange-500 bg-orange-500 text-white animate-in zoom-in-50"
                            : "border-zinc-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-1 border-t border-dashed border-zinc-100">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                placeholder="e.g. Sipho Nkosi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Contact Phone Line
              </label>
              <input
                type="tel"
                required
                disabled={isSubmitting}
                placeholder="e.g. 082 555 1234"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Email Address (Optional)
              </label>
              <input
                type="email"
                disabled={isSubmitting}
                placeholder="e.g. sipho@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !name.trim() ||
              !phone.trim() ||
              !selectedServiceId
            }
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold h-11 py-2.5 shadow-sm active:scale-95 transition-all text-xs cursor-pointer disabled:opacity-40"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserCheck className="h-4 w-4" />
            )}
            <span>Secure Entry Ticket</span>
          </button>
        </form>
      </div>
    </div>
  );
};
