import React, { useState } from "react";
import { Search, UserCheck, ShieldAlert, GraduationCap } from "lucide-react";
import type { MasterProfile } from "../queue/types/queue";

interface StudentRosterProps {
  masterProfiles: MasterProfile[];
  onOpenRegistration: () => void;
}

export const StudentRoster: React.FC<StudentRosterProps> = ({
  masterProfiles,
  onOpenRegistration,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = masterProfiles.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm),
  );

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Student Roster
          </h1>
          <p className="text-xs text-zinc-500">
            Manage enrolled drivers, lesson balances, and biometric profile
            clearance.
          </p>
        </div>
        <button
          onClick={onOpenRegistration}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-4 py-2.5 shadow-sm active:scale-98 transition-all text-xs cursor-pointer"
        >
          Add New Student
        </button>
      </div>

      {/* FILTER SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search roster by name or mobile number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors shadow-sm"
        />
      </div>

      {/* ROSTER TABLE CONTAINER */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="px-6 py-4">Student Profile</th>
                <th className="px-6 py-4">Branch & Course</th>
                <th className="px-6 py-4">Lesson Balance</th>
                <th className="px-6 py-4">Payment Status</th>
                <th className="px-6 py-4 text-right">Biometric Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-zinc-400"
                  >
                    No matching student profiles found in the registry.
                  </td>
                </tr>
              ) : (
                filtered.map((profile) => {
                  const isBlocked =
                    profile.lessonsAvailable === 0 ||
                    profile.paymentStatus === "Pending";
                  return (
                    <tr
                      key={profile.id}
                      className="hover:bg-zinc-50/50 transition-colors"
                    >
                      {/* Name & Selfie */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
                            {profile.masterSelfieUrl ? (
                              <img
                                src={profile.masterSelfieUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <GraduationCap className="h-5 w-5 text-zinc-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900">
                              {profile.name}
                            </div>
                            <div className="text-xs text-zinc-400">
                              {profile.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Course Data */}
                      <td className="px-6 py-4 whitespace-nowrap text-zinc-600 font-medium">
                        <div>{profile.defaultCourseCode}</div>
                        <div className="text-xs text-zinc-400">
                          {profile.branch}
                        </div>
                      </td>

                      {/* Balance Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                            profile.lessonsAvailable === 0
                              ? "bg-red-50 text-red-700"
                              : "bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          {profile.lessonsAvailable} Lessons Remaining
                        </span>
                      </td>

                      {/* Gate Locks Check */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                            profile.paymentStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {profile.paymentStatus}
                        </span>
                      </td>

                      {/* Security Verification Flag */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600 font-bold bg-red-50 border border-red-100 px-2.5 py-1 rounded-xl">
                            <ShieldAlert className="h-3.5 w-3.5" /> Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl">
                            <UserCheck className="h-3.5 w-3.5" /> Ready to Queue
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
