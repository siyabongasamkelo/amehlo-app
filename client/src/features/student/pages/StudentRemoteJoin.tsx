import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ArrowRight, Loader2, MapPin, Phone } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { useStudent } from "../context/StudentContext";
import { studentService } from "../services/studentService";
import { ServiceAndInstructorPicker } from "../../queue/ServiceAndInstructorPicker";

const BASE_API_URL =
  import.meta.env.VITE_APP_ENV === "development"
    ? "http://localhost:5000/api"
    : "https://amehlo-app.onrender.com/api";

interface BranchOption {
  _id: string;
  name: string;
  phone?: string;
}

export const StudentRemoteJoin: React.FC = () => {
  const navigate = useNavigate();
  const { dbUser } = useApp();
  const { enrollment, activeTicket, setActiveTicket } = useStudent();

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [isLoadingBranches, setIsLoadingBranches] = useState<boolean>(true);
  const [selectedBranch, setSelectedBranch] = useState<BranchOption | null>(
    null,
  );

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const companyId = dbUser?.assignedCompanyId;
    if (!companyId) {
      setIsLoadingBranches(false);
      setError("Your student account is not linked to a driving school yet.");
      return;
    }

    const fetchCompanyBranches = async () => {
      setIsLoadingBranches(true);
      setError(null);
      try {
        const res = await axios.get(
          `${BASE_API_URL}/branches/company/${companyId}`,
        );
        const list = res.data.branches || [];
        setBranches(list);

        // Auto-select if the driving school only has 1 branch
        if (list.length === 1) {
          setSelectedBranch(list);
        }
      } catch (err) {
        console.error("Failed loading company branches:", err);
        setError("Could not load branches for your driving school.");
      } finally {
        setIsLoadingBranches(false);
      }
    };

    fetchCompanyBranches();
  }, [dbUser?.assignedCompanyId]);

  if (!dbUser || dbUser.role !== "student") {
    return <Navigate to="/student/auth" replace />;
  }
  if (!enrollment?.isPaid || enrollment.lessonsRemaining <= 0 || activeTicket) {
    return <Navigate to="/student/portal" replace />;
  }

  const handleJoin = async () => {
    if (!selectedBranch?._id || !selectedServiceId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const ticket = await studentService.joinStudentQueue({
        studentClerkId: dbUser.clerkId,
        branchId: selectedBranch._id,
        serviceId: selectedServiceId,
        isRemoteJoin: true,
        preferredWorkerId: selectedWorkerId,
      });
      setActiveTicket(ticket);
      navigate("/student/portal");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to join the queue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-sans antialiased">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/student/portal")}
            className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-zinc-900 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </button>
          <span className="text-[10px] font-black uppercase tracking-wider text-orange-600">
            Online Check-In
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-lg font-black text-zinc-900">
            Join Queue Online
          </h1>
          <p className="text-xs text-zinc-500">
            Booking for <strong className="text-zinc-800">{dbUser.name}</strong>{" "}
            ({enrollment.code})
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl p-3">
            {error}
          </div>
        )}

        {/* STEP 1: CHOOSE BRANCH CARD */}
        {!selectedBranch ? (
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Select Driving School Branch
            </label>

            {isLoadingBranches ? (
              <div className="flex items-center justify-center py-8 text-xs text-zinc-400 gap-2 bg-zinc-50 border border-zinc-100 rounded-2xl">
                <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                Loading locations...
              </div>
            ) : branches.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-xs font-medium text-center">
                No driving school branches available yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {branches.map((branch) => (
                  <button
                    key={branch._id}
                    type="button"
                    onClick={() => setSelectedBranch(branch)}
                    className="w-full text-left p-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 hover:border-orange-500 hover:bg-orange-50/40 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-white border border-zinc-200 text-orange-600 flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-zinc-900 group-hover:text-orange-700">
                          {branch.name}
                        </div>
                        {branch.phone && (
                          <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" /> {branch.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-orange-600 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* STEP 2: LESSON & INSTRUCTOR SELECTION */
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                <MapPin className="h-4 w-4 text-orange-600" />
                <span>{selectedBranch.name}</span>
              </div>
              {branches.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBranch(null);
                    setSelectedServiceId("");
                  }}
                  className="text-[11px] font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  Change
                </button>
              )}
            </div>

            <ServiceAndInstructorPicker
              branchId={selectedBranch._id}
              selectedServiceId={selectedServiceId}
              onSelectService={setSelectedServiceId}
              selectedWorkerId={selectedWorkerId}
              onSelectWorker={setSelectedWorkerId}
            />

            <button
              type="button"
              disabled={isSubmitting || !selectedServiceId}
              onClick={handleJoin}
              className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Join Queue</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
