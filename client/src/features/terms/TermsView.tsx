import React from "react";
import { Shield, Scale, Info, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const TermsView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between p-4 md:p-8 font-sans antialiased text-zinc-800">
      {/* MAIN LEGAL CARD CONTAINER */}
      <div className="max-w-2xl w-full mx-auto bg-white border border-zinc-200 rounded-3xl p-6 md:p-10 shadow-xl space-y-8 animate-in fade-in duration-200">
        {/* COMPONENT HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight text-zinc-900">
              Terms of Service & Privacy
            </h1>
            <p className="text-xs text-zinc-400 font-medium font-mono uppercase tracking-wider">
              Legal Framework & POPIA Compliance
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-bold px-3 py-1.5 shadow-sm text-xs transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Go Back</span>
          </button>
        </div>

        {/* SECTION 1: POPIA DATA POLICY */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-orange-600 flex items-center gap-1.5 select-none">
            <Shield className="h-4 w-4 shrink-0 text-orange-500" />
            1. POPIA Data Processing & Privacy
          </h2>
          <p className="text-xs text-zinc-600 font-medium leading-relaxed pl-5">
            In compliance with the South African Protection of Personal
            Information Act (POPIA), we strictly minimize data storage. We
            collect your{" "}
            <strong>Name, Phone Number, and Presence Status</strong> solely to
            manage your real-time place in line. Active tracking tokens are
            automatically cleared or anonymized from our operational database
            memory channels the moment your session is completed, cancelled, or
            discarded. We never lease or sell your contact metadata to marketing
            channels.
          </p>
        </div>

        {/* SECTION 2: LIABILITY WAIVER */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5 select-none">
            <Scale className="h-4 w-4 shrink-0 text-zinc-400" />
            2. Total Limitation of Liability
          </h2>
          <p className="text-xs text-zinc-600 font-medium leading-relaxed pl-5">
            This tracking infrastructure is delivered on an "as-is" and
            "as-available" basis. We accept no responsibility or legal liability
            for direct or indirect losses, business disruptions, or damages
            resulting from missed appointments, technical glitches, connectivity
            dropouts, network downtime, or any system latency originating from
            third-party server hosting clusters.
          </p>
        </div>

        {/* SECTION 3: MERCHANDISE & COMMUNICATIONS */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5 select-none">
            <Info className="h-4 w-4 shrink-0 text-zinc-400" />
            3. Operational Rules & Messaging
          </h2>
          <p className="text-xs text-zinc-600 font-medium leading-relaxed pl-5">
            The platform serves purely as a technological bridge. Final priority
            assignments, call-ups, or premature removals from the live pipeline
            are managed entirely at the sole discretion of the physical merchant
            branch staff. By submitting your phone line to request an entry
            ticket, you explicitly consent to receive real-time,
            transaction-based data pulses or notification updates tied directly
            to your active queue cycle.
          </p>
        </div>

        {/* CARD FOOTER META TIMESTAMP */}
        <div className="pt-4 border-t border-zinc-100 text-center select-none">
          <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest">
            Amehlo System Release v1.0.0 • Verified November 2026
          </span>
        </div>
      </div>

      {/* COMPACT COPYRIGHT ANCHOR */}
      <div className="text-center text-[10px] text-zinc-400 font-medium mt-6 select-none">
        © 2026 Amehlo Queue Tech. All localized operational rights reserved.
      </div>
    </div>
  );
};
