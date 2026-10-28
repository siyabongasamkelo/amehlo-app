import React, { useState } from "react";
import { Search, ShieldAlert, CheckCircle2, User } from "lucide-react";
import type { MasterProfile } from "../types/queue";

interface StudentSearchHUDProps {
  masterProfiles: MasterProfile[];
  onInsertToQueue: (
    profile: MasterProfile,
    instructor: string,
    isPremium: boolean,
  ) => void;
}

export const StudentSearchHUD: React.FC<StudentSearchHUDProps> = ({
  masterProfiles,
  onInsertToQueue,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<MasterProfile | null>(
    null,
  );
  const [selectedInstructor, setSelectedInstructor] = useState("Any Available");
  const [isPremiumCheck, setIsPremiumCheck] = useState(false);

  // Filter profiles globally across branches
  const filteredProfiles =
    searchQuery.trim() === ""
      ? []
      : masterProfiles.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.phone.includes(searchQuery),
        );

  const handleSelect = (profile: MasterProfile) => {
    setSelectedProfile(profile);
    setSelectedInstructor(
      profile.preferredInstructorDefault || "Any Available",
    );
    setSearchQuery("");
  };

  const executeCheckIn = () => {
    if (
      !selectedProfile ||
      selectedProfile.lessonsAvailable === 0 ||
      selectedProfile.paymentStatus === "Pending"
    )
      return;
    onInsertToQueue(selectedProfile, selectedInstructor, isPremiumCheck);
    setSelectedProfile(null);
    setIsPremiumCheck(false);
  };

  const isFinancialGateLocked = selectedProfile
    ? selectedProfile.lessonsAvailable === 0 ||
      selectedProfile.paymentStatus === "Pending"
    : true;

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
          Desk Check-In Engine
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          Scan or search global user profiles to insert them into today's
          timeline.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Type student name or mobile number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors"
        />

        {/* Floating Intelligent Search Dropdown */}
        {filteredProfiles.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-40 divide-y divide-zinc-100">
            {filteredProfiles.map((profile) => {
              const isLocked =
                profile.lessonsAvailable === 0 ||
                profile.paymentStatus === "Pending";
              return (
                <button
                  key={profile.id}
                  onClick={() => handleSelect(profile)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden">
                      {profile.masterSelfieUrl ? (
                        <img
                          src={profile.masterSelfieUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-zinc-400" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-zinc-900">
                        {profile.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {profile.defaultCourseCode} • {profile.branch}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isLocked
                          ? "bg-red-50 text-red-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {profile.lessonsAvailable} Lessons left
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Active Verification Focus Panel */}
      {selectedProfile && (
        <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50 grid grid-cols-1 md:grid-cols-3 gap-4 items-center animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <img
              src={selectedProfile.masterSelfieUrl}
              alt="Master Portrait"
              className="h-14 w-14 rounded-xl object-cover border border-zinc-200 shrink-0"
            />
            <div>
              <h4 className="font-bold text-sm text-zinc-900">
                {selectedProfile.name}
              </h4>
              <p className="text-xs text-zinc-500">
                ID: {selectedProfile.id.slice(-6)} •{" "}
                {selectedProfile.defaultCourseCode}
              </p>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                WhatsApp: {selectedProfile.whatsappNo}
              </p>
            </div>
          </div>

          {/* Business Financial Integrity Gate */}
          <div className="p-3 rounded-xl bg-white border border-zinc-200 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Account Clearance
            </span>
            {isFinancialGateLocked ? (
              <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs mt-1">
                <ShieldAlert className="h-4 w-4 shrink-0" /> BLOCKED: NO CREDIT
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs mt-1">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> CLEARED (
                {selectedProfile.lessonsAvailable} Lessons Available)
              </div>
            )}
          </div>

          {/* Operational Config Selectors */}
          <div className="flex flex-col sm:flex-row gap-2 justify-end w-full md:col-span-1">
            <div className="flex-1">
              <select
                disabled={isFinancialGateLocked}
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                className="w-full text-xs rounded-lg border border-zinc-200 bg-white p-2 text-zinc-800 focus:outline-none"
              >
                <option value="Any Available">Any Available Instructor</option>
                <option value="Instructor Jabu">Instructor Jabu</option>
                <option value="Instructor Sipho">Instructor Sipho</option>
              </select>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="premiumCheck"
                  disabled={isFinancialGateLocked}
                  checked={isPremiumCheck}
                  onChange={(e) => setIsPremiumCheck(e.target.checked)}
                  className="h-3.5 w-3.5 rounded text-orange-600 border-zinc-300 focus:ring-orange-500"
                />
                <label
                  htmlFor="premiumCheck"
                  className="text-[11px] text-zinc-600 font-medium select-none"
                >
                  R100 Priority Bypass
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="px-3 py-1.5 border border-zinc-200 bg-white hover:bg-zinc-100 rounded-lg text-xs font-semibold text-zinc-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isFinancialGateLocked}
                onClick={executeCheckIn}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                Insert to Queue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
