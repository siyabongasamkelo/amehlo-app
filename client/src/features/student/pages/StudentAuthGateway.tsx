import React, { useState, useEffect } from "react";
import { SignUp, SignIn, useUser } from "@clerk/clerk-react";
import { ShieldCheck, Car, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { useStudent } from "../context/StudentContext";

export const StudentAuthGateway: React.FC = () => {
  const [isSignUpView, setIsSignUpView] = useState<boolean>(true);
  const [phone, setPhone] = useState<string>(() => {
    return localStorage.getItem("amehlo_pending_student_phone") || "";
  });

  const { isSignedIn } = useUser();
  const { dbUser } = useApp();
  const { syncStudentAccount, isSyncingStudent } = useStudent();

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    localStorage.setItem("amehlo_pending_student_phone", val);
  };

  // Automatically sync student profile to MongoDB once Clerk verifies sign-up/sign-in
  useEffect(() => {
    if (isSignedIn && !dbUser && !isSyncingStudent) {
      const savedPhone =
        localStorage.getItem("amehlo_pending_student_phone") || phone;
      syncStudentAccount(savedPhone).then(() => {
        localStorage.removeItem("amehlo_pending_student_phone");
      });
    }
  }, [isSignedIn, dbUser, isSyncingStudent]);

  if (isSyncingStudent) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-sans">
        <Loader2 className="h-7 w-7 animate-spin text-orange-600 mb-2" />
        <p className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
          Setting up your Student Driver Profile...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center p-4 font-sans antialiased text-zinc-800">
      <div className="w-full max-w-md space-y-6 bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-xl">
        {/* STUDENT PORTAL HEADER */}
        <div className="text-center space-y-1 relative select-none">
          <div className="h-10 w-10 bg-orange-600 text-white rounded-xl flex items-center justify-center mx-auto mb-2 font-black text-lg shadow-sm">
            <Car className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-zinc-900">
            {isSignUpView ? "Student Driver Registration" : "Student Sign In"}
          </h2>
          <p className="text-xs text-zinc-400 font-medium">
            {isSignUpView
              ? "Register your student account to join branch queues and track driving lessons."
              : "Sign in to access your student driving profile."}
          </p>
        </div>

        {/* PHONE INPUT FOR WHATSAPP QUEUE ALERTS */}
        {isSignUpView && (
          <div className="space-y-1.5 bg-zinc-50 border border-zinc-200 rounded-xl p-3.5">
            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">
              WhatsApp / Contact Number (Recommended)
            </label>
            <input
              type="tel"
              placeholder="e.g., 082 555 1234"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-medium focus:outline-none focus:border-orange-500"
            />
          </div>
        )}

        {/* CLERK AUTH BOX */}
        <div className="flex justify-center pt-2">
          {isSignUpView ? (
            <SignUp
              routing="hash"
              signInUrl="/student/auth"
              forceRedirectUrl="/student/auth"
            />
          ) : (
            <SignIn
              routing="hash"
              signUpUrl="/student/auth"
              forceRedirectUrl="/student/auth"
            />
          )}
        </div>

        {/* POPIA DISCLAIMER */}
        <div className="flex items-start gap-2 bg-zinc-50 border border-zinc-100 p-3 rounded-xl justify-center">
          <ShieldCheck className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-zinc-400 font-medium leading-normal max-w-[260px]">
            By continuing, you agree to our processing terms under the{" "}
            <Link
              to="/terms"
              className="text-orange-600 underline font-bold hover:text-orange-700"
            >
              POPIA Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* TOGGLE VIEW */}
        <div className="text-center pt-4 border-t border-zinc-100 select-none">
          <button
            type="button"
            onClick={() => setIsSignUpView(!isSignUpView)}
            className="text-xs font-bold text-zinc-500 hover:text-orange-600 transition-colors cursor-pointer"
          >
            {isSignUpView
              ? "Already have a student account? Sign In"
              : "New student driver? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
};
