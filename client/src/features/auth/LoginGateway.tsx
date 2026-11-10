import React, { useState } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export const LoginGateway: React.FC = () => {
  const [isSignInView, setIsSignInView] = useState<boolean>(true);
  // const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center p-4 font-sans antialiased text-zinc-800">
      <div className="w-full max-w-md space-y-6 bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-xl">
        {/* TOP BRAND BRANDING HEADER */}
        <div className="text-center space-y-1 relative select-none">
          <div className="h-10 w-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center mx-auto mb-2 font-black text-lg shadow-sm">
            A
          </div>
          <h2 className="text-xl font-black tracking-tight text-zinc-900">
            {isSignInView ? "Welcome Back" : "Create Master Hub"}
          </h2>
          <p className="text-xs text-zinc-400 font-medium">
            {isSignInView
              ? "Access your live sequential priority management engine."
              : "Register your corporate business workspace node."}
          </p>
        </div>

        {/* CLERK COMPONENT INTERFACE DISPLAY TRACK */}
        <div className="flex justify-center pt-2">
          {isSignInView ? (
            <SignIn
              routing="hash"
              signUpUrl="/login"
              forceRedirectUrl="/dashboard"
            />
          ) : (
            <SignUp
              routing="hash"
              signInUrl="/login"
              forceRedirectUrl="/create-company"
            />
          )}
        </div>

        {/* POPIA LEGAL DISCLAIMER ANCHOR PANEL */}
        <div className="flex items-start gap-2 bg-zinc-50 border border-zinc-100 p-3 rounded-xl justify-center">
          <ShieldCheck className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-zinc-400 font-medium leading-normal max-w-[260px]">
            By continuing, you agree to our processing terms. We guard your
            operational metadata under the{" "}
            <Link
              to="/terms"
              className="text-orange-600 underline font-bold hover:text-orange-700"
            >
              POPIA Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* TOGGLE STATE ACTIONS SWITCH BUTTON */}
        <div className="text-center pt-4 border-t border-zinc-100 select-none">
          <button
            type="button"
            onClick={() => setIsSignInView(!isSignInView)}
            className="text-xs font-bold text-zinc-500 hover:text-orange-600 transition-colors cursor-pointer"
          >
            {isSignInView
              ? "Don't have a workspace? Create an account"
              : "Already have a management hub? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};
