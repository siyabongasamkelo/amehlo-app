import React, { useState } from "react";
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  QrCode,
  CreditCard,
  Loader2,
} from "lucide-react";

export interface ICourseWallet {
  goal: string;
  code: string;
  isPaid: boolean;
  totalLessons: number;
  lessonsSpent: number;
  lessonsRemaining: number;
}

interface CourseWalletCardProps {
  wallet: ICourseWallet;
  onJoinQueue: () => void;
  onPayNow?: () => Promise<void>;
}

export const CourseWalletCard: React.FC<CourseWalletCardProps> = ({
  wallet,
  onJoinQueue,
  onPayNow,
}) => {
  const [isPaying, setIsPaying] = useState(false);

  const canJoinQueue = wallet.isPaid && wallet.lessonsRemaining > 0;
  const progressPercent =
    wallet.totalLessons > 0
      ? Math.round((wallet.lessonsSpent / wallet.totalLessons) * 100)
      : 0;

  const handleTestPayment = async () => {
    if (!onPayNow) return;
    setIsPaying(true);
    try {
      await onPayNow();
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-5">
      {/* COURSE HEADER & PAYMENT BADGE */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {wallet.goal}
            </span>
            <h2 className="text-lg font-black text-zinc-900 tracking-tight leading-tight">
              {wallet.code}
            </h2>
          </div>
        </div>

        {wallet.isPaid ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            <CheckCircle2 className="h-3 w-3" /> Paid & Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
            <AlertTriangle className="h-3 w-3" /> Payment Pending
          </span>
        )}
      </div>

      {/* LESSON COUNTERS GRID */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Remaining
          </span>
          <span className="text-2xl font-black text-orange-600 mt-0.5 block">
            {wallet.lessonsRemaining}
          </span>
        </div>

        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Completed
          </span>
          <span className="text-2xl font-black text-zinc-900 mt-0.5 block">
            {wallet.lessonsSpent}
          </span>
        </div>

        <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-3 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            Total Bundle
          </span>
          <span className="text-2xl font-black text-zinc-500 mt-0.5 block">
            {wallet.totalLessons}
          </span>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold text-zinc-500">
          <span>Course Progress</span>
          <span>{progressPercent}% Completed</span>
        </div>
        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* GATEKEEPER ACTION BUTTON */}
      {canJoinQueue ? (
        <button
          type="button"
          onClick={onJoinQueue}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-11 text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <QrCode className="h-4 w-4 text-orange-400" />
          <span>Join Instructor Queue</span>
        </button>
      ) : (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
            <Lock className="h-4 w-4 shrink-0" />
            <span>
              {!wallet.isPaid
                ? "Queue Locked: Payment Required"
                : "Queue Locked: 0 Lessons Remaining"}
            </span>
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            {!wallet.isPaid
              ? "Complete your payment below to unlock your lessons and join the instructor queue."
              : "You have used all lessons in your current package. Purchase a top-up bundle to book more sessions."}
          </p>

          {!wallet.isPaid && (
            <button
              type="button"
              disabled={isPaying}
              onClick={handleTestPayment}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold h-10 text-xs shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isPaying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  <span>Pay Now & Unlock (Test Mode)</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
