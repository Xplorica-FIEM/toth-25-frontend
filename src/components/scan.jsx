// components/scan.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { BrowserQRCodeReader } from "@zxing/browser";
import { X, Sparkles, Globe, ShieldAlert, Flashlight, FlashlightOff, Smartphone, Monitor, SwitchCamera, Wifi, WifiOff } from "lucide-react"; 
import { getCachedRiddle, queueScan } from "@/utils/riddleCache";
import { triggerSync } from "@/utils/backgroundSync";
import { decryptAES } from "@/utils/crypto";
import { getLockedRiddle, getUnlockedRiddle, unlockRiddle } from "@/utils/riddleStorage";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function Scan({ onClose, onScanSuccess, mode = "game" }) { // Add onScanSuccess prop
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
  const [memeData, setMemeData] = useState(null);
  
  const videoStreamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  const persistScanToServer = useCallback(
    async (riddleId, scannedAtIso, options = {}) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Your session expired. Please login again before scanning.");
      }

      const payload = {
        riddleId,
        scannedAt: scannedAtIso,
      };

      try {
        const response = await fetch(`${BACKEND_URL}/api/scan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const contentType = response.headers?.get('content-type');
        const responseData = contentType && contentType.includes('application/json')
          ? await response.json()
          : null;

        if (!response.ok) {
          const message = responseData?.error || responseData?.message || 'Scan failed';
          throw new Error(message);
        }

        return responseData;
      } catch (error) {
        const offline = typeof navigator !== 'undefined' && !navigator.onLine;
        const networkIssue =
          error?.name === 'TypeError' ||
          /NetworkError|Failed to fetch|Load failed/i.test(error?.message || '');

        if (offline || networkIssue) {
          console.warn('Network issue while saving scan, queueing for retry', error);
          await queueScan(riddleId, scannedAtIso);
          await triggerSync();
          setIsOffline(true);

          if (options.requireRiddleData) {
            throw new Error("You're offline. Scan saved locally and will sync once you're back online.");
          }

          return null;
        }

        throw error;
      }
    },
    [setIsOffline]
  );

  useEffect(() => {
    // Detect if mobile device
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    
    // Monitor online/offline status
    const handleOnline = () => {
      setIsOffline(false);
      // Trigger background sync when coming online
      triggerSync();
    };
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);
    
    // Initialize Camera immediately (no delay)
    readerRef.current = new BrowserQRCodeReader();
    startScanning(); // Start immediately for faster interaction

    return () => {
      stopScanning();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
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

      // On mobile, try to prioritize the back camera as the first device
      // Check navigator directly to avoid closure stale state on initial render
      const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobileDevice) {
        const backCameraIndex = devices.findIndex((d) => {
          const label = d.label.toLowerCase();
           return label.includes("back") || 
                  label.includes("rear") ||
                  label.includes("environment");
        });

        if (backCameraIndex > 0) {
           const backCamera = devices[backCameraIndex];
           devices.splice(backCameraIndex, 1);
           devices.unshift(backCamera);
        }
      }

      // Store available cameras (sorted)
      setAvailableCameras(devices);

      // Select camera based on index
      const selectedCamera = devices[currentCameraIndex % devices.length];
      
      // Configure QR reader with performance hints
      const hints = new Map();
      const BarcodeFormat = (await import('@zxing/library')).BarcodeFormat;
      hints.set(2, [BarcodeFormat.QR_CODE]); // DecodeHintType.POSSIBLE_FORMATS = 2
      hints.set(3, true); // DecodeHintType.TRY_HARDER = 3
      
      readerRef.current.hints = hints;
      readerRef.current.timeBetweenDecodingAttempts = 200; // Throttle to 5 scans/sec
      
      // On mobile, use facingMode constraint to reliably select back camera on first scan
      // This is more reliable than label detection as labels may be empty before permission
      if (isMobileDevice && currentCameraIndex === 0) {
        const constraints = {
          video: {
            facingMode: { ideal: 'environment' }, // Back camera
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        await readerRef.current.decodeFromConstraints(
          constraints,
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
      } else {
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
      if (!qrData) throw new Error("Empty QR Code");

      // Handle raw mode (e.g. for Admin verification)
      if (mode === "raw") {
        if (onScanSuccess) {
            onScanSuccess(qrData);
        }
        return;
      }

      // 1. Handle Encrypted Riddle (ID:Secret format)
      if (qrData.includes(':')) {
        const parts = qrData.split(':');
        const riddleId = parts[0]?.trim();
        const secret = parts[1]?.trim();
        
        if (!riddleId || !secret) {
           throw new Error("Invalid QR Format: Missing ID or Secret");
        }
        
        const encryptionSecret = secret;
        
        // CORRECTED: Use the specific IV from environment variables
        const iv = process.env.NEXT_PUBLIC_AES_IV;
        
        if (!iv) {
          console.error("Missing NEXT_PUBLIC_AES_IV in environment variables");
          throw new Error("Decryption configuration missing");
        }

        // 2. First check if riddle is already unlocked (re-scan case)
        const unlockedData = getUnlockedRiddle(riddleId);
        
        if (unlockedData && unlockedData.puzzleText && unlockedData.isSolved) {
          // Already unlocked - use cached decrypted data
          console.log('✅ Riddle already unlocked, using cached data:', riddleId);
          
          const riddleData = {
            id: riddleId,
            puzzleText: unlockedData.puzzleText,
            isUnlocked: true
          };

          // Store and Redirect
          localStorage.setItem('currentRiddleId', riddleId);
          localStorage.setItem('currentRiddleData', JSON.stringify(riddleData));
          
          // Still register the scan to server (for tracking purposes)
          const scannedAtIso = new Date().toISOString();
          (async () => {
            try {
              await persistScanToServer(riddleId, scannedAtIso, { requireRiddleData: false });
              console.log('✅ Re-scan registered for riddle:', riddleId);
            } catch (err) {
              console.warn('⚠️ Re-scan registration failed:', err.message);
            }
          })();
          
          if (onScanSuccess) {
            onScanSuccess(riddleId);
            return;
          }

          await router.push(
            {
              pathname: '/ViewRiddles',
              query: { id: riddleId }
            },
            '/ViewRiddles'
          );
          onClose();
          return;
        }

        // 3. Fetch from distributed localStorage (locked riddles)
        const lockedData = getLockedRiddle(riddleId);

        if (!lockedData) {
            throw new Error("Riddle definition not found on device.");
        }

        // Handle data as a direct string based on your localStorage structure
        // If lockedData is "abcd...", use it directly. If it's an object, check properties.
        const encryptedText = typeof lockedData === 'string' 
            ? lockedData 
            : (lockedData.puzzleText || lockedData.encryptedText);

        if (!encryptedText) throw new Error("No encrypted text available");

        // Attempt decryption
        let decryptedText;
        try {
            decryptedText = await decryptAES(encryptedText, encryptionSecret, iv);
        } catch (decryptErr) {
            console.error("Decryption failed:", decryptErr);
            throw new Error("Invalid Secret Key. This QR code doesn't match the current riddle.");
        }
        
        if (!decryptedText) throw new Error("Decryption returned empty");

        const riddleData = {
          id: riddleId,
          puzzleText: decryptedText,
          isUnlocked: true
        };

        // Save to distributed localStorage using unlockRiddle
        try {
          unlockRiddle(riddleId, {
            puzzleText: decryptedText,
            isSolved: true,
            scannedAt: new Date().toISOString()
          });
        } catch(err) {
          console.error("Failed to update unlocked riddles storage", err);
        }

        // Store and Redirect
        localStorage.setItem('currentRiddleId', riddleId);
        localStorage.setItem('currentRiddleData', JSON.stringify(riddleData));
        
        // Async background API call to register the scan - fire and forget
        const scannedAtIso = new Date().toISOString();
        (async () => {
          try {
            await persistScanToServer(riddleId, scannedAtIso, { requireRiddleData: false });
            console.log('✅ Scan registered in background for riddle:', riddleId);
          } catch (err) {
            console.warn('⚠️ Background scan registration failed (will retry later):', err.message);
          }
        })();
        
        if (onScanSuccess) {
          onScanSuccess(riddleId);
          return; // Exit without closing modal or redirecting
        }

        await router.push(
          {
            pathname: '/ViewRiddles',
            query: { id: riddleId }
          },
          '/ViewRiddles'
        );
        onClose();
        return;
      }

      // 2. Plain Riddle ID (Standard Flow)
      const plainRiddleId = qrData.trim();
      
      if (!plainRiddleId.includes(':') && plainRiddleId.length === 6) {
        // Check localStorage cache first
        const cachedRiddle = await getCachedRiddle(plainRiddleId);
        const scannedAtIso = new Date().toISOString();

        let riddleData = null;

        if (cachedRiddle) {
          console.log(`✅ Cache hit for riddle id: ${plainRiddleId}`);
          setLoadingMessage("⚡ Saving your scan...");
          riddleData = {
            id: cachedRiddle.id,
            riddleName: cachedRiddle.riddleName,
            puzzleText: cachedRiddle.puzzleText,
            orderNumber: cachedRiddle.orderNumber
          };
        } else {
          setLoadingMessage("⚡ Loading riddle...");
        }

        const serverData = await persistScanToServer(
          plainRiddleId,
          scannedAtIso,
          { requireRiddleData: !cachedRiddle }
        );

        if (serverData?.riddle) {
          riddleData = serverData.riddle;
        }

        if (!riddleData) {
          throw new Error("Riddle data unavailable. Please try again.");
        }

        localStorage.setItem('currentRiddleId', plainRiddleId);
        localStorage.setItem('currentRiddleData', JSON.stringify(riddleData));
        
        if (onScanSuccess) {
          onScanSuccess(plainRiddleId);
          return;
        }

        await router.push(
          {
            pathname: '/ViewRiddles',
            query: { id: plainRiddleId }
          },
          '/ViewRiddles'
        );
        onClose();
        return;
      } else {
         // Fails format check and didn't match previous flows
         throw new Error("Invalid QR Code");
      }

    } catch (err) {
      console.error('❌ Scan error:', err);
      // Normalize error message to just "Invalid QR Code" for format/decryption issues
      let message = err.message;
      if (message.includes("Invalid QR") || message.includes("Decryption") || message.includes("not found on device") || message.includes("configuration missing") || message.includes("No encrypted text")) {
          message = "Invalid QR Code";
      }
      setError(message);
      setLoading(false);
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

  const showMemeModal = (meme) => {
    setMemeData(meme);
  };

  const closeMemeModal = () => {
    setMemeData(null);
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
              
              {/* Camera controls */}
              {(isMobile || availableCameras.length > 1) && (
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
                    >
                      <SwitchCamera className="size-5 text-amber-300" />
                    </button>
                  )}
                  
                  {/* Torch button */}
                  {isMobile && (
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
                  )}
                </div>
              )}
              
              {/* Tips */}
              <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-2 rounded-lg border border-amber-500/20">
                <p className="text-amber-400/70 text-xs">
                  {isMobile ? "💡 Seek good lighting" : "💡 Bring marker closer"}
                </p>
              </div>
              

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

      {/* Meme Modal - Trails of the Hunt Themed */}
      {memeData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 p-4">
          <div className="max-w-2xl w-full bg-linear-to-br from-amber-50/95 via-yellow-50/95 to-amber-100/95 backdrop-blur-xl rounded-3xl border-4 border-amber-800/80 shadow-2xl overflow-hidden relative"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="200" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="4" /%3E%3CfeColorMatrix type="saturate" values="0.1"/%3E%3C/filter%3E%3Crect width="200" height="200" filter="url(%23noise)" opacity="0.4" fill="%23d4a574"/%3E%3C/svg%3E")',
              backgroundSize: '200px 200px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 2px 4px 0 rgba(255, 255, 255, 0.1), 0 0 80px rgba(217, 119, 6, 0.3)'
            }}>
            
            {/* Ancient decorative corners */}
            <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-amber-700/40 rounded-tl-3xl"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-amber-700/40 rounded-tr-3xl"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-amber-700/40 rounded-bl-3xl"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-amber-700/40 rounded-br-3xl"></div>

            {/* Header */}
            <div className="bg-linear-to-r from-amber-900 via-amber-800 to-amber-900 px-6 py-3 border-b-4 border-amber-950/50 relative">
              <div className="absolute top-1 left-1 text-amber-300/30 text-2xl" style={{fontFamily: 'Uncial Antiqua'}}>❦</div>
              <div className="absolute top-1 right-1 text-amber-300/30 text-2xl" style={{fontFamily: 'Uncial Antiqua'}}>❦</div>
              
              <h2 className="text-2xl sm:text-3xl font-bold text-amber-50 text-center" style={{fontFamily: 'Cinzel, serif', letterSpacing: '0.05em'}}>
                🎭 A Curious Discovery! 🎭
              </h2>
              <p className="text-amber-200/70 text-sm sm:text-base text-center mt-1" style={{fontFamily: 'IM Fell English, serif'}}>
                Thou hast stumbled upon a secret jest!
              </p>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Meme Image */}
              <div className="mb-6 bg-amber-100/50 backdrop-blur-sm rounded-2xl p-4 border-4 border-amber-800/40 shadow-inner relative"
                style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="paper"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23paper)" opacity="0.15" /%3E%3C/svg%3E")',
                  boxShadow: 'inset 0 2px 20px rgba(0, 0, 0, 0.15)'
                }}>
                <img 
                  src={memeData.imageUrl} 
                  alt={memeData.name}
                  className="w-full rounded-xl border-2 border-amber-800/30 shadow-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
                  }}
                />
              </div>

              {/* Meme Caption */}
              {memeData.caption && (
                <div className="bg-amber-100/50 rounded-xl p-4 border-2 border-amber-800/30 mb-6">
                  <p className="text-amber-950 text-center text-lg sm:text-xl font-bold" style={{fontFamily: 'IM Fell English, serif', fontStyle: 'italic'}}>
                    {memeData.caption}
                  </p>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={closeMemeModal}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg border border-amber-400/50 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                style={{fontFamily: 'Cinzel, serif'}}
              >
                ⚔️ Continue Thy Quest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
