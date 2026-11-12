import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useApp } from "../../context/AppContext";
import { branchService } from "../branch/services/branchService";
import {
  Building2,
  Plus,
  ArrowRight,
  MapPin,
  Key,
  Loader2,
} from "lucide-react";
import { useBranch } from "../branch/context/BranchContext";
import { useCompany } from "../company/context/CompanyContext";

export const BranchManagementGateway: React.FC = () => {
  // const { activeCompany, branches, loadCompanyBranches, isLoadingBranches } =
  // useApp();
  const { branches, loadCompanyBranches, isLoadingBranches } = useBranch();
  const { activeCompany } = useCompany();

  const navigate = useNavigate();
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    if (!activeCompany?._id) {
      setError("No active corporate workspace selection detected.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // ➔ Fire live creation payload to backend database
      await branchService.createBranch(
        newName.trim(),
        newPhone.trim(),
        activeCompany._id,
      );

      // ➔ Clear input entries
      setNewName("");
      setNewPhone("");

      // ➔ Hot-reload terminal stream
      await loadCompanyBranches(activeCompany._id);
    } catch (err: any) {
      console.error("Branch provisioning error:", err);
      setError(
        err.response?.data?.error ||
          "Failed to provision workspace station branch.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLaunchTerminal = (branchId: string) => {
    // Save active operational terminal to localStorage or state before routing
    localStorage.setItem("active_terminal_id", branchId);
    navigate(`/branch/${branchId}/services`);
  };

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">
          {activeCompany
            ? `${activeCompany.name} Workspace`
            : "Amehlo Enterprise"}
        </h1>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Provision infrastructure branches, generate employee tokens, and
          launch localized terminal lines.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl p-3 text-center max-w-md mx-auto">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        {/* BRANCH CREATION FORM */}
        <form
          onSubmit={handleAddBranch}
          className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4 md:col-span-2"
        >
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="h-4 w-4 text-orange-600" /> Provision Branch
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Initialize a physical location queue pipeline endpoint.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Branch Designation Name
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                placeholder="e.g. Durban North"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Terminal Contact Line
              </label>
              <input
                type="tel"
                required
                disabled={isSubmitting}
                placeholder="e.g. 031 555 9911"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !newName.trim() || !newPhone.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-2.5 shadow-sm active:scale-95 transition-all text-xs cursor-pointer disabled:opacity-40"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>Add New Branch</span>
          </button>
        </form>

        {/* REGISTERED STATIONS STREAM */}
        <div className="space-y-3 md:col-span-3">
          <div className="px-1">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Established Stations
            </h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Select an active operational network endpoint.
            </p>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {isLoadingBranches ? (
              <div className="flex flex-col items-center justify-center p-12 text-zinc-400 text-xs font-medium bg-white border border-zinc-200 rounded-2xl gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                Retrieving localized branches...
              </div>
            ) : branches.length === 0 ? (
              <div className="bg-white border border-zinc-200 border-dashed rounded-2xl p-8 text-center text-zinc-400 text-xs font-medium">
                No active stations found. Provision your first location using
                the panel on the left.
              </div>
            ) : (
              branches.map((b) => (
                <div
                  key={b._id}
                  className="bg-white border border-zinc-200 hover:border-orange-500/40 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all group"
                >
                  <div className="space-y-1 max-w-[65%]">
                    <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5 truncate">
                      <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />{" "}
                      {b.name}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-medium font-mono">
                      TEL: {b.phone}
                    </p>
                    <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-zinc-50 border border-zinc-200 rounded-lg text-[9px] font-mono text-zinc-500">
                      <Key className="h-2.5 w-2.5 text-orange-500" /> Staff
                      Token:{" "}
                      <span className="font-bold text-zinc-700">
                        {b.inviteCode}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLaunchTerminal(b._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white border border-orange-100/50 hover:border-orange-600 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Launch Terminal <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
