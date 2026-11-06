import React, { useState, useEffect } from "react";
import { SignUp, SignIn, useUser } from "@clerk/clerk-react";
import { useApp } from "../../context/AppContext";

export const RegisterGateway: React.FC = () => {
  const [isSignUpView, setIsSignUpView] = useState<boolean>(true);
  const [inviteCode, setInviteCode] = useState<string>("");
  const { isSignedIn } = useUser();
  const { syncAndHydrateProfile } = useApp();

  // If clerk finishes sign up forms, instantly trigger our backend atomic profile layout builder
  useEffect(() => {
    if (isSignedIn) {
      syncAndHydrateProfile(inviteCode);
    }
  }, [isSignedIn, syncAndHydrateProfile, inviteCode]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md space-y-6 bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-zinc-900">
            Amehlo Terminal
          </h2>
          <p className="text-xs text-zinc-400 font-medium">
            Scan-and-wait line management.
          </p>
        </div>

        {isSignUpView && (
          <div className="space-y-1.5 bg-orange-50/50 border border-orange-100 rounded-xl p-3.5">
            <label className="text-[10px] font-bold text-orange-700 uppercase tracking-wider block">
              Staff Token Key (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., AMHL-EMP-92"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-mono uppercase focus:outline-none focus:border-orange-500"
            />
          </div>
        )}

        <div className="flex justify-center pt-2">
          {isSignUpView ? (
            <SignUp
              routing="hash"
              signInUrl="/register"
              forceRedirectUrl="/create-company"
            />
          ) : (
            <SignIn routing="hash" signUpUrl="/register" />
          )}
        </div>

        <div className="text-center pt-4 border-t border-zinc-100">
          <button
            onClick={() => setIsSignUpView(!isSignUpView)}
            className="text-xs font-bold text-zinc-500 hover:text-orange-600 transition-colors cursor-pointer"
          >
            {isSignUpView
              ? "Have an account? Sign In"
              : "Need a brand-new hub? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};
