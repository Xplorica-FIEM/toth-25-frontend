// components/scan.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { BrowserQRCodeReader } from "@zxing/browser";
import { X, Sparkles, Globe, ShieldAlert, Flashlight, FlashlightOff, Smartphone, Monitor, SwitchCamera, Wifi, WifiOff } from "lucide-react"; 
import { scanQR, syncOfflineScans } from "@/utils/api";
import { getCachedRiddle, queueOfflineScan, getOfflineScans } from "@/utils/cache";
import { decryptQRData, decryptRiddleData } from "@/utils/encryption";

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
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const videoStreamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    // Detect if mobile device
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    
    // Monitor online/offline status
    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineScansInBackground();
    };
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);
    
    // Try to sync offline scans on mount
    syncOfflineScansInBackground();
    
    // Initialize Camera immediately (no delay)
    readerRef.current = new BrowserQRCodeReader();
    startScanning(); // Start immediately for faster interaction

    return () => {
      stopScanning();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Background sync for offline scans
  const syncOfflineScansInBackground = async () => {
    try {
      const offlineScans = await getOfflineScans();
      if (offlineScans.length === 0) return;
      
      console.log(`📡 Syncing ${offlineScans.length} offline scans...`);
      const response = await syncOfflineScans(offlineScans.map(s => ({
        riddleId: s.riddleId,
        scannedAt: s.scannedAt
      })));
      
      if (response.ok && response.data) {
        console.log(`✅ Synced ${response.data.synced} scans`);
        // Clear synced scans from queue
        const { clearOfflineScans } = await import('@/utils/cache');
        await clearOfflineScans();
      }
    } catch (error) {
      console.log('⚠️ Offline sync failed - will retry later');
    }
  };

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

      // Store available cameras
      setAvailableCameras(devices);

      // Select camera based on device type and current index
      let selectedCamera;
      
      // Optimized video constraints for performance
      const videoConstraints = {
        width: { ideal: isMobile ? 1280 : 1920, max: isMobile ? 1920 : 2560 },
        height: { ideal: isMobile ? 720 : 1080, max: isMobile ? 1080 : 1440 },
        frameRate: { ideal: 30, max: 30 },
        aspectRatio: { ideal: 16/9 },
        facingMode: currentCameraIndex === 0 && isMobile ? { ideal: 'environment' } : 'user'
      };
      
      if (currentCameraIndex === 0 && isMobile) {
        // Mobile: prefer back camera initially
        // First try using facingMode to get back camera
        try {
          const testStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: { exact: "environment" } } 
          });
          testStream.getTracks().forEach(track => track.stop());
          
          // If successful, find the back camera from devices
          const backCamera = devices.find((d) => {
            const label = d.label.toLowerCase();
            return label.includes("back") || 
                   label.includes("rear") ||
                   label.includes("environment") ||
                   label.includes("facing back");
          });
          selectedCamera = backCamera || (devices.length > 1 ? devices[1] : devices[0]);
        } catch {
          // Fallback: try to find back camera by label or use second camera
          const backCamera = devices.find((d) => {
            const label = d.label.toLowerCase();
            return label.includes("back") || 
                   label.includes("rear") ||
                   label.includes("environment") ||
                   label.includes("facing back");
          });
          selectedCamera = backCamera || (devices.length > 1 ? devices[1] : devices[0]);
        }
      } else {
        // Use camera by index (for switching)
        selectedCamera = devices[currentCameraIndex % devices.length];
      }

      // Configure QR reader with performance hints
      const hints = new Map();
      const BarcodeFormat = (await import('@zxing/library')).BarcodeFormat;
      hints.set(2, [BarcodeFormat.QR_CODE]); // DecodeHintType.POSSIBLE_FORMATS = 2
      hints.set(3, true); // DecodeHintType.TRY_HARDER = 3
      
      readerRef.current.hints = hints;
      readerRef.current.timeBetweenDecodingAttempts = 200; // Throttle to 5 scans/sec
      
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
          // Silently ignore NotFoundException to reduce console spam
        }
      );

      // Store video stream for torch control
      if (videoRef.current && videoRef.current.srcObject) {
        videoStreamRef.current = videoRef.current.srcObject;
      }
    } catch (e) {
      console.error("Camera error:", e);
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setError("Camera permission denied. Please allow camera access.");
      } else if (e.name === "NotFoundError") {
        setError("No camera found on this device");
      } else if (e.name === "NotReadableError") {
        setError("Camera is being used by another app");
      } else {
        setError("Failed to start camera. Please try again.");
      }
      setIsScanning(false);
    }
  };

  const handleQRScan = async (qrData) => {
    setError("");
    setLoading(true);

    try {
      // Step 1: Decrypt QR to get riddle id
      setLoadingMessage("🔓 Deciphering ancient symbols...");
      const riddleId = await decryptQRData(qrData);
      
      if (!riddleId) {
        throw new Error("Invalid QR code format");
      }

      // Step 2: Check cache first (instant lookup)
      setLoadingMessage("📜 Searching treasure map...");
      const cachedRiddle = await getCachedRiddle(riddleId);
      
      let riddleData = null;
      
      if (cachedRiddle) {
        console.log(`✅ Cache hit for riddle id: ${riddleId}`);
        // Decrypt cached riddle data
        const decrypted = await decryptRiddleData(cachedRiddle.encryptedData);
        riddleData = decrypted;
        
        // Record scan to backend (async, non-blocking)
        recordScanAsync(qrData, riddleId);
      } else {
        console.log(`⚠️ Cache miss for riddle id: ${riddleId} - falling back to API`);
        // Fallback: Call backend API
        setLoadingMessage("� Consulting the ancient oracle...");
        const response = await scanQR(qrData);

        if (!response.ok) {
          throw new Error(response.data.error || response.data.message || "Scan failed");
        }

        riddleData = response.data.riddle;
      }

      if (!riddleData) {
        throw new Error("Invalid response from server");
      }

      // riddleId is already the correct id from QR decryption

      setLoadingMessage("✨ Revealing the mystery...");

      // Cache the riddle ID for faster page loads
      localStorage.setItem('currentRiddleId', riddleId);
      localStorage.setItem('currentRiddleData', JSON.stringify(riddleData));

      // Brief delay to show the message
      await new Promise(resolve => setTimeout(resolve, 500));

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
      console.error('❌ Scan error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Record scan asynchronously (non-blocking)
  const recordScanAsync = async (qrData, riddleId) => {
    try {
      const response = await scanQR(qrData);
      if (response.ok) {
        console.log(`✅ Scan recorded for riddle id: ${riddleId}`);
      }
    } catch (error) {
      console.log(`⚠️ Failed to record scan - queueing for offline sync`);
      // Queue for offline sync (riddleId is already the 6-char id)
      try {
        await queueOfflineScan(riddleId);
      } catch (e) {
        console.error('Failed to queue offline scan:', e);
      }
    }
  };

  const stopScanning = useCallback(() => {
    try {
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
  }, []);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="relative w-full max-w-2xl mx-4">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-amber-400 transition-colors"
        >
          <X className="size-8" />
        </button>

        <div className="bg-linear-to-br from-amber-900/90 to-stone-900/90 rounded-2xl p-6 border border-amber-700/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl text-amber-100 flex items-center gap-2">
              <Sparkles className="size-5" />
              🗺️ Treasure Marker Scanner
            </h2>
            {/* Quest status indicator */}
            {isOffline && (
              <div className="flex items-center gap-1 text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded">
                <WifiOff className="size-3" />
                Solo Mode
              </div>
            )}
            {!isOffline && (
              <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                <Wifi className="size-3" />
                Connected
              </div>
            )}
          </div>

          {!loading && (
            <div className="bg-black rounded-xl overflow-hidden mb-4 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-[400px] md:h-[500px] object-cover"
                style={{ 
                  transform: 'translateZ(0)',
                  willChange: 'transform',
                  backfaceVisibility: 'hidden'
                }}
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
                      <div className="h-1 w-full bg-linear-to-r from-transparent via-amber-400 to-transparent animate-scan-line shadow-[0_0_10px_rgba(251,191,36,0.8)]"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Instructions overlay */}
              <div className="absolute top-4 left-0 right-0 text-center">
                <div className="inline-flex items-center gap-2 bg-black/90 px-4 py-2 rounded-lg border border-amber-500/30">
                  {isMobile ? <Smartphone className="size-4 text-amber-400" /> : <Monitor className="size-4 text-amber-400" />}
                  <p className="text-amber-300 text-sm font-medium">🗺️ Align the treasure marker within frame</p>
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
                        startScanning();
                      }}
                      className="p-3 bg-black/80 hover:bg-black rounded-full border border-amber-500/30 transition-all disabled:opacity-50"
                      title="Switch Camera"
                      disabled={availableCameras.length <= 1}
                    >
                      <SwitchCamera className="size-5 text-amber-300" />
                    </button>
                  )}
                  
                  {/* Torch button */}
                  <button
                    onClick={toggleTorch}
                    className="p-3 bg-black/80 hover:bg-black rounded-full border border-amber-500/30 transition-all"
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
              <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-2 rounded-lg border border-amber-500/20">
                <p className="text-amber-400/70 text-xs">
                  {isMobile ? "💡 Seek good lighting" : "💡 Bring marker closer"}
                </p>
              </div>
              
              <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-amber-300 text-sm font-semibold bg-black/80 px-4 py-2 rounded-lg">
                {isScanning ? "🔍 Searching..." : "⚡ Ready to Hunt"}
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-black rounded-xl overflow-hidden mb-4 h-[300px] flex items-center justify-center">
              <div className="text-center">
                {loadingMessage.includes("oracle") ? (
                  <Globe className="animate-pulse size-12 text-amber-400 mx-auto mb-4" />
                ) : (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
                )}
                <p className={loadingMessage.includes("oracle") ? "text-amber-300 font-medium" : "text-amber-200 font-medium"}>
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
              className="flex-1 py-3 bg-stone-700 hover:bg-stone-600 text-white rounded-xl transition-colors font-medium"
            >
              ⚔️ Abandon
            </button>

            {!loading && (
              <button
                onClick={() => {
                  hasScannedRef.current = false;
                  startScanning();
                }}
                disabled={isScanning}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-900 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium"
              >
                {isScanning ? "🔍 Searching..." : "🔄 Search Again"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
