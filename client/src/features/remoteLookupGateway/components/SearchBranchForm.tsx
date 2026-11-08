import React from "react";
import { Phone, Search, Loader2 } from "lucide-react";

interface SearchBranchFormProps {
  query: string;
  setQuery: (val: string) => void;
  onSearch: (e: React.FormEvent) => void;
  isSearching: boolean;
}

export const SearchBranchForm: React.FC<SearchBranchFormProps> = ({
  query,
  setQuery,
  onSearch,
  isSearching,
}) => {
  return (
    <form onSubmit={onSearch} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-zinc-400" /> Enter Store Phone
          Number
        </label>
        <div className="relative flex items-center">
          <input
            type="tel"
            required
            placeholder="e.g. 035 111 2222"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 rounded-xl border border-zinc-200 bg-zinc-50 pl-4 pr-12 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute right-1.5 h-8 w-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 disabled:opacity-40 transition-all cursor-pointer"
          >
            {isSearching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
      <p className="text-[11px] text-zinc-400 text-center italic">
        Tip: Copy the branch number directly from Google Maps or their website.
      </p>
    </form>
  );
};
