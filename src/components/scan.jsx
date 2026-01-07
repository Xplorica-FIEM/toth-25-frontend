// components/scan.jsx
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { BrowserQRCodeReader } from "@zxing/browser";
import { X, Sparkles, Globe, ShieldAlert, Flashlight, FlashlightOff, Smartphone, Monitor, SwitchCamera } from "lucide-react"; 
import { scanQR } from "@/utils/api";

export default function Scan({ onClose }) {
  const router = useRouter();
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const hasScannedRef = useRef(false);

  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing...");
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const videoStreamRef = useRef(null);

  useEffect(() => {
    // Detect if mobile device
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    
    // Start immediately for better responsiveness
    startScanning();

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async (overrideIndex = null) => {
    // Create new reader instance every time to avoid stale data
    readerRef.current = new BrowserQRCodeReader();

    if (!videoRef.current || !readerRef.current) return;

    try {
      setError("");
      setIsScanning(true);

      const scanCallback = (result, err) => {
        if (result && !hasScannedRef.current) {
          hasScannedRef.current = true;
          const text = result.getText();
          // Don't stop scanning here, let handleQRScan manage state
          handleQRScan(text);
        }
      };

      // Fast initialization strategy:
      // 1. If we haven't listed cameras yet, just ask for the environment camera directly.
      //    This avoids the slow double-initialization of listing + checking capabilities.
      // 2. If we HAVE listed cameras (e.g. user is switching), pick the specific one.
      
      if (availableCameras.length > 0) {
        const activeIndex = overrideIndex !== null ? overrideIndex : currentCameraIndex;
        // Specific camera selection (Switching mode)
        const selectedCamera = availableCameras[activeIndex % availableCameras.length];
        
        controlsRef.current = await readerRef.current.decodeFromVideoDevice(
          selectedCamera.deviceId,
          videoRef.current,
          scanCallback
        );
      } else {
        // Initial Startup (Fast mode)
        // standard constraints to prefer back camera
        const constraints = { 
          video: { 
            facingMode: "environment" 
          } 
        };

        controlsRef.current = await readerRef.current.decodeFromConstraints(
          constraints,
          videoRef.current,
          scanCallback
        );

        // Populate camera list in background for switching later
        BrowserQRCodeReader.listVideoInputDevices().then(devices => {
          setAvailableCameras(devices);
          // Try to sync current index if possible, otherwise default to 0
          // This ensures if they click switch, it goes to the next one
        }).catch(console.error);
      }

      // Store video stream for torch control
      if (videoRef.current && videoRef.current.srcObject) {
        videoStreamRef.current = videoRef.current.srcObject;
      }
    } catch (e) {
      console.error("Camera error:", e);
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setError("Camera permission denied. Please allow camera access.");
      } else if (e.name === "NotFoundError") {
        setError("No camera found/allowed");
      } else {
        setError("Failed to start camera");
      }
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
    // Prevent overlapping checks
    if (loading) return; 

    setError("");
    setLoading(true);

    try {
      // Check for external URLs (easter eggs/memes)
      if (isExternalUrl(qrData)) {
        stopScanning(); // Stop camera before redirecting
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
      
      stopScanning(); // Stop camera on success

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
      // Show error but don't stop scanning
      setError(err.message);
      setLoading(false);
      
      // Allow re-scanning after a short delay
      setTimeout(() => {
         setError("");
         hasScannedRef.current = false;
      }, 2000);
    }
  };

  const stopScanning = () => {
    try {
      // Use the controls object to stop the decoding loop properly
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }

      // Stop video stream tracks
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        videoStreamRef.current = null;
      }
      
      // Clear video element
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
      }
      
      setTorchEnabled(false);
    } catch (e) {
      console.error("Error stopping camera:", e);
    }
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

              <div className="bg-black rounded-xl overflow-hidden mb-4 relative min-h-[400px]">
                {/* Always rendered video element */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-[400px] md:h-[500px] object-cover transition-opacity duration-300 ${loading ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                />

                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <div className="text-center p-6 rounded-xl bg-black/60 border border-amber-500/30">
                        {loadingMessage.includes("external") ? (
                          <Globe className="animate-pulse size-12 text-blue-400 mx-auto mb-4" />
                        ) : (
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
                        )}
                        <p className={loadingMessage.includes("external") ? "text-blue-300 font-medium" : "text-amber-200 font-medium"}>
                          {loadingMessage}
                        </p>
                      </div>
                    </div>
                )}
                
                {/* Scanning frame with corners - Only show when NOT loading */}
                {!loading && (
                  <>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-64 h-64 md:w-80 md:h-80">
                  {/* Corner decorations */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-500"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-500"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-500"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-500"></div>
                  
                  {/* Animated scanning line */}
                  {isScanning && !loading && (
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="h-1 w-full bg-linear-to-r from-transparent via-amber-400 to-transparent animate-scan-line shadow-[0_0_10px_rgba(251,191,36,0.8)]"></div>
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
              
              {/* Mobile camera controls */}
              {isMobile && (
                <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                  {/* Switch camera button */}
                  {availableCameras.length > 1 && (
                    <button
                      onClick={async () => {
                        if (availableCameras.length <= 1 || !isScanning) return;
                        
                        setIsScanning(false);
                        stopScanning();
                        
                        // Wait for camera to fully release
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
                        setCurrentCameraIndex(nextIndex);
                        
                        // Reset and restart scanning
                        hasScannedRef.current = false;
                        startScanning(nextIndex);
                      }}
                      className="p-3 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full border border-amber-500/30 transition-all disabled:opacity-50"
                      title="Switch Camera"
                      disabled={availableCameras.length <= 1}
                    >
                      <SwitchCamera className="size-5 text-amber-300" />
                    </button>
                  )}
                  
                  {/* Torch button */}
                  <button
                    onClick={toggleTorch}
                    className="p-3 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full border border-amber-500/30 transition-all"
                    title={torchEnabled ? "Turn off flashlight" : "Turn on flashlight"}
                  >
                    {torchEnabled ? (
                      <Flashlight className="size-5 text-amber-400" />
                    ) : (
                      <FlashlightOff className="size-5 text-amber-300" />
                    )}
                  </button>
                </div>
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
              </>
            )}
            </div>

          {error && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 p-4 bg-red-900/90 backdrop-blur-md text-red-100 rounded-xl text-center border-2 border-red-500 shadow-xl z-20 animate-bounce">
              <ShieldAlert className="size-8 mx-auto mb-2 text-red-400" />
              <p className="font-bold">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="w-full py-3 bg-stone-700/80 hover:bg-stone-600 backdrop-blur-sm text-white rounded-xl transition-colors font-medium border border-stone-500/30"
            >
              Close Scanner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}