import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { Scissors, Plus, X, ArrowRight, Loader2, Sparkles } from "lucide-react";

export const BranchServicesConfig: React.FC = () => {
  // const { branchId } = useParams<{ branchId: string }>();
  const {
    activeCompany,
    services,
    configureInitialServices,
    isLoadingServices,
    loadBusinessServices,
  } = useApp();
  const navigate = useNavigate();

  const [inputVal, setInputVal] = useState("");
  const [localServices, setLocalServices] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with existing backend records if they already exist
  useEffect(() => {
    if (activeCompany?._id) {
      loadBusinessServices(activeCompany._id);
    }
  }, [activeCompany?._id]);

  useEffect(() => {
    if (services.length > 0) {
      setLocalServices(services.map((s) => s.name));
    }
  }, [services]);

  const handleAddChip = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = inputVal.trim();
    if (!formatted) return;

    if (
      localServices.some((s) => s.toLowerCase() === formatted.toLowerCase())
    ) {
      setError("This operational track category already exists.");
      return;
    }

    setLocalServices([...localServices, formatted]);
    setInputVal("");
    setError(null);
  };

  const handleRemoveChip = (indexToRemove: number) => {
    setLocalServices(localServices.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveAndAdvance = async () => {
    if (localServices.length === 0) {
      setError(
        "Please provision at least one structural service lane before proceeding.",
      );
      return;
    }
    if (!activeCompany?._id) return;

    setIsSaving(true);
    setError(null);

    try {
      await configureInitialServices(activeCompany._id, localServices);
      navigate("/dashboard");
    } catch (err: any) {
      setError("Could not bind workspace channels. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 py-12">
      <div className="text-center space-y-2">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 border border-orange-100">
          <Sparkles className="h-4 w-4 text-orange-600" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">
          Configure Service Lanes
        </h1>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Define specialized departments for this branch. Customers will select
          from these options when joining the queue.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl p-3 text-center transition-all">
          {error}
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6">
        {/* CHIP SEEDING BOX FORM */}
        <form onSubmit={handleAddChip} className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Add Department / Operation Service
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Hair Styling, Nail Treatment, Massage"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-500 transition-colors"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-4 transition-all text-xs cursor-pointer active:scale-95"
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </button>
          </div>
        </form>

        {/* CHIP PILL CONTAINER LAYOUT */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Active Workspace Categories
          </h4>

          {isLoadingServices ? (
            <div className="flex items-center justify-center py-6 text-zinc-400 text-xs gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />{" "}
              Syncing settings...
            </div>
          ) : localServices.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-zinc-100 rounded-xl text-xs font-medium text-zinc-400">
              No service routes added yet. Type an option above to build your
              line config.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
              {localServices.map((srv, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-white border border-zinc-200 text-zinc-800 text-xs font-semibold rounded-xl shadow-sm animate-in zoom-in-95 duration-150"
                >
                  <Scissors className="h-3 w-3 text-zinc-400" />
                  <span>{srv}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChip(idx)}
                    className="h-4 w-4 inline-flex items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FORWARD LAUNCH ACTION PROCESS BUTTON */}
        <button
          type="button"
          onClick={handleSaveAndAdvance}
          disabled={isSaving || localServices.length === 0}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-300 text-white font-bold py-3 shadow-md shadow-orange-600/10 active:scale-98 transition-all text-xs cursor-pointer disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Launch Live Operations Terminal</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
