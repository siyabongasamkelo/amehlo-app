import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { customerService } from "./services/customerService";
import { io } from "socket.io-client";
import { QrCode, UserCheck, Timer, Loader2, CheckCircle2 } from "lucide-react";

export const CustomerJoinGateway: React.FC = () => {
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get("branch");

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isLeaving, setIsLeaving] = useState(false);

  // System States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🎯 FIX 1: AUTO-MEMORY HYDRATION ON PAGE REFRESH
  const [myTicket, setMyTicket] = useState<any | null>(() => {
    const saved = localStorage.getItem("amehlo_active_ticket");
    return saved ? JSON.parse(saved) : null;
  });
  const [livePosition, setLivePosition] = useState<number | null>(() => {
    const saved = localStorage.getItem("amehlo_active_ticket");
    return saved ? JSON.parse(saved).position : null;
  });

  // 🎯 FIX 2: ROUTING ENVIRONMENT MANAGEMENT MATCHING APPLICATION CONTEXT
  const SOCKET_URL =
    import.meta.env.VITE_APP_ENV === "development"
      ? "http://localhost:5000"
      : "https://amehlo-app.onrender.com/api/queue";

  // Connect the customer's phone to the active WebSocket room channel safely
  useEffect(() => {
    if (!branchId || !myTicket || myTicket.status === "Completed") return;

    // Connect to live production or development string cleanly
    const socket = io(SOCKET_URL, { withCredentials: true });

    socket.on("connect", () => {
      socket.emit("join_branch_room", branchId);
    });

    // LISTEN REAL-TIME: Process raw data stream safely
    socket.on("queue_updated", (updatedQueue: any) => {
      console.log("Ameblo network shift received stream:", updatedQueue);

      // Ensure payload parsing handles array structural variations gracefully
      const queueArray = Array.isArray(updatedQueue)
        ? updatedQueue
        : updatedQueue?.queue || [];

      // CRITICAL ROBUST MATCH: Fallback to the rolling ticketId string if MongoDB _id skips a match
      const freshRecord = queueArray.find(
        (t: any) =>
          (t._id &&
            myTicket._id &&
            t._id.toString() === myTicket._id.toString()) ||
          t.ticketId === myTicket.ticketId,
      );

      if (freshRecord) {
        console.log(
          `Match found! Updating position tracking coordinate to: Pos #${freshRecord.position}`,
        );
        setLivePosition(freshRecord.position);

        // Update the phone cache container with the updated sequence payload
        // This makes sure if they refresh right now, they boot up with the NEW position!
        const updatedTicketMemory = {
          ...myTicket,
          position: freshRecord.position,
        };
        localStorage.setItem(
          "amehlo_active_ticket",
          JSON.stringify(updatedTicketMemory),
        );
      } else {
        // If we've parsed a clean array and this ticket code is missing entirely, they've been served!
        console.log(
          "Ticket missing from active array stream. Archiving session.",
        );
        setLivePosition(null);
        setMyTicket((prev: any) =>
          prev ? { ...prev, status: "Completed" } : null,
        );
        localStorage.removeItem("amehlo_active_ticket");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [branchId, myTicket?._id, myTicket?.status]);

  // 🎯 AUTOMATED CELLULAR DESTRUCTION: Clear cache safely on initial page load if requested
  useEffect(() => {
    const forceReset = searchParams.get("reset") === "true";

    if (forceReset) {
      console.log(
        "Secret developer flush handshake triggered. Clearing phone cache...",
      );
      localStorage.removeItem("amehlo_active_ticket");

      // Clean up the URL parameters so it doesn't loop forever
      searchParams.delete("reset");
      window.location.search = searchParams.toString();
    }
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) {
      setError("Invalid or missing operational branch location token.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const ticket = await customerService.joinQueueFromMobile(
        branchId,
        name.trim(),
        phone.trim(),
        email.trim() || undefined,
      );

      // 🎯 CACHE ON FRESH INITIAL REGISTRATION
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
      // 1. Tell backend to drop the ticket and re-sequence the branch line
      await customerService.leaveQueueFromMobile(myTicket._id);

      // 2. Clear out phone memory amnesia tracking safely
      localStorage.removeItem("amehlo_active_ticket");

      // 3. Reset all frontend variables to drop back to Screen State A (Registration)
      setMyTicket(null);
      setLivePosition(null);
      setName("");
      setPhone("");
      setEmail("");
    } catch (err) {
      console.error("Failed to cleanly exit tracking pipeline:", err);
      alert("Could not remove you from the live line. Please try again.");
    } finally {
      setIsLeaving(false);
    }
  };

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

  // 📱 SCREEN STATE B: CUSTOMER SUCCESSFULLY IN LINE (LIVESTREAM VIEW)
  if (myTicket) {
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
                <span className="text-2xl font-black text-orange-600 tracking-tight mt-1 block animate-bounce">
                  {livePosition !== null ? `Pos #${livePosition}` : "Up Next"}
                </span>
              </div>
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
          {/* 🤫 SECRET DEVELOPER TESTING RESET SWITCH */}
        </div>
      </div>
    );
  }

  // 📱 SCREEN STATE A: FRESH REGISTRATION FORM
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

        <form onSubmit={handleJoin} className="space-y-4">
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

          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !phone.trim()}
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
      <button
        onClick={() => {
          localStorage.removeItem("amehlo_active_ticket");
          window.location.reload();
        }}
        className="fixed bottom-4 right-4 bg-zinc-900/10 text-zinc-400 p-2 text-[9px] rounded-lg border border-zinc-200"
      >
        Force Clear Phone Cache
      </button>
    </div>
  );
};
