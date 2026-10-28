import React from "react";
import { MapPin, Layers } from "lucide-react";

interface CourseConfigFormProps {
  branch: string;
  courseCode: string;
  setCourseCode: (val: string) => void;
  lessonsAllocated: number;
  setLessonsAllocated: (val: number) => void;
  paymentStatus: "Paid" | "Pending";
  setPaymentStatus: (val: "Paid" | "Pending") => void;
  preferredInstructor: string;
  setPreferredInstructor: (val: string) => void;
}

export const CourseConfigForm: React.FC<CourseConfigFormProps> = ({
  branch,
  courseCode,
  setCourseCode,
  lessonsAllocated,
  setLessonsAllocated,
  paymentStatus,
  setPaymentStatus,
  preferredInstructor,
  setPreferredInstructor,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Branch & Course Code Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-zinc-400" /> Operational Branch
            Origin
          </label>
          <input
            type="text"
            disabled
            value={branch}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-100 px-3.5 py-2.5 text-sm text-zinc-500 font-semibold focus:outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-zinc-400" /> Target Licensing
            Class
          </label>
          <select
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
          >
            <option value="Code 8">Code 8 (Light Motor Vehicle)</option>
            <option value="Code 10">Code 10 (Heavy Motor Vehicle)</option>
            <option value="Code 14">Code 14 (Heavy Articulated Rig)</option>
          </select>
        </div>
      </div>

      {/* Lesson Counting & Financial Clearance Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700">
            Initial Token Bundle Purchase
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={lessonsAllocated}
            onChange={(e) =>
              setLessonsAllocated(Math.max(0, Number(e.target.value)))
            }
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700">
            Desk Financial Invoice Clearance
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentStatus("Paid")}
              className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                paymentStatus === "Paid"
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/10"
                  : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              Paid / Cleared
            </button>
            <button
              type="button"
              onClick={() => setPaymentStatus("Pending")}
              className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                paymentStatus === "Pending"
                  ? "bg-red-600 border-red-600 text-white shadow-sm shadow-red-600/10"
                  : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              Pending Payment
            </button>
          </div>
        </div>
      </div>

      {/* Instructor Preference Dropdown Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700">
          Preferred Fleet Instructor Assignment
        </label>
        <select
          value={preferredInstructor}
          onChange={(e) => setPreferredInstructor(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
        >
          <option value="Any Available">Any Available Fleet Driver</option>
          <option value="Instructor Jabu">Instructor Jabu</option>
          <option value="Instructor Sipho">Instructor Sipho</option>
        </select>
      </div>
    </div>
  );
};
