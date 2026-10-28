import React, { useState, useRef } from "react";
import {
  X,
  Camera,
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Layers,
} from "lucide-react";
import type { MasterProfile } from "../../types/queue";

interface RegisterStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterComplete: (newProfile: MasterProfile) => void;
  currentBranch: string;
  drivingSchoolName: string;
}

export const RegisterStudentModal: React.FC<RegisterStudentModalProps> = ({
  isOpen,
  onClose,
  onRegisterComplete,
  currentBranch,
  drivingSchoolName,
}) => {
  // Step Workflow Tracker: 1 = Personal Details, 2 = License Packages, 3 = Biometrics Check
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Personal Details States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappNo, setWhatsappNo] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");

  // Step 2: Course & Financial States
  const [courseCode, setCourseCode] = useState("Code 8");
  const [lessonsAllocated, setLessonsAllocated] = useState<number>(10);
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Pending">(
    "Paid",
  );
  const [preferredInstructor, setPreferredInstructor] =
    useState("Any Available");

  // Step 3: Biometric Camera States
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  if (!isOpen) return null;

  // Webcam hardware controllers
  const startDesktopWebcam = async () => {
    try {
      setCapturedSelfie(null);
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera connection blocked:", err);
      alert("Could not access camera peripheral.");
      setCameraActive(false);
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = 300;
        canvas.height = 300;
        context.drawImage(video, 0, 0, 300, 300);
        setCapturedSelfie(canvas.toDataURL("image/jpeg"));
        stopDesktopWebcam();
      }
    }
  };

  const stopDesktopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleCloseCleanup = () => {
    stopDesktopWebcam();
    onClose();
    setCurrentStep(1);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capturedSelfie) return;

    const compiledProfile: MasterProfile = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email:
        email.trim() ||
        `${name.toLowerCase().replace(/\s+/g, "")}@amehloapp-system.com`,
      phone: phone.trim(),
      whatsappNo: whatsappNo.trim() || phone.trim(),
      gender,
      drivingSchool: drivingSchoolName,
      branch: currentBranch,
      masterSelfieUrl: capturedSelfie,
      lessonsAvailable: Number(lessonsAllocated),
      paymentStatus,
      overallScore: 100,
      defaultCourseCode: courseCode,
      preferredInstructorDefault:
        preferredInstructor === "Any Available"
          ? undefined
          : preferredInstructor,
    };

    onRegisterComplete(compiledProfile);
    handleCloseCleanup();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header Block */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-zinc-900 tracking-tight">
              New Student Enrollment
            </h3>
            <p className="text-xs text-zinc-500">
              Back-office concierge identity registry wizard.
            </p>
          </div>
          <button
            onClick={handleCloseCleanup}
            className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-200 grid grid-cols-3 gap-2 text-center text-xs font-bold shrink-0">
          <div
            className={`pb-1 border-b-2 ${currentStep === 1 ? "border-orange-600 text-orange-600" : "border-transparent text-zinc-400"}`}
          >
            1. Personal Data
          </div>
          <div
            className={`pb-1 border-b-2 ${currentStep === 2 ? "border-orange-600 text-orange-600" : "border-transparent text-zinc-400"}`}
          >
            2. License Class
          </div>
          <div
            className={`pb-1 border-b-2 ${currentStep === 3 ? "border-orange-600 text-orange-600" : "border-transparent text-zinc-400"}`}
          >
            3. AI Biometrics
          </div>
        </div>

        {/* Form Body Canvas Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: PERSONAL DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-zinc-400" /> Full Legal Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Siphesihle Dlamini"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-zinc-400" /> Email Address
                  (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. sphiwe@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-zinc-400" /> Mobile
                    Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 082 555 1234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-zinc-400" /> WhatsApp
                    Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Leave blank to copy mobile"
                    value={whatsappNo}
                    onChange={(e) => setWhatsappNo(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">
                  Gender Specification
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Male", "Female", "Other"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${gender === g ? "bg-zinc-900 border-zinc-900 text-white shadow-sm" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* STEP 2: COURSE & LICENSE LOGISTICS */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" /> Branch
                    Origin
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentBranch}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-100 px-3.5 py-2.5 text-sm text-zinc-500 font-semibold focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-zinc-400" /> Target
                    Licensing Class
                  </label>
                  <select
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-orange-500 cursor-pointer"
                  >
                    <option value="Code 8">Code 8 (Light Motor Vehicle)</option>
                    <option value="Code 10">
                      Code 10 (Heavy Motor Vehicle)
                    </option>
                    <option value="Code 14">
                      Code 14 (Heavy Articulated Rig)
                    </option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">
                    Initial Lessons Purchased
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={lessonsAllocated}
                    onChange={(e) =>
                      setLessonsAllocated(Math.max(0, Number(e.target.value)))
                    }
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">
                    Desk Invoice Clearance
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentStatus("Paid")}
                      className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${paymentStatus === "Paid" ? "bg-emerald-600 border-emerald-600 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-600"}`}
                    >
                      Paid
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentStatus("Pending")}
                      className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${paymentStatus === "Pending" ? "bg-red-600 border-red-600 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-600"}`}
                    >
                      Pending
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700">
                  Preferred Fleet Instructor
                </label>
                <select
                  value={preferredInstructor}
                  onChange={(e) => setPreferredInstructor(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="Any Available">
                    Any Available Fleet Driver
                  </option>
                  <option value="Instructor Jabu">Instructor Jabu</option>
                  <option value="Instructor Sipho">Instructor Sipho</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: WEBCAM SNAPSHOT CAPTURE */}
          {currentStep === 3 && (
            <div className="space-y-4 flex flex-col items-center justify-center py-2 animate-in fade-in duration-150">
              <div className="w-full max-w-[220px] aspect-square bg-zinc-100 rounded-2xl border-2 border-zinc-200 overflow-hidden relative flex items-center justify-center shadow-inner">
                {cameraActive && !capturedSelfie && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="h-full w-full object-cover -scale-x-100"
                  />
                )}
                {capturedSelfie && (
                  <img
                    src={capturedSelfie}
                    alt="Profile Baseline"
                    className="h-full w-full object-cover"
                  />
                )}
                {!cameraActive && !capturedSelfie && (
                  <div className="text-center p-4 text-zinc-400 space-y-1">
                    <Camera className="h-6 w-6 mx-auto text-zinc-300" />
                    <p className="text-[11px] font-bold uppercase tracking-wider">
                      Webcam Off
                    </p>
                  </div>
                )}
                {capturedSelfie && (
                  <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                    ✓ Face Locked
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={startDesktopWebcam}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs shadow-sm cursor-pointer"
                  >
                    Turn Camera On
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={captureSnapshot}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                  >
                    Take Snapshot
                  </button>
                )}
                {cameraActive && (
                  <button
                    type="button"
                    onClick={stopDesktopWebcam}
                    className="px-3 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-xl text-xs font-semibold text-zinc-500 cursor-pointer"
                  >
                    Stop
                  </button>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}
        </div>

        {/* Modal Controls Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-bold text-zinc-600 cursor-pointer hover:bg-zinc-50"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCloseCleanup}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-800 cursor-pointer"
            >
              Cancel
            </button>
            {currentStep < 3 ? (
              <button
                type="button"
                disabled={currentStep === 1 && !name.trim()}
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={!capturedSelfie}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-200 disabled:text-zinc-400 text-white text-xs font-black tracking-tight shadow-sm transition-colors cursor-pointer"
              >
                Register & Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
