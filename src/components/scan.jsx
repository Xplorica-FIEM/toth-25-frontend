// components/scan.jsx
import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { X, Sparkles, Trophy } from "lucide-react";
import { scanQR } from "@/utils/api";

export default function Scan({ onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);

  const [scannedData, setScannedData] = useState("");
  const [riddleData, setRiddleData] = useState(null);
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    readerRef.current = new BrowserQRCodeReader();

    // wait for DOM paint so videoRef exists
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
      setScannedData("");
      setRiddleData(null);
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
            setScannedData(text);
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
      setError("Camera permission denied or unavailable");
      setIsScanning(false);
    }
  };

  const handleQRScan = async (qrData) => {
    setLoading(true);
    setError("");

    try {
      // Parse QR data - expecting just riddleId
      const riddleId = parseInt(qrData);
      
      if (isNaN(riddleId)) {
        throw new Error("Invalid QR code format");
      }

      const response = await scanQR(riddleId);

      if (!response.ok) {
        throw new Error(response.data.error || response.data.message || "Failed to scan QR code");
      }

      // Extract riddle data from response
      setRiddleData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        {/* Close */}
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

          {/* If riddle unlocked, show riddle data */}
          {riddleData ? (
            <div className="space-y-4">
              {/* First scan badge */}
              {riddleData.riddle?.isFirstScan && (
                <div className="bg-green-600/20 border border-green-500 rounded-lg p-4 text-center">
                  <Trophy className="size-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-green-200 font-bold text-lg">
                    New Riddle Scanned!
                  </p>
                  <p className="text-green-300 text-sm">{riddleData.message}</p>
                </div>
              )}

              {!riddleData.riddle?.isFirstScan && (
                <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-3 text-center">
                  <p className="text-blue-200 text-sm">
                    {riddleData.message}
                  </p>
                </div>
              )}

              {/* Riddle content */}
              <div className="bg-black/40 rounded-lg p-6 space-y-4">
                <h3 className="text-amber-200 text-2xl font-bold text-center">
                  Riddle #{riddleData.riddle?.orderNumber}
                </h3>

                <div className="border-t border-amber-700/50 pt-4">
                  <p className="text-amber-100 text-lg leading-relaxed whitespace-pre-wrap">
                    {riddleData.riddle?.puzzleText}
                  </p>
                </div>

                <div className="text-center text-amber-400 text-sm">
                  Scanned at: {new Date(riddleData.riddle?.scannedAt).toLocaleTimeString()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors"
                >
                  Continue Hunt
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Camera view (only show when scanning) */}
              {!loading && (
                <div className="bg-black rounded-xl overflow-hidden mb-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-[300px] object-cover"
                  />
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="bg-black rounded-xl overflow-hidden mb-4 h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mx-auto mb-4"></div>
                    <p className="text-amber-200">Decrypting riddle...</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-900/50 text-red-200 rounded-lg text-center mb-4">
                  {error}
                </div>
              )}

              {/* Scanned QR data (for debugging) */}
              {scannedData && !loading && !riddleData && (
                <div className="p-3 bg-amber-900/50 text-amber-200 rounded-lg break-all text-sm mb-4">
                  Scanned: {scannedData}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-stone-700 hover:bg-stone-600 text-white rounded-xl transition-colors"
                >
                  Close
                </button>

                <button
                  onClick={startScanning}
                  disabled={isScanning || loading}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-900 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                >
                  {isScanning ? "Scanning..." : "Scan Again"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

