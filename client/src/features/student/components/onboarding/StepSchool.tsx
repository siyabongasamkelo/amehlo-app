import React, { useEffect, useState } from "react";
import { Building2, Search, Loader2, CheckCircle2, MapPin } from "lucide-react";
import axios from "axios";
import { studentService } from "../../services/studentService";
import type { IDrivingSchoolOption } from "../../services/studentService";

const BASE_API_URL =
  import.meta.env.VITE_APP_ENV === "development"
    ? "http://localhost:5000/api"
    : "https://amehlo-app.onrender.com/api";

interface IBranchOption {
  _id: string;
  name: string;
  location?: string;
}

interface StepSchoolProps {
  selectedCompanyId: string;
  selectedBranchId: string;
  onSelect: (companyId: string, branchId: string) => void;
}

export const StepSchool: React.FC<StepSchoolProps> = ({
  selectedCompanyId,
  selectedBranchId,
  onSelect,
}) => {
  const [companies, setCompanies] = useState<IDrivingSchoolOption[]>([]);
  const [branches, setBranches] = useState<IBranchOption[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  const [pickedCompany, setPickedCompany] = useState(selectedCompanyId);
  const [pickedBranch, setPickedBranch] = useState(selectedBranchId);

  useEffect(() => {
    studentService
      .getAvailableCompanies()
      .then(setCompanies)
      .catch((err) => console.error("Failed loading driving schools:", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!pickedCompany) {
      setBranches([]);
      return;
    }
    setIsLoadingBranches(true);
    axios
      .get(`${BASE_API_URL}/branches/company/${pickedCompany}`)
      .then((res) => {
        const list: IBranchOption[] = res.data.branches || [];
        setBranches(list);
        if (list.length === 1) {
          setPickedBranch(list[0]._id);
        }
      })
      .catch(() => setBranches([]))
      .finally(() => setIsLoadingBranches(false));
  }, [pickedCompany]);

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase().trim()),
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl font-black tracking-tight text-zinc-900">
          Select your driving school
        </h2>
        <p className="text-xs text-zinc-500 font-medium">
          Link your student profile to your school so desk staff can check you
          in.
        </p>
      </div>

      <div className="relative">
        <Search className="h-4 w-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search driving school name..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-200 bg-zinc-50 text-xs font-medium focus:outline-none focus:border-orange-500"
        />
      </div>

      {isLoading ? (
        <div className="py-8 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-6 bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl text-xs text-zinc-400">
          No driving schools found.
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {filtered.map((school) => {
            const active = pickedCompany === school._id;
            return (
              <button
                key={school._id}
                type="button"
                onClick={() => {
                  setPickedCompany(school._id);
                  setPickedBranch("");
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  active
                    ? "border-orange-500 bg-orange-50/40 shadow-sm"
                    : "border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white border border-zinc-200 text-orange-600">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-zinc-900">
                    {school.name}
                  </span>
                </div>
                {active && (
                  <CheckCircle2 className="h-4 w-4 text-orange-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {pickedCompany && !isLoadingBranches && branches.length > 0 && (
        <div className="space-y-2 pt-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-orange-600" /> Home Branch
          </label>
          <div className="grid grid-cols-1 gap-2">
            {branches.map((branch) => {
              const active = pickedBranch === branch._id;
              return (
                <button
                  key={branch._id}
                  type="button"
                  onClick={() => setPickedBranch(branch._id)}
                  className={`text-left px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {branch.name}
                  {branch.location ? ` — ${branch.location}` : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={!pickedCompany || (branches.length > 0 && !pickedBranch)}
        onClick={() => onSelect(pickedCompany, pickedBranch)}
        className="w-full h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs cursor-pointer disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );
};
