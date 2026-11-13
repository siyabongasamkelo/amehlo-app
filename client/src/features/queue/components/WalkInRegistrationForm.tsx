import React, { useState } from "react";
import { UserCheck, Loader2, AlertCircle, Check } from "lucide-react";
import { studentService } from "../../student/services/studentService";
import type { ISearchedStudent } from "../../student/services/studentService";

interface WalkInRegistrationFormProps {
  companyId?: string;
  branchId?: string;
  onSuccess: (createdStudent: ISearchedStudent) => void;
}

export const WalkInRegistrationForm: React.FC<WalkInRegistrationFormProps> = ({
  companyId,
  branchId,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [goal, setGoal] = useState<"learners" | "drivers">("drivers");
  const [code, setCode] = useState("Code 8");
  const [lessonsCount, setLessonsCount] = useState<number>(10);
  const [isPaidAtDesk, setIsPaidAtDesk] = useState<boolean>(true);

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoalChange = (nextGoal: "learners" | "drivers") => {
    setGoal(nextGoal);
    setCode(nextGoal === "learners" ? "Code 2 (Learners)" : "Code 8");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !name.trim() || !email.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      // 1. Create Clerk account + MongoDB User profile
      const newUser = await studentService.adminCreateStudent({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        companyId,
        branchId,
      });

      // 2. Create active course enrollment
      let enrollment = await studentService.createEnrollment({
        studentClerkId: newUser.clerkId,
        goal,
        code,
        lessonsCount,
      });

      // 3. Mark enrollment paid immediately if paid at reception
      if (isPaidAtDesk && !enrollment.isPaid) {
        enrollment = await studentService.payForEnrollment(enrollment._id);
      }

      // 4. Hand off the enriched student object back to StudentSearchHUD
      onSuccess({
        _id: newUser._id,
        clerkId: newUser.clerkId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        enrollment,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        "Failed to register walk-in student. Check details and try again.";
      setError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="space-y-3 animate-in fade-in duration-150"
    >
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Row 1: Student Identity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name (e.g. Sipho Ndlovu)"
          className="h-10 px-3.5 rounded-xl border border-zinc-200 bg-zinc-50/70 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 focus:bg-white"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address (for student login)"
          className="h-10 px-3.5 rounded-xl border border-zinc-200 bg-zinc-50/70 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 focus:bg-white"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="WhatsApp / Phone (optional)"
          className="h-10 px-3.5 rounded-xl border border-zinc-200 bg-zinc-50/70 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 focus:bg-white"
        />
      </div>

      {/* Row 2: Course Selection, Payment Toggle & Submit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center">
        <div className="lg:col-span-3">
          <select
            value={goal}
            onChange={(e) =>
              handleGoalChange(e.target.value as "learners" | "drivers")
            }
            className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50/70 text-xs font-bold text-zinc-800 focus:outline-none focus:border-orange-500"
          >
            <option value="drivers">Driver&apos;s Licence</option>
            <option value="learners">Learner&apos;s Licence</option>
          </select>
        </div>

        <div className="lg:col-span-3">
          <select
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50/70 text-xs font-bold text-zinc-800 focus:outline-none focus:border-orange-500"
          >
            {goal === "learners" ? (
              <>
                <option value="Code 1 (Learners)">Code 1 — Motorcycles</option>
                <option value="Code 2 (Learners)">Code 2 — Light Motor</option>
                <option value="Code 3 (Learners)">Code 3 — Heavy Motor</option>
              </>
            ) : (
              <>
                <option value="Code 8">Code 8 — Light Motor</option>
                <option value="Code 10">Code 10 — Heavy Motor</option>
                <option value="Code 14">Code 14 — Extra-Heavy</option>
              </>
            )}
          </select>
        </div>

        <div className="lg:col-span-2">
          <select
            value={lessonsCount}
            onChange={(e) => setLessonsCount(Number(e.target.value))}
            className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50/70 text-xs font-bold text-zinc-800 focus:outline-none focus:border-orange-500"
          >
            <option value={5}>5 Lessons</option>
            <option value={10}>10 Lessons</option>
            <option value={20}>20 Lessons</option>
          </select>
        </div>

        <div className="lg:col-span-2">
          <button
            type="button"
            onClick={() => setIsPaidAtDesk(!isPaidAtDesk)}
            className={`w-full h-10 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isPaidAtDesk
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 bg-zinc-50 text-zinc-500"
            }`}
          >
            <span
              className={`h-4 w-4 rounded flex items-center justify-center ${
                isPaidAtDesk
                  ? "bg-emerald-600 text-white"
                  : "border border-zinc-300 bg-white"
              }`}
            >
              {isPaidAtDesk && <Check className="h-3 w-3" />}
            </span>
            <span>Paid at Desk</span>
          </button>
        </div>

        <div className="lg:col-span-2">
          <button
            type="submit"
            disabled={isCreating || !name.trim() || !email.trim()}
            className="w-full h-10 inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 shadow-sm active:scale-95 transition-all text-xs cursor-pointer disabled:opacity-40 whitespace-nowrap"
          >
            {isCreating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <UserCheck className="h-3.5 w-3.5" />
            )}
            <span>Save & Select</span>
          </button>
        </div>
      </div>
    </form>
  );
};
