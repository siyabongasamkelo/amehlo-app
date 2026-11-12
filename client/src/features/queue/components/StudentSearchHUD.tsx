import React, { useState, useEffect } from "react";
import { UserPlus, Sparkles, Briefcase } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { customerService } from "../../customer/services/customerService";
import type { IStaffData } from "../../customer/services/customerService";
import { useServices } from "../../services/context/ServiceContext";

interface StudentSearchHUDProps {
  onInsertToQueue: (
    name: string,
    phone: string,
    serviceId: string,
    email?: string,
    preferredWorkerId?: string | null, // ➔ 🎯 Capture requested favorite specialist payload
  ) => void;
}

export const StudentSearchHUD: React.FC<StudentSearchHUDProps> = ({
  onInsertToQueue,
}) => {
  const { isLoadingServices, activeBranchId } = useApp();
  // const { activeBranchId } = useApp();
  const { services } = useServices();

  // Local Form Fields State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState(""); // ➔ Track favorite professional selection

  // Local Staff Roster Cache States
  const [branchStaff, setBranchStaff] = useState<IStaffData[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // 📡 DYNAMICALLY RETRIEVE STAFF ASSIGNED TO THIS PHYSICAL STATION TERMINAL
  useEffect(() => {
    if (!activeBranchId) return;

    const fetchBranchRoster = async () => {
      setIsLoadingStaff(true);
      try {
        const staffData =
          await customerService.getBranchWorkers(activeBranchId);
        setBranchStaff(staffData);
      } catch (err) {
        console.error("Failed loading staff roster for intake desk view:", err);
      } finally {
        setIsLoadingStaff(false);
      }
    };

    fetchBranchRoster();
  }, [activeBranchId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !selectedServiceId) return;

    // Forward the chosen worker ID (null represents Next Available shared pool)
    const workerPayload =
      selectedWorkerId.trim() !== "" ? selectedWorkerId : null;

    onInsertToQueue(
      name,
      phone,
      selectedServiceId,
      email || undefined,
      workerPayload,
    );

    // Clear state values cleanly for next walk-in entry customer
    setName("");
    setPhone("");
    setEmail("");
    setSelectedServiceId("");
    setSelectedWorkerId("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in duration-150"
    >
      <div>
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
          Add Entry to Queue
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Input walk-in patron metadata to generate a live sequence priority
          ticket number.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT COLUMN: IDENTITY PARAMETERS */}
        <div className="grid grid-cols-1 gap-3">
          <input
            type="text"
            required
            placeholder="Customer Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors"
            disabled={isLoadingServices || isLoadingStaff}
          />
          <input
            type="tel"
            required
            placeholder="Contact Phone Line"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors"
            disabled={isLoadingServices || isLoadingStaff}
          />
          <input
            type="email"
            placeholder="Email Address (Optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors"
            disabled={isLoadingServices || isLoadingStaff}
          />
        </div>

        {/* RIGHT COLUMN: PRIORITY ROUTING PARAMETERS */}
        <div className="grid grid-cols-1 gap-3">
          {/* A. LIVE SERVICE SELECTION DROPDOWN */}
          <div className="relative">
            <select
              required
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              disabled={isLoadingServices || services.length === 0}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer disabled:opacity-50 font-semibold"
            >
              <option value="" disabled hidden>
                {isLoadingServices
                  ? "Mapping Lanes..."
                  : "Select Service Department..."}
              </option>
              {services.map((srv) => (
                <option key={srv._id} value={srv._id}>
                  {srv.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
              <Briefcase className="h-3.5 w-3.5 stroke-[2.5]" />
            </div>
          </div>

          {/* B. DYNAMIC STAFF SPECIALIST ASSIGNMENT DROPDOWN */}
          <div className="relative">
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              disabled={isLoadingStaff}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer disabled:opacity-50 font-semibold"
            >
              <option value="">
                Next Available Specialist (Shared Pool Queue)
              </option>
              {branchStaff.map((staff) => (
                <option key={staff.clerkId} value={staff.clerkId}>
                  Assign directly to: {staff.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
              <Sparkles className="h-3.5 w-3.5 text-orange-500 stroke-[2.5]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-zinc-100 border-dashed">
        <button
          type="submit"
          disabled={
            isLoadingServices ||
            isLoadingStaff ||
            services.length === 0 ||
            !name ||
            !phone ||
            !selectedServiceId
          }
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-5 py-2.5 shadow-sm active:scale-95 transition-all text-xs cursor-pointer disabled:opacity-40"
        >
          <UserPlus className="h-4 w-4" />
          Add to Queue Pipeline
        </button>
      </div>
    </form>
  );
};
