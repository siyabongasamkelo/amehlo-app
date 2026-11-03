import React, { useState } from "react";
import { UserPlus } from "lucide-react";

interface StudentSearchHUDProps {
  onInsertToQueue: (name: string, phone: string, email?: string) => void;
}

export const StudentSearchHUD: React.FC<StudentSearchHUDProps> = ({
  onInsertToQueue,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    onInsertToQueue(name, phone, email || undefined);
    setName("");
    setPhone("");
    setEmail("");
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-zinc-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">
          Live Operations
        </h1>
        <p className="text-xs text-zinc-500">
          Real-time status tracking and sequential priority engine.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4"
      >
        <div>
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
            Add Entry to Queue
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Input reference metadata to assign a live sequence ticket number.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors"
          />
          <input
            type="tel"
            required
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors"
          />
          <input
            type="email"
            placeholder="Email Address (Optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-5 py-2.5 shadow-sm active:scale-98 transition-all text-xs cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Add to Queue
          </button>
        </div>
      </form>
    </div>
  );
};
