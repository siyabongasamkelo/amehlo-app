import React, { useState, useEffect } from "react";
import { Search, CheckCircle2, X, Loader2 } from "lucide-react";
import { studentService } from "../../student/services/studentService";
import type { ISearchedStudent } from "../../student/services/studentService";

interface StudentSearchBoxProps {
  companyId?: string | null;
  selectedStudent: ISearchedStudent | null;
  onSelectStudent: (student: ISearchedStudent) => void;
  onClearStudent: () => void;
  onClearError: () => void;
}

export const StudentSearchBox: React.FC<StudentSearchBoxProps> = ({
  companyId,
  selectedStudent,
  onSelectStudent,
  onClearStudent,
  onClearError,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ISearchedStudent[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!companyId || selectedStudent) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await studentService.searchCompanyStudents(
          companyId,
          searchTerm,
        );
        setSearchResults(results);
      } catch (err) {
        console.error("Student search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, companyId, selectedStudent]);

  if (selectedStudent) {
    return (
      <div className="h-10 flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 transition-all">
        <div className="flex items-center gap-2 min-w-0">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold text-zinc-900 truncate">
            {selectedStudent.name}
          </span>
          {selectedStudent.enrollment && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800 text-[10px] font-bold shrink-0">
              {selectedStudent.enrollment.code} •{" "}
              {selectedStudent.enrollment.lessonsRemaining} left
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            onClearStudent();
            setSearchTerm("");
            onClearError();
          }}
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-white transition-colors cursor-pointer shrink-0"
          title="Change student"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="h-3.5 w-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        placeholder="Search student by name, phone, or email..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          onClearError();
        }}
        className="w-full h-10 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100/60 focus:bg-white pl-9 pr-9 text-xs font-semibold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-orange-500 transition-all"
      />
      {isSearching && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
      )}

      {/* FLOATING SEARCH DROPDOWN (Never pushes page layout down) */}
      {searchTerm.trim().length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 rounded-xl border border-zinc-200 bg-white shadow-xl max-h-56 overflow-y-auto divide-y divide-zinc-100 z-40 animate-in fade-in slide-in-from-top-1 duration-150">
          {!isSearching && searchResults.length === 0 ? (
            <div className="p-3.5 text-xs text-zinc-400 text-center">
              No registered students found matching "{searchTerm}".
            </div>
          ) : (
            searchResults.map((student) => {
              const hasLessons =
                student.enrollment?.isPaid &&
                (student.enrollment?.lessonsRemaining ?? 0) > 0;

              return (
                <button
                  key={student._id}
                  type="button"
                  onClick={() => {
                    onSelectStudent(student);
                    setSearchResults([]);
                    onClearError();
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-orange-50/60 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-900 truncate">
                      {student.name}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono truncate">
                      {student.phone || student.email}
                    </div>
                  </div>

                  {hasLessons ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold shrink-0">
                      {student.enrollment?.lessonsRemaining} left
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold shrink-0">
                      {student.enrollment
                        ? student.enrollment.isPaid
                          ? "0 lessons"
                          : "Unpaid"
                        : "No Bundle"}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
