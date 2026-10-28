import React, { useState, useRef } from "react";
import { Camera, ShieldCheck } from "lucide-react";

interface BiometricCaptureProps {
  capturedSelfie: string | null;
  setCapturedSelfie: (imgData: string | null) => void;
}

export const BiometricCapture: React.FC<BiometricCaptureProps> = ({
  capturedSelfie,
  setCapturedSelfie,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize hardware desk camera stream
  const startDesktopWebcam = async () => {
    try {
      setCapturedSelfie(null);
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera accessory connection blocked:", err);
      alert(
        "Could not access desk webcam. Verify USB configurations or local site permissions.",
      );
      setCameraActive(false);
    }
  };

  // Capture the current frame and downsample it to base64
  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = 300;
        canvas.height = 300;
        context.drawImage(video, 0, 0, 300, 300);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedSelfie(dataUrl);
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

  // Cleanup feed tracking instantly if the user backs away
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-4 flex flex-col items-center justify-center py-2 animate-in fade-in slide-in-from-right-4 duration-200">
      <div className="w-full max-w-[240px] aspect-square bg-zinc-100 rounded-2xl border-2 border-zinc-200 overflow-hidden relative flex items-center justify-center shadow-inner">
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
            alt="Biometric Baseline Portrait"
            className="h-full w-full object-cover"
          />
        )}
        {!cameraActive && !capturedSelfie && (
          <div className="text-center p-4 text-zinc-400 space-y-1">
            <Camera className="h-6 w-6 mx-auto text-zinc-300 animate-pulse" />
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Webcam Peripheral Inactive
            </p>
          </div>
        )}
        {capturedSelfie && (
          <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
            <ShieldCheck className="h-3 w-3" /> Face Locked
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!cameraActive ? (
          <button
            type="button"
            onClick={startDesktopWebcam}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs shadow-sm cursor-pointer transition-colors"
          >
            <Camera className="h-3.5 w-3.5" />
            {capturedSelfie
              ? "Retake Identity Snapshot"
              : "Turn Desk Camera On"}
          </button>
        ) : (
          <button
            type="button"
            onClick={captureSnapshot}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
          >
            Capture & Encode Profile
          </button>
        )}

        {cameraActive && (
          <button
            type="button"
            onClick={stopDesktopWebcam}
            className="px-3 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-xl text-xs font-semibold text-zinc-500 cursor-pointer"
          >
            Cancel Cam
          </button>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
