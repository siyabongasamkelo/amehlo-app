import React from "react";

interface NavbarProps {
  customBrandName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  customBrandName = "AmehloQueue",
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-zinc-900 select-none">
          <div className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-orange-600/20">
            {customBrandName.charAt(0).toUpperCase()}
          </div>
          {customBrandName === "AmehloQueue" ? (
            <>
              Amehlo<span className="text-orange-600">Queue</span>
            </>
          ) : (
            <span className="text-zinc-900 tracking-tight font-black">
              {customBrandName}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[10px] px-2.5 py-1 bg-emerald-50 border border-emerald-200 font-bold uppercase tracking-wider text-emerald-700 rounded-full">
          Terminal Connected
        </span>
      </div>
    </header>
  );
};
