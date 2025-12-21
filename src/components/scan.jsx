import { useState, useRef, useEffect } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { X, ScanLine } from "lucide-react";

export default function Scan({ onClose }) {
  const [mounted, setMounted] = useState(false); // For client-side rendering
  const [scannedData, setScannedData] = useState("");
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    setMounted(true); // Only render on client
  }, []);

  useEffect(() => {
    if (!mounted) return;

    codeReaderRef.current = new BrowserQRCodeReader();
    startScanning();

    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
    };
  }, [mounted]);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError("");
      setScannedData("");

      const devices = await codeReaderRef.current.listVideoInputDevices();

      if (!devices.length) {
        setError("No camera found. Please allow camera access.");
        setIsScanning(false);
        return;
      }

      const backCamera =
        devices.find(
          (d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("rear")
        ) || devices[0];

      codeReaderRef.current.decodeFromVideoDevice(
        backCamera.deviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            setScannedData(result.getText());
            setIsScanning(false);
            codeReaderRef.current.reset();
            // Redirect if scanned data is a URL
            if (result.getText().startsWith("http")) {
              window.location.href = result.getText();
            }
          }
          if (err && err.name !== "NotFoundException") {
            console.error(err);
          }
        }
      );
    } catch (err) {
      console.error(err);
      setError("Camera access failed. Check permissions.");
      setIsScanning(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white"
        >
          <X className="size-8" />
        </button>

        <div className="bg-gradient-to-br from-amber-900/90 to-stone-900/90 rounded-2xl p-6 border border-amber-700/50">
          <h2 className="text-xl text-amber-100 text-center mb-4">
            QR Code Scanner
          </h2>

          <div className="bg-black rounded-xl overflow-hidden mb-4">
            <video
              ref={videoRef}
              muted
              playsInline
              className="w-full max-h-[60vh]"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 text-red-200 rounded-lg text-center">
              {error}
            </div>
          )}

          {scannedData && (
            <div className="p-3 bg-green-900/50 text-green-200 rounded-lg">
              <p className="break-all">{scannedData}</p>
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-stone-700 text-white rounded-xl"
            >
              Close
            </button>
            {scannedData && (
              <button
                onClick={startScanning}
                className="flex-1 py-3 bg-amber-600 text-white rounded-xl"
              >
                Scan Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
