import React, { useState, useEffect } from "react";
import axios from "axios";
import { Briefcase, Sparkles, Timer, User, Loader2 } from "lucide-react";

const BASE_API_URL =
  import.meta.env.VITE_APP_ENV === "development"
    ? "http://localhost:5000/api"
    : "https://amehlo-app.onrender.com/api";

interface ServiceItem {
  _id: string;
  name: string;
}

interface InstructorItem {
  clerkId: string;
  name: string;
}

interface ServiceAndInstructorPickerProps {
  branchId: string;
  selectedServiceId: string;
  onSelectService: (id: string) => void;
  selectedWorkerId: string | null;
  onSelectWorker: (id: string | null) => void;
}

export const ServiceAndInstructorPicker: React.FC<
  ServiceAndInstructorPickerProps
> = ({
  branchId,
  selectedServiceId,
  onSelectService,
  selectedWorkerId,
  onSelectWorker,
}) => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [instructors, setInstructors] = useState<InstructorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!branchId) return;

    const loadBranchOptions = async () => {
      setIsLoading(true);
      try {
        const [srvRes, staffRes] = await Promise.all([
          axios.get(`${BASE_API_URL}/services/branch/${branchId}`),
          axios.get(`${BASE_API_URL}/users/branch/${branchId}/staff`),
        ]);
        const fetchedServices = srvRes.data.services || [];
        setServices(fetchedServices);
        setInstructors(staffRes.data.staff || []);

        // Auto-select if only one service lane exists
        if (fetchedServices.length === 1) {
          onSelectService(fetchedServices[0]._id);
        }
      } catch (err) {
        console.error("Failed loading branch services & instructors:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBranchOptions();
  }, [branchId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-xs text-zinc-400 gap-2 bg-zinc-50 border border-zinc-100 rounded-2xl">
        <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
        Loading branch services & instructors...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. LESSON / SERVICE TYPE */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5" /> 1. Select Lesson Type
        </label>
        {services.length === 0 ? (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-xs font-medium">
            No lesson types configured for this branch yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 max-h-[140px] overflow-y-auto pr-1">
            {services.map((srv) => {
              const active = selectedServiceId === srv._id;
              return (
                <button
                  key={srv._id}
                  type="button"
                  onClick={() => onSelectService(srv._id)}
                  className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    active
                      ? "bg-orange-50/50 border-orange-500 text-orange-700 shadow-sm"
                      : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100/70"
                  }`}
                >
                  <span>{srv.name}</span>
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      active
                        ? "border-orange-500 bg-orange-500"
                        : "border-zinc-300 bg-white"
                    }`}
                  >
                    {active && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. DRIVING INSTRUCTOR SELECTION */}
      <div className="space-y-2 pt-2 border-t border-dashed border-zinc-100">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-orange-500" /> 2. Choose Your
          Instructor
        </label>

        <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => onSelectWorker(null)}
            className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              selectedWorkerId === null
                ? "bg-orange-50/50 border-orange-500 text-orange-700 shadow-sm"
                : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100/70"
            }`}
          >
            <span className="flex items-center gap-2">
              <Timer className="h-3.5 w-3.5 text-zinc-400" />
              Next Available Instructor (Fastest)
            </span>
            <div
              className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                selectedWorkerId === null
                  ? "border-orange-500 bg-orange-500"
                  : "border-zinc-300 bg-white"
              }`}
            >
              {selectedWorkerId === null && (
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              )}
            </div>
          </button>

          {instructors.map((inst) => {
            const active = selectedWorkerId === inst.clerkId;
            return (
              <button
                key={inst.clerkId}
                type="button"
                onClick={() => onSelectWorker(inst.clerkId)}
                className={`w-full text-left px-4 py-3 text-xs font-bold rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  active
                    ? "bg-orange-50/50 border-orange-500 text-orange-700 shadow-sm"
                    : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100/70"
                }`}
              >
                <span className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-zinc-400" />
                  {inst.name}
                </span>
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    active
                      ? "border-orange-500 bg-orange-500"
                      : "border-zinc-300 bg-white"
                  }`}
                >
                  {active && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
