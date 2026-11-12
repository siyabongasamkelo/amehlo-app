import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { StepGoal } from "../components/onboarding/StepGoal";
import type { GoalType } from "../components/onboarding/StepGoal";
import { StepCode } from "../components/onboarding/StepCode";
import { StepPackage } from "../components/onboarding/StepPackage";
import { useStudent } from "../context/StudentContext";
import { Navigate } from "react-router-dom";

export const StudentOnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { saveOnboardingEnrollment, enrollment, isLoadingEnrollment } =
    useStudent();

  const [step, setStep] = useState<number>(1);
  const [goal, setGoal] = useState<GoalType>(null);
  const [code, setCode] = useState<string>("");
  const [lessonsCount, setLessonsCount] = useState<number>(10);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleFinish = async () => {
    if (!goal || !code) return;
    setIsSaving(true);
    try {
      await saveOnboardingEnrollment(goal, code, lessonsCount);
      navigate("/student/portal");
    } catch (err) {
      console.error("Failed saving onboarding enrollment:", err);
      alert("Could not save your course selection. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingEnrollment) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
      </div>
    );
  }

  if (enrollment) {
    return <Navigate to="/student/portal" replace />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-sans antialiased text-zinc-900">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            <span>Step {step} of 3</span>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900 cursor-pointer"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
            )}
          </div>
          <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-600 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <StepGoal
            selectedGoal={goal}
            onSelect={(picked) => {
              setGoal(picked);
              setCode("");
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <StepCode
            goal={goal}
            selectedCode={code}
            onSelect={(picked) => {
              setCode(picked);
              setStep(3);
            }}
          />
        )}

        {step === 3 && (
          <StepPackage
            selectedCode={code}
            lessonsCount={lessonsCount}
            isSaving={isSaving}
            onSelectCount={setLessonsCount}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  );
};
