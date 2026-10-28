import React from "react";
import { User, Mail, Phone } from "lucide-react";

interface IdentityFormProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  whatsappNo: string;
  setWhatsappNo: (val: string) => void;
  gender: "Male" | "Female" | "Other";
  setGender: (val: "Male" | "Female" | "Other") => void;
}

export const IdentityForm: React.FC<IdentityFormProps> = ({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  whatsappNo,
  setWhatsappNo,
  gender,
  setGender,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Name Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-zinc-400" /> Full Legal Name
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Siphesihle Dlamini"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>

      {/* Email Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 text-zinc-400" /> Email Address
          (Optional)
        </label>
        <input
          type="email"
          placeholder="e.g. sphiwe@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-zinc-400" /> Mobile Number
          </label>
          <input
            type="tel"
            required
            placeholder="e.g. 082 555 1234"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-zinc-400" /> WhatsApp Number
          </label>
          <input
            type="tel"
            placeholder="Leave blank to copy mobile"
            value={whatsappNo}
            onChange={(e) => setWhatsappNo(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700">
          Gender Specification
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["Male", "Female", "Other"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                gender === g
                  ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
                  : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
