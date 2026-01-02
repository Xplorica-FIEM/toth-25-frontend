// components/scan.jsx
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { BrowserQRCodeReader } from "@zxing/browser";
import { X, Sparkles, Globe, ShieldAlert, Flashlight, FlashlightOff, Smartphone, Monitor } from "lucide-react"; 
import { scanQR } from "@/utils/api";

export default function Scan({ onClose }) {
  const router = useRouter();
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const hasScannedRef = useRef(false);

  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing...");
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoStreamRef = useRef(null);

  useEffect(() => {
    // Detect if mobile device
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    
    // Initialize Camera
    readerRef.current = new BrowserQRCodeReader();
    const timeout = setTimeout(() => {
      startScanning();
    }, 300);

    return () => {
      clearTimeout(timeout);
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!videoRef.current || !readerRef.current) return;

    try {
      setError("");
      setIsScanning(true);

      const devices = await BrowserQRCodeReader.listVideoInputDevices();

      if (!devices.length) {
        setError("No camera found");
        setIsScanning(false);
        return;
      }

      // Select camera based on device type
      let selectedCamera;
      if (isMobile) {
        // Mobile: prefer back camera
        selectedCamera = devices.find((d) => d.label.toLowerCase().includes("back")) || devices[0];
      } else {
        // Desktop: prefer any external camera, then front camera
        selectedCamera = devices.find((d) => !d.label.toLowerCase().includes("integrated")) || devices[0];
      }

      // Enhanced video constraints
      const videoConstraints = {
        deviceId: selectedCamera.deviceId,
        facingMode: isMobile ? "environment" : "user",
        width: { min: 640, ideal: 1920, max: 1920 },
        height: { min: 480, ideal: 1080, max: 1080 },
        aspectRatio: { ideal: 16/9 },
        frameRate: { ideal: 30 },
        focusMode: isMobile ? "continuous" : "auto",
      };

      await readerRef.current.decodeFromVideoDevice(
        selectedCamera.deviceId,
        videoRef.current,
        (result, err) => {
          if (result && !hasScannedRef.current) {
            hasScannedRef.current = true;
            const text = result.getText();
            setIsScanning(false);
            stopScanning();
            handleQRScan(text);
          }
          if (err && err.name !== "NotFoundException") {
            console.error(err);
          }
        }
      );

      // Store video stream for torch control
      if (videoRef.current && videoRef.current.srcObject) {
        videoStreamRef.current = videoRef.current.srcObject;
      }
    } catch (e) {
      console.error(e);
      setError("Camera permission denied");
      setIsScanning(false);
    }
  };

  // function to check if it is a meme link
  const isExternalUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const handleQRScan = async (qrData) => {
    setError("");
    setLoading(true);

    try {
      // Check for external URLs (easter eggs/memes)
      if (isExternalUrl(qrData)) {
        setLoadingMessage("Redirecting to external sector...");
        window.location.href = qrData;
        return;
      }

      // Send encrypted qrData to backend for decryption and verification
      setLoadingMessage("Verifying QR code...");

      const response = await scanQR(qrData);

      if (!response.ok) {
        throw new Error(response.data.error || response.data.message || "Scan failed");
      }

      // Get riddle data from response
      const riddleData = response.data.riddle;
      const isFirstScan = riddleData?.isFirstScan;
      const riddleId = riddleData?.id;

      if (!riddleId) {
        throw new Error("Invalid response from server");
      }

      // Show different loading message based on whether it's a duplicate scan
      if (!isFirstScan) {
        setLoadingMessage("Already unlocked! Redirecting to riddle...");
      } else {
        setLoadingMessage("New riddle unlocked! +100 points");
      }

      // Brief delay to show the message
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to view riddle
      await router.push(
        {
          pathname: '/viewriddles',
          query: { id: riddleId }
        },
        '/viewriddles'
      );
      onClose();

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const stopScanning = () => {
    try {
      readerRef.current?.reset();
    } catch {}
  };

  const toggleTorch = async () => {
    if (!videoStreamRef.current) return;
    
    try {
      const track = videoStreamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !torchEnabled }]
        });
        setTorchEnabled(!torchEnabled);
      } else {
        setError("Flash not supported on this device");
        setTimeout(() => setError(""), 2000);
      }
    } catch (err) {
      console.error("Torch error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-amber-400 transition-colors"
        >
          <X className="size-8" />
        </button>

        <div className="bg-linear-to-br from-amber-900/90 to-stone-900/90 rounded-2xl p-6 border border-amber-700/50">
          <h2 className="text-xl text-amber-100 text-center mb-4 flex items-center justify-center gap-2">
            <Sparkles className="size-5" />
            QR Code Scanner
          </h2>

          {!loading && (
            <div className="bg-black rounded-xl overflow-hidden mb-4 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
              
              {/* Scanning frame with corners */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-64 h-64 md:w-80 md:h-80">
                  {/* Corner decorations */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-500"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-500"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-500"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-500"></div>
                  
                  {/* Animated scanning line */}
                  {isScanning && (
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-scan-line shadow-[0_0_10px_rgba(251,191,36,0.8)]"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Instructions overlay */}
              <div className="absolute top-4 left-0 right-0 text-center">
                <div className="inline-flex items-center gap-2 bg-black/80 px-4 py-2 rounded-lg backdrop-blur-sm border border-amber-500/30">
                  {isMobile ? <Smartphone className="size-4 text-amber-400" /> : <Monitor className="size-4 text-amber-400" />}
                  <p className="text-amber-300 text-sm font-medium">Hold QR code steady within frame</p>
                </div>
              </div>
              
              {/* Torch button for mobile */}
              {isMobile && (
                <button
                  onClick={toggleTorch}
                  className="absolute bottom-4 right-4 p-3 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full border border-amber-500/30 transition-all z-10"
                >
                  {torchEnabled ? (
                    <Flashlight className="size-5 text-amber-400" />
                  ) : (
                    <FlashlightOff className="size-5 text-amber-300" />
                  )}
                </button>
              )}
              
              {/* Tips */}
              <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-2 rounded-lg backdrop-blur-sm border border-amber-500/20">
                <p className="text-amber-400/70 text-xs">
                  {isMobile ? "💡 Use good lighting" : "💡 Move QR closer to camera"}
                </p>
              </div>
              
              <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-amber-300 text-sm font-semibold bg-black/70 px-4 py-2 rounded-lg backdrop-blur-sm">
                {isScanning ? "Scanning..." : "Ready to scan"}
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-black rounded-xl overflow-hidden mb-4 h-[300px] flex items-center justify-center">
              <div className="text-center">
                {loadingMessage.includes("external") ? (
                  <Globe className="animate-pulse size-12 text-blue-400 mx-auto mb-4" />
                ) : (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
                )}
                <p className={loadingMessage.includes("external") ? "text-blue-300" : "text-amber-200"}>
                  {loadingMessage}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-900/50 text-red-200 rounded-lg text-center mb-4 border border-red-500/30 flex items-center justify-center gap-2">
              <ShieldAlert className="size-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-stone-700 hover:bg-stone-600 text-white rounded-xl transition-colors"
            >
              Abort
            </button>

            {!loading && (
              <button
                onClick={() => {
                  hasScannedRef.current = false;
                  startScanning();
                }}
                disabled={isScanning}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-900 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
              >
                {isScanning ? "Scanning..." : "Retry Scan"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}