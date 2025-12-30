// components/scan.jsx
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { BrowserQRCodeReader } from "@zxing/browser";
import { X, Sparkles, Globe, ShieldAlert } from "lucide-react"; 
import { scanQR, getRiddleKeys } from "@/utils/api";

export default function Scan({ onClose }) {
  const router = useRouter();
  const videoRef = useRef(null);
  const readerRef = useRef(null);

  // State to hold the valid keys fetched from server on mount
  const [validKeys, setValidKeys] = useState([]); 
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing...");

  useEffect(() => {
    //function to fetch valid Keys mapped to encryptionKeys
    const loadSecurityProtocols = async () => {
      try {
        const response = await getRiddleKeys();
        if (response.ok && response.data.keys) {
          setValidKeys(response.data.keys); // Store [{id: 1, encryptionKey: "abc"}, ...]
          console.log("DarkForge Protocols Loaded: Keys synchronized.");
        }
      } catch (err) {
        console.error("Failed to load security protocols:", err);
        setError("System Offline: Unable to sync keys.");
      }
    };

    //fetch/load valid keys
    loadSecurityProtocols();

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

      const backCamera =
        devices.find((d) => d.label.toLowerCase().includes("back")) ||
        devices[0];

      await readerRef.current.decodeFromVideoDevice(
        backCamera.deviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
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
      // check for memes
      if (isExternalUrl(qrData)) {
        setLoadingMessage("Redirecting to external sector...");
        window.location.href = qrData;
        return;
      }

      // check qrData against validKeys
      // We check the 'validKeys' array we fetched on mount.
      // qrData is expected to be the 'encryptionKey' string.
      
      setLoadingMessage("Analyzing Signal Signature...");

      const match = validKeys.find(k => k.encryptionKey === qrData);

      if (!match) {
        // ACCESS DENIED (Local Check)
        // We reject here instantly. No API call made for invalid keys.
        throw new Error("Access Denied: Invalid Security Key.");
      }

      // ACCESS GRANTED (Local Check Passed)
      // Now we call the backend to record the victory using the ID we found locally.
      setLoadingMessage("Key Verified. Synchronizing with Core...");

      const response = await scanQR(match.id);

      if (!response.ok) {
        throw new Error(response.data.error || response.data.message || "Claim Failed");
      }

      //redirect to viewRiddles with the id
      await router.push(
        {
          pathname: '/viewRiddles',
          query: { id: match.id } // Pass the ID securely
        },
        '/viewRiddles' // Mask URL
      );
      onClose();

    } catch (err) {
      setError(err.message);
      setLoading(false); // Only stop loading on error
    }
  };

  const stopScanning = () => {
    try {
      readerRef.current?.reset();
    } catch {}
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
                className="w-full h-[300px] object-cover"
              />
              <div className="absolute inset-0 border-2 border-amber-500/30 m-8 rounded-lg pointer-events-none"></div>
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
                onClick={startScanning}
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