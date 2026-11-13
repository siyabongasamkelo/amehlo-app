import React from "react";
import { Briefcase, Sparkles } from "lucide-react";
import type { IStaffData } from "../../customer/services/customerService";

interface QueueRoutingSelectsProps {
  services: any[];
  isLoadingServices: boolean;
  selectedServiceId: string;
  onSelectService: (id: string) => void;
  branchStaff: IStaffData[];
  isLoadingStaff: boolean;
  selectedWorkerId: string;
  onSelectWorker: (id: string) => void;
}

export const QueueRoutingSelects: React.FC<QueueRoutingSelectsProps> = ({
  services,
  isLoadingServices,
  selectedServiceId,
  onSelectService,
  branchStaff,
  isLoadingStaff,
  selectedWorkerId,
  onSelectWorker,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <div className="relative">
        <select
          required
          value={selectedServiceId}
          onChange={(e) => onSelectService(e.target.value)}
          disabled={isLoadingServices || services.length === 0}
          className="w-full h-10 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100/60 focus:bg-white pl-3.5 pr-9 text-xs text-zinc-900 focus:outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer disabled:opacity-50 font-semibold truncate"
        >
          <option value="" disabled hidden>
            {isLoadingServices ? "Mapping Lanes..." : "Service Lane..."}
          </option>
          {services.map((srv) => (
            <option key={srv._id} value={srv._id}>
              {srv.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400">
          <Briefcase className="h-3.5 w-3.5 stroke-[2.2]" />
        </div>
      </div>

      <div className="relative">
        <select
          value={selectedWorkerId}
          onChange={(e) => onSelectWorker(e.target.value)}
          disabled={isLoadingStaff}
          className="w-full h-10 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100/60 focus:bg-white pl-3.5 pr-9 text-xs text-zinc-900 focus:outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer disabled:opacity-50 font-semibold truncate"
        >
          <option value="">Any Available Instructor</option>
          {branchStaff.map((staff) => (
            <option key={staff.clerkId} value={staff.clerkId}>
              Instructor: {staff.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-orange-500 stroke-[2.2]" />
        </div>
      </div>
    </div>
  );
};
