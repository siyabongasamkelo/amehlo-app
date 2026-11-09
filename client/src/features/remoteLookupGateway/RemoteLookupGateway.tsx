import React, { useState, useEffect } from "react";
import { customerService } from "../customer/services/customerService";
import { io } from "socket.io-client";
import { Loader2, ArrowRight, Briefcase } from "lucide-react";
import { SearchBranchForm } from "../remoteLookupGateway/components/SearchBranchForm";
import { BranchMatchCard } from "../remoteLookupGateway/components/BranchMatchCard";
import { CustomerIntakeFields } from "../remoteLookupGateway/components/CustomerIntakeFields";
import { RemoteTicketMonitor } from "../remoteLookupGateway/components/RemoteTicketMonitor";
import axios from "axios";

export const RemoteLookupGateway: React.FC = () => {
  const [phoneNumberQuery, setPhoneNumberQuery] = useState("");
  const [isSearchingBranch, setIsSearchingBranch] = useState(false);
  const [foundBranch, setFoundBranch] = useState<any | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // WebSocket Live Re-Hydration Sync Engine
  useEffect(() => {
    if (!myTicket || myTicket.status === "Completed") return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      upgrade: false,
    });

    socket.on("connect", () => {
      socket.emit("join_branch_room", myTicket.branchId);
    });

    socket.on("queue_updated", (updatedQueue: any) => {
      const queueArray = Array.isArray(updatedQueue)
        ? updatedQueue
        : updatedQueue?.queue || [];
      const freshRecord = queueArray.find(
        (t: any) => t._id === myTicket._id || t.ticketId === myTicket.ticketId,
      );

      if (freshRecord) {
        setLivePosition(freshRecord.position);
        localStorage.setItem(
          "amehlo_active_ticket",
          JSON.stringify({ ...myTicket, position: freshRecord.position }),
        );
      } else {
        localStorage.removeItem("amehlo_active_ticket");
        setMyTicket(null);
        setLivePosition(null);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [myTicket?._id]);

  const handleSearchBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumberQuery.trim()) return;
    setIsSearchingBranch(true);
    setError(null);

    try {
      const res = await axios.get(`${SOCKET_URL}/api/branches/search/phone`, {
        params: { phone: phoneNumberQuery.trim() },
      });
      setFoundBranch(res.data.branch);
      setIsLoadingServices(true);
      const serviceRes = await axios.get(
        `${SOCKET_URL}/api/services/branch/${res.data.branch._id}`,
      );
      setAvailableServices(serviceRes.data.services || []);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Could not find a branch linked to this phone number.",
      );
    }
    Southern: {
      setIsSearchingBranch(false);
      setIsLoadingServices(false);
    }
  };

  const handleRemoteJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundBranch?._id || !selectedServiceId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const ticket = await customerService.joinQueueFromMobile(
        foundBranch._id,
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
      setError(err.response?.data?.error || "Failed to secure a queue slot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!myTicket?._id) return;
    const confirmLeave = window.confirm(
      "Are you sure you want to cancel your remote spot? You will lose your position completely.",
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
      console.error("Failed exit tracking pipeline:", err);
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-sans antialiased">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-6 shadow-xl space-y-6">
        {/* Render Monitor directly if active remote state resolves */}
        {myTicket ? (
          <RemoteTicketMonitor
            ticket={myTicket}
            position={livePosition}
            onCancel={handleLeaveQueue}
            isCancelling={isLeaving}
          />
        ) : (
          <>
            <div className="text-center space-y-1 select-none">
              <div className="h-10 w-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center mx-auto mb-2 font-black text-lg">
                A
              </div>
              <h2 className="text-lg font-black tracking-tight text-zinc-900">
                Remote Queue Check-In
              </h2>
              <p className="text-xs text-zinc-500">
                Join lines from home or travel transit cleanly.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl p-3 text-center">
                {error}
              </div>
            )}

            {!foundBranch ? (
              <SearchBranchForm
                query={phoneNumberQuery}
                setQuery={setPhoneNumberQuery}
                onSearch={handleSearchBusiness}
                isSearching={isSearchingBranch}
              />
            ) : (
              <form
                onSubmit={handleRemoteJoinQueue}
                className="space-y-5 animate-in fade-in zoom-in-95 duration-200"
              >
                <BranchMatchCard
                  branch={foundBranch}
                  onReset={() => {
                    setFoundBranch(null);
                    setAvailableServices([]);
                    setSelectedServiceId("");
                  }}
                />

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" /> Select Service
                  </label>
                  {isLoadingServices ? (
                    <div className="flex items-center justify-center py-4 text-zinc-400 text-xs gap-2 bg-zinc-50 border border-zinc-100 rounded-xl">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />{" "}
                      Locating lanes...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {availableServices.map((srv) => (
                        <button
                          key={srv._id}
                          type="button"
                          onClick={() => setSelectedServiceId(srv._id)}
                          className={`w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-xl border flex items-center justify-between cursor-pointer ${selectedServiceId === srv._id ? "bg-orange-50/50 border-orange-500 text-orange-700" : "bg-zinc-50 border-zinc-200 text-zinc-700"}`}
                        >
                          <span>{srv.name}</span>
                          <div
                            className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ${selectedServiceId === srv._id ? "border-orange-500 bg-orange-500" : "border-zinc-300"}`}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <CustomerIntakeFields
                  name={name}
                  setName={setName}
                  phone={phone}
                  setPhone={setPhone}
                  email={email}
                  setEmail={setEmail}
                />
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !name.trim() ||
                    !phone.trim() ||
                    !selectedServiceId
                  }
                  className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white font-semibold text-xs disabled:opacity-40 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  <span>Secure Remote Ticket</span>
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
