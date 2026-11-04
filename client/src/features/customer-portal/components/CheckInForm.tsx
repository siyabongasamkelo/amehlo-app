import React, { useState } from "react";
import { UserPlus, Users, Clock, Phone, Mail, User } from "lucide-react";

interface CheckInFormProps {
  businessName: string;
  branchName: string;
  activeWaitCount: number;
  estWaitMinutes: number;
  onJoin: (name: string, phone: string, email?: string) => void;
}

export const CheckInForm: React.FC<CheckInFormProps> = ({
  businessName,
  branchName,
  activeWaitCount,
  estWaitMinutes,
  onJoin,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim()) return;
    onJoin(customerName.trim(), phone.trim(), email.trim() || undefined);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* STOREFRONT BANNER IDENTITY */}
      <div className="text-center space-y-2 select-none">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-orange-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-orange-600/20">
          {businessName.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">
          {businessName}
        </h1>
        <p className="text-xs font-semibold text-zinc-500 tracking-wide">
          📍 {branchName}
        </p>
      </div>

      {/* LIVE PULSE CONTAINER */}
      <div className="bg-zinc-900 text-zinc-100 rounded-2xl p-4 shadow-sm border border-zinc-800 grid grid-cols-2 gap-4 divide-x divide-zinc-800 select-none">
        <div className="flex flex-col items-center justify-center space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-orange-500" /> Line Load
          </span>
          <span className="text-lg font-black tracking-tight text-zinc-100">
            {activeWaitCount} Waiting
          </span>
        </div>
        <div className="flex flex-col items-center justify-center space-y-1 pl-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-orange-500" /> Delay Window
          </span>
          <span className="text-lg font-black tracking-tight text-zinc-100">
            ~{estWaitMinutes} Mins
          </span>
        </div>
      </div>

      {/* UPGRADED MULTI-INPUT CHECK-IN FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4"
      >
        <div className="space-y-3.5">
          {/* INPUT 1: NAME */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Your Name
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. Thabo"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-zinc-900"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            </div>
          </div>

          {/* INPUT 2: PHONE */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Mobile Contact Number
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="e.g. 082 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-zinc-900"
              />
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            </div>
          </div>

          {/* INPUT 3: EMAIL */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Email Address
              </label>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 font-bold uppercase tracking-wider text-zinc-400">
                Optional
              </span>
            </div>
            <div className="relative">
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-zinc-900"
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-3 shadow-sm active:scale-95 transition-all text-xs cursor-pointer h-11"
        >
          <UserPlus className="h-4 w-4" /> Secure My Spot in Line
        </button>

        <div className="pt-1 text-center text-[11px] leading-relaxed text-zinc-400 select-none">
          We will keep your screen updated live and push out an alert status
          when your turn approaches.
        </div>
      </form>
    </div>
  );
};
