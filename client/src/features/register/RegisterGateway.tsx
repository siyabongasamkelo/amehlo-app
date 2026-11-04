import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  UserPlus,
  Shield,
  Building2,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const RegisterGateway: React.FC = () => {
  // CONNECT AND PULL THE LOGIN EMULATION ENGINE
  const { loginSimulated } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setIsLoading(true);

    // ACTIVATE HOOK TO UPDATE OUR SINGLE SOURCE OF TRUTH CONTEXT
    setTimeout(() => {
      setIsLoading(false);

      // 🚀 THIS IS THE ENGINE KEY: Inject data straight into the Context brain!
      loginSimulated(name, email, inviteCode);

      if (inviteCode.trim() !== "") {
        navigate("/dashboard"); // Staff token bypasses setups straight to the terminal
      } else {
        navigate("/branches"); // Master business profile configures locations first
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans antialiased flex flex-col justify-center items-center p-4 sm:p-6 md:p-12 selection:bg-orange-600/10">
      <div className="max-w-md w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* BRAND IDENTITY HEADER DISPLAY */}
        <div className="text-center space-y-2 select-none">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-orange-600/20">
            A
          </div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">
            Join Amehlo Workspace
          </h1>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Single entry gateway for enterprise founders, branch owners, and
            operations floor staff.
          </p>
        </div>

        {/* UNIFIED CORE SUBMIT FLOW FORM BLOCK */}
        <form
          onSubmit={handleRegistration}
          className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-4"
        >
          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                disabled={isLoading}
                placeholder="e.g. Sizwe Khumalo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-zinc-900 placeholder:text-zinc-400 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Work Email Address
              </label>
              <input
                type="email"
                required
                disabled={isLoading}
                placeholder="name@business.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-zinc-900 placeholder:text-zinc-400 disabled:opacity-50"
              />
            </div>

            <div className="space-y-1 relative">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Secure Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-4 pr-10 py-2.5 text-xs font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-zinc-900 placeholder:text-zinc-400 disabled:opacity-50"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="relative my-6 select-none">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-white px-3 text-zinc-300">
                Access Key Mapping
              </span>
            </div>
          </div>

          {/* CONTROL SECTION 2: IMPLICIT DETERMINISTIC ROUTER FIELD */}
          <div className="space-y-2 bg-zinc-50/60 p-4 border border-zinc-100 rounded-2xl">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Staff Invite Token
                </label>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200/50 font-bold uppercase tracking-wider text-zinc-500">
                  Optional
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  disabled={isLoading}
                  placeholder="e.g. AMHL-EMP-92"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 pl-9 text-xs font-mono font-bold tracking-wider uppercase text-zinc-800 placeholder:text-zinc-400 placeholder:font-sans placeholder:font-medium focus:outline-none focus:border-orange-500 transition-colors disabled:opacity-50"
                />
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              </div>
            </div>

            {/* DYNAMIC IMPLICIT STATUS FOOTER LABEL */}
            <div className="pt-1 flex items-start gap-2 text-[11px] leading-tight text-zinc-400 select-none">
              {inviteCode.trim() !== "" ? (
                <>
                  <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <p>
                    Token keyed. Profile routing binds automatically to assigned
                    operations branch.
                  </p>
                </>
              ) : (
                <>
                  <Building2 className="h-3.5 w-3.5 text-orange-500 shrink-0 mt-0.5" />
                  <p>
                    Leaving this block empty initializes a fresh master business
                    infrastructure cluster.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-2.5 shadow-sm active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all text-xs cursor-pointer h-10"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Create Live Profile
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-[10px] text-zinc-400 select-none font-mono uppercase tracking-wider">
          Secure Authentication Shell v1.0.0
        </div>
      </div>
    </div>
  );
};
