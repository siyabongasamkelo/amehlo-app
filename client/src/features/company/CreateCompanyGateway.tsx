import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { companyService } from "./services/companyService";
import { useNavigate } from "react-router-dom";
import { Building2, ArrowRight } from "lucide-react";

export const CreateCompanyGateway: React.FC = () => {
  const { dbUser, syncAndHydrateProfile } = useApp();
  const [companyName, setCompanyName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !dbUser?._id) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Fire creation payload to the server backend
      await companyService.createCompany(companyName.trim(), dbUser._id);

      // 2. Trigger your context hydration to re-pull fresh profile metrics
      await syncAndHydrateProfile();

      // 3. Drive them straight to infrastructure configuration setup
      navigate("/branches");
    } catch (err: any) {
      console.error("Company execution creation fault:", err);
      setError(
        err.response?.data?.error ||
          "Failed to register business node profile.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md space-y-6 bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
        {/* Header Metadata Spec Branding */}
        <div className="space-y-2 text-center select-none">
          <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mx-auto border border-orange-100 shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-zinc-900 mt-2">
            Register Your Enterprise
          </h2>
          <p className="text-xs text-zinc-400 font-medium px-4">
            Welcome to Amehlo,{" "}
            <span className="font-bold text-zinc-700">{dbUser?.name}</span>.
            Let's create your top-level business container to launch your local
            queue terminals.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl p-3 text-center">
            {error}
          </div>
        )}

        {/* Dynamic Minimal Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Legal Business / Company Name
            </label>
            <input
              type="text"
              placeholder="e.g., Blue Salon, Pretoria North Hub"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isLoading}
              required
              className="w-full h-11 px-3.5 bg-zinc-50 border border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 rounded-xl text-xs font-semibold text-zinc-800 transition-all focus:bg-white outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !companyName.trim()}
            className="w-full h-11 inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none"
          >
            {isLoading ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Initialize Platform Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
