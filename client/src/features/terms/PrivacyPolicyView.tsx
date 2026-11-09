import React from "react";
import {
  Shield,
  Eye,
  Database,
  Trash2,
  UserCheck,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PrivacyPolicyView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between p-4 md:p-8 font-sans antialiased text-zinc-800">
      {/* LEGAL CARD CONTAINER */}
      <div className="max-w-3xl w-full mx-auto bg-white border border-zinc-200 rounded-3xl p-6 md:p-10 shadow-xl space-y-8 animate-in fade-in duration-200">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tight text-zinc-900">
              Privacy Policy
            </h1>
            <p className="text-xs text-orange-600 font-medium font-mono uppercase tracking-wider">
              POPIA Data Protection Framework
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

        {/* INTRODUCTION */}
        <p className="text-xs text-zinc-500 font-medium leading-relaxed">
          Amehlo Queue (“we”, “us”, or “our”) operates the virtual queue
          management platform. We respect your privacy and are committed to
          protecting your personal information in strict accordance with the{" "}
          <strong>
            Protection of Personal Information Act, No. 4 of 2013 (POPIA)
          </strong>{" "}
          of South Africa. This policy outlines how we process, secure, and
          permanently destroy data collected through our system.
        </p>

        {/* SECTION 1 */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5 select-none">
            <Database className="h-4 w-4 text-zinc-400" />
            1. Personal Information We Collect
          </h2>
          <p className="text-xs text-zinc-600 font-medium leading-relaxed pl-5">
            We minimize data collection strictly to what is necessary for
            operations. When you use our system, we process:
          </p>
          <ul className="text-xs text-zinc-600 font-medium list-disc pl-10 space-y-1">
            <li>
              <strong>Full Name:</strong> Required to identify you and display
              your token on display screens.
            </li>
            <li>
              <strong>Mobile Phone Number:</strong> Required to anchor your live
              ticket state and transmit operational updates.
            </li>
            <li>
              <strong>Presence Status:</strong> Tracks whether your device is
              flagged as "Remote" or "Arrived" relative to the business
              location.
            </li>
          </ul>
        </div>

        {/* SECTION 2 */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5 select-none">
            <Eye className="h-4 w-4 text-zinc-400" />
            2. Lawful Purpose and Use of Data
          </h2>
          <p className="text-xs text-zinc-600 font-medium leading-relaxed pl-5">
            In terms of Section 11 of POPIA, we only process information with
            your explicit consent to fulfill a specific, transaction-based
            purpose:
          </p>
          <ul className="text-xs text-zinc-600 font-medium list-disc pl-10 space-y-1">
            <li>
              To allocate your real-time sequence number inside the store's line
              layout.
            </li>
            <li>
              To pipe live countdown updates directly to your screen over
              WebSocket channels.
            </li>
            <li>
              To enable merchant staff to manage on-site crowd density and
              service tracking logs.
            </li>
          </ul>
        </div>

        {/* SECTION 3 */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5 select-none">
            <Trash2 className="h-4 w-4 text-zinc-400" />
            3. Strict Data Retention & Destruction
          </h2>
          <p className="text-xs text-zinc-600 font-medium leading-relaxed pl-5">
            We enforce an immediate data lifecycle policy. Your personal
            information is transient:
          </p>
          <ul className="text-xs text-zinc-600 font-medium list-disc pl-10 space-y-1">
            <li>
              <strong>Instant Scrubbing:</strong> The absolute moment your queue
              spot is completed by staff, cancelled by you, or purged as an
              absent entity, your name and phone number are permanently scrubbed
              from active operational memory.
            </li>
            <li>
              <strong>Zero Spam Policy:</strong> Your contact logs are never
              archived for marketing reuse, nor are they ever shared, leased, or
              distributed to external marketing networks.
            </li>
          </ul>
        </div>

        {/* SECTION 4 */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5 select-none">
            <UserCheck className="h-4 w-4 text-zinc-400" />
            4. Your Legal Rights Under POPIA
          </h2>
          <p className="text-xs text-zinc-600 font-medium leading-relaxed pl-5">
            You retain absolute statutory rights over your identity metrics. You
            have the right to:
          </p>
          <ul className="text-xs text-zinc-600 font-medium list-disc pl-10 space-y-1">
            <li>
              Request confirmation of any active tracking data we hold during
              your live session.
            </li>
            <li>
              Withdraw your operational processing consent at any stage by
              terminating your queue ticket.
            </li>
            <li>
              Lodge a direct complaint with the South African Information
              Regulator if you suspect any compliance breach.
            </li>
          </ul>
        </div>

        {/* SECTION 5 */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5 select-none">
            <Shield className="h-4 w-4 text-orange-500" />
            5. Security of Information
          </h2>
          <p className="text-xs text-zinc-600 font-medium leading-relaxed pl-5">
            We take reasonable technical and organizational precautions to
            secure your data against unauthorized access, loss, or alteration.
            All real-time payload traffic running between consumer interfaces
            and our server nodes is strictly encrypted and isolated behind
            authentication layers.
          </p>
        </div>

        {/* FOOTER METADATA */}
        <div className="pt-4 border-t border-zinc-100 text-center select-none">
          <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest">
            Amehlo Legal Release • Effective November 2026
          </span>
        </div>
      </div>

      <div className="text-center text-[10px] text-zinc-400 font-medium mt-6 select-none">
        © 2026 Amehlo Queue Tech. Compliant with the Information Regulator of
        South Africa.
      </div>
    </div>
  );
};
