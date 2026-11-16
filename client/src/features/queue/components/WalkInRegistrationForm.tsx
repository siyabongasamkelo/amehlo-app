import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Loader2,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { studentService } from "../../student/services/studentService";
import type { ISearchedStudent } from "../../student/services/studentService";
import type { IServiceData } from "../../services/services/categoryService";

interface WalkInRegistrationFormProps {
  companyId?: string;
  branchId?: string;
  userRole?: "owner" | "worker" | "student";
  services: IServiceData[];
  onSuccess: (createdStudent: ISearchedStudent) => void;
  onInstructorCreated?: () => void;
}

export const WalkInRegistrationForm: React.FC<WalkInRegistrationFormProps> = ({
  companyId,
  branchId,
  userRole,
  services,
  onSuccess,
  onInstructorCreated,
}) => {
  const [registerRole, setRegisterRole] = useState<"student" | "worker">(
    "student",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [lessonsCount, setLessonsCount] = useState<number>(10);
  const [amountPaidStr, setAmountPaidStr] = useState<string>("");

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default to the first branch service & auto-fill its price when services load
  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      const first = services[0];
      setSelectedServiceId(first._id);
      setAmountPaidStr(String(first.price ?? 0));
    }
  }, [services, selectedServiceId]);

  const activeService = services.find((s) => s._id === selectedServiceId);
  const supposedPrice = activeService?.price ?? 0;
  const numericAmountPaid =
    amountPaidStr.trim() === "" ? 0 : Math.max(0, Number(amountPaidStr));
  const missingBalance = Math.max(0, supposedPrice - numericAmountPaid);

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const matched = services.find((s) => s._id === serviceId);
    if (matched) {
      setAmountPaidStr(String(matched.price ?? 0));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !name.trim() || !email.trim()) return;

    if (registerRole === "worker" && !branchId) {
      setError(
        "Please select an active branch before registering an instructor.",
      );
      return;
    }

    if (registerRole === "student" && !activeService) {
      setError("Please select a branch service / course first.");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // ➔ PATH A: REGISTER INSTRUCTOR
      if (registerRole === "worker") {
        await studentService.adminCreateWorker({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          companyId,
          branchId,
        });

        setName("");
        setEmail("");
        setPhone("");
        setIsCreating(false);
        onInstructorCreated?.();
        return;
      }

      // ➔ PATH B: REGISTER WALK-IN STUDENT WITH SERVICE PRICE & AMOUNT PAID
      const newUser = await studentService.adminCreateStudent({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        companyId,
        branchId,
      });

      const inferredGoal = activeService!.name.toLowerCase().includes("learner")
        ? "learners"
        : "drivers";

      const enrollment = await studentService.createEnrollment({
        studentClerkId: newUser.clerkId,
        serviceId: activeService!._id,
        goal: inferredGoal,
        code: activeService!.name,
        lessonsCount,
        supposedPrice,
        amountPaid: numericAmountPaid,
      });

      onSuccess({
        _id: newUser._id,
        clerkId: newUser.clerkId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        enrollment,
      });
    } catch (err: any) {
      console.error("Registration error details:", err);
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "Registration failed. Please verify the details and try again.";
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
      {/* Role Toggle (Student vs Instructor) */}
      {(userRole === "owner" || userRole === "worker") && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Account Type:
            </span>
            <div className="inline-flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setRegisterRole("student");
                  setError(null);
                }}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  registerRole === "student"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5 text-orange-600" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRegisterRole("worker");
                  setError(null);
                }}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  registerRole === "worker"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Instructor</span>
              </button>
            </div>
          </div>

          {/* Live Payment Status Pill for Students */}
          {registerRole === "student" && activeService && (
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <span className="text-zinc-500">
                Course Price:{" "}
                <strong className="text-zinc-900">
                  R{supposedPrice.toLocaleString()}
                </strong>
              </span>
              {missingBalance > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Missing: R{missingBalance.toLocaleString()}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Paid in Full
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Row 1: Identity Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={
            registerRole === "worker"
              ? "Instructor Full Name (e.g. Bheki Zulu)"
              : "Student Full Name (e.g. Sipho Ndlovu)"
          }
          className="h-10 px-3.5 rounded-xl border border-zinc-200 bg-zinc-50/70 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 focus:bg-white"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
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

      {/* Row 2: Instructor Submit OR Branch Service + Lessons + Amount Paid Box */}
      {registerRole === "worker" ? (
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isCreating || !name.trim() || !email.trim()}
            className="h-10 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 shadow-sm active:scale-95 transition-all text-xs cursor-pointer disabled:opacity-40 whitespace-nowrap"
          >
            {isCreating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <UserCheck className="h-3.5 w-3.5" />
            )}
            <span>Save Instructor to Branch</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center">
          {/* Branch Service Dropdown with Price */}
          <div className="lg:col-span-5">
            <select
              value={selectedServiceId}
              onChange={(e) => handleSelectService(e.target.value)}
              disabled={services.length === 0}
              className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50/70 text-xs font-bold text-zinc-800 focus:outline-none focus:border-orange-500"
            >
              {services.length === 0 ? (
                <option value="">No services configured for branch</option>
              ) : (
                services.map((srv) => (
                  <option key={srv._id} value={srv._id}>
                    {srv.name} — R{(srv.price ?? 0).toLocaleString()}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Lessons Count */}
          <div className="lg:col-span-2">
            <select
              value={lessonsCount}
              onChange={(e) => setLessonsCount(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50/70 text-xs font-bold text-zinc-800 focus:outline-none focus:border-orange-500"
            >
              <option value={1}>1 Lessons</option>
              <option value={5}>5 Lessons</option>
              <option value={10}>10 Lessons</option>
              <option value={20}>20 Lessons</option>
              <option value={50}>50 Lessons</option>
              <option value={60}>60 Lessons</option>
            </select>
          </div>

          {/* Actual Amount Paid Input (R) */}
          <div className="lg:col-span-3 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-zinc-400">
              Paid R
            </span>
            <input
              type="number"
              min="0"
              step="50"
              value={amountPaidStr}
              onChange={(e) => setAmountPaidStr(e.target.value)}
              placeholder="0"
              className="w-full h-10 pl-14 pr-3 rounded-xl border border-zinc-200 bg-zinc-50/70 text-xs font-black text-zinc-900 focus:outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>

          {/* Save & Select Button */}
          <div className="lg:col-span-2">
            <button
              type="submit"
              disabled={
                isCreating ||
                !name.trim() ||
                !email.trim() ||
                services.length === 0
              }
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
      )}
    </form>
  );
};
