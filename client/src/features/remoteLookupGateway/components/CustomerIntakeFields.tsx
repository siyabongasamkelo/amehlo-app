import React from "react";

interface CustomerIntakeFieldsProps {
  name: string;
  setName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
}

export const CustomerIntakeFields: React.FC<CustomerIntakeFieldsProps> = ({
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
}) => {
  return (
    <div className="space-y-3.5 pt-2 border-t border-dashed border-zinc-100">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          Your Full Name
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Thabo Khumalo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 text-xs font-medium focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          Your Mobile Line
        </label>
        <input
          type="tel"
          required
          placeholder="e.g. 072 111 2222"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 text-xs font-medium focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          Email Address (Optional)
        </label>
        <input
          type="email"
          placeholder="e.g. thabo@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-10 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 text-xs font-medium focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>
    </div>
  );
};
