import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Plus, X, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useServices } from "../../services/context/ServiceContext";
import { useCompany } from "../../company/context/CompanyContext";
import { useBranch } from "@/features/branch/context/BranchContext";
import type { IServiceSetupInput } from "../services/categoryService";

interface LocalServiceItem extends IServiceSetupInput {
  _id?: string;
}

export const BranchServicesConfig: React.FC = () => {
  const {
    services,
    isLoadingServices,
    configureInitialServices,
    updateServicePrice,
  } = useServices();
  const { activeCompany } = useCompany();
  const { activeBranchId } = useBranch();
  const navigate = useNavigate();

  const [inputVal, setInputVal] = useState("");
  const [priceVal, setPriceVal] = useState("");
  const [localServices, setLocalServices] = useState<LocalServiceItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (services.length > 0) {
      setLocalServices(
        services.map((s) => ({
          _id: s._id,
          name: s.name,
          price: s.price ?? 0,
        })),
      );
    }
  }, [services]);

  const handleAddChip = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = inputVal.trim();
    if (!formatted) return;

    const numericPrice =
      priceVal.trim() === "" ? 0 : Math.max(0, Number(priceVal));
    if (Number.isNaN(numericPrice)) {
      setError("Please enter a valid Rand amount.");
      return;
    }

    if (
      localServices.some(
        (s) => s.name.toLowerCase() === formatted.toLowerCase(),
      )
    ) {
      setError("This service or licence code already exists.");
      return;
    }

    setLocalServices([
      ...localServices,
      { name: formatted, price: numericPrice },
    ]);
    setInputVal("");
    setPriceVal("");
    setError(null);
  };

  const handleRemoveChip = (indexToRemove: number) => {
    setLocalServices(localServices.filter((_, idx) => idx !== indexToRemove));
  };

  const handleInlinePriceEdit = (index: number, nextPriceStr: string) => {
    const val = nextPriceStr === "" ? 0 : Math.max(0, Number(nextPriceStr));
    if (Number.isNaN(val)) return;

    setLocalServices((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, price: val } : item)),
    );
  };

  const handleSaveAndAdvance = async () => {
    if (localServices.length === 0) {
      setError(
        "Please add at least one driving school service before proceeding.",
      );
      return;
    }
    if (!activeCompany?._id || !activeBranchId) return;

    setIsSaving(true);
    setError(null);

    try {
      // 1. Update prices on any existing services that were edited
      const existingUpdates = localServices
        .filter((item) => item._id)
        .map((item) => updateServicePrice(item._id!, item.price));

      await Promise.all(existingUpdates);

      // 2. Insert any brand-new services with their prices
      const newItems = localServices
        .filter((item) => !item._id)
        .map(({ name, price }) => ({ name, price }));

      if (newItems.length > 0) {
        await configureInitialServices(activeBranchId, newItems);
      }

      navigate("/dashboard");
    } catch (err: any) {
      setError("Could not save services and prices. Please try again.");
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
          Configure Services & Pricing
        </h1>
        <p className="text-xs text-zinc-500 max-w-sm mx-auto">
          Set up your licence codes and course prices (e.g. Code 10 — R4,000) so
          desk staff can track payments automatically.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl p-3 text-center transition-all">
          {error}
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6">
        {/* SERVICE + PRICE SEEDING FORM */}
        <form onSubmit={handleAddChip} className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Add Licence Code / Course & Standard Price
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. Code 10 Full Course, Code 8, Learners"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-500 transition-colors"
            />
            <div className="relative sm:w-36">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                R
              </span>
              <input
                type="number"
                min="0"
                step="50"
                placeholder="4000"
                value={priceVal}
                onChange={(e) => setPriceVal(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-7 pr-3 py-2.5 text-xs font-bold text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-4 py-2.5 transition-all text-xs cursor-pointer active:scale-95"
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </button>
          </div>
        </form>

        {/* ACTIVE SERVICES & EDITABLE PRICES LIST */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Active Branch Services & Prices
          </h4>

          {isLoadingServices ? (
            <div className="flex items-center justify-center py-6 text-zinc-400 text-xs gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />{" "}
              Syncing services...
            </div>
          ) : localServices.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-zinc-100 rounded-xl text-xs font-medium text-zinc-400">
              No services added yet. Enter a service name and Rand price above.
            </div>
          ) : (
            <div className="space-y-2 p-3 bg-zinc-50 border border-zinc-100 rounded-xl">
              {localServices.map((srv, idx) => (
                <div
                  key={srv._id || idx}
                  className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-zinc-200 text-zinc-800 text-xs font-semibold rounded-xl shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Car className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                    <span className="font-bold text-zinc-900">{srv.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400">
                        R
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={srv.price}
                        onChange={(e) =>
                          handleInlinePriceEdit(idx, e.target.value)
                        }
                        className="w-full h-8 pl-6 pr-2 rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-bold text-zinc-900 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    {!srv._id && (
                      <button
                        type="button"
                        onClick={() => handleRemoveChip(idx)}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LAUNCH BUTTON */}
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
              <span>Save Pricing & Launch Terminal</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
