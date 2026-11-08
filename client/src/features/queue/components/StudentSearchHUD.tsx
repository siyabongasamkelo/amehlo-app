import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { useApp } from "../../../context/AppContext"; // ➔ Access the global category metrics layer

interface StudentSearchHUDProps {
  onInsertToQueue: (
    name: string,
    phone: string,
    serviceId: string,
    email?: string,
  ) => void; // ➔ Added serviceId
}

export const StudentSearchHUD: React.FC<StudentSearchHUDProps> = ({
  onInsertToQueue,
}) => {
  const { services, isLoadingServices } = useApp(); // ➔ Pull down the custom active branch routes
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState(""); // ➔ Track active field value

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !selectedServiceId) return;

    onInsertToQueue(name, phone, selectedServiceId, email || undefined);
    setName("");
    setPhone("");
    setEmail("");
    setSelectedServiceId("");
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
          Input reference metadata to assign a live sequence ticket number.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {" "}
        {/* ➔ Shifted to 4 columns grid space */}
        <input
          type="text"
          required
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors"
          disabled={isLoadingServices}
        />
        <input
          type="tel"
          required
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors"
          disabled={isLoadingServices}
        />
        <input
          type="email"
          placeholder="Email Address (Optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors"
          disabled={isLoadingServices}
        />
        {/* ➔ THE LIVE SERVICE SELECTION DROPDOWN */}
        <div className="relative">
          <select
            required
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            disabled={isLoadingServices || services.length === 0}
            className="w-full h-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer disabled:opacity-50 font-medium"
          >
            <option value="" disabled hidden>
              {isLoadingServices ? "Loading Lanes..." : "Select Service..."}
            </option>
            {services.map((srv) => (
              <option key={srv._id} value={srv._id}>
                {srv.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://w3.org"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={
            isLoadingServices ||
            services.length === 0 ||
            !name ||
            !phone ||
            !selectedServiceId
          }
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-5 py-2.5 shadow-sm active:scale-95 transition-all text-xs cursor-pointer disabled:opacity-40"
        >
          <UserPlus className="h-4 w-4" />
          Add to Queue
        </button>
      </div>
    </form>
  );
};
