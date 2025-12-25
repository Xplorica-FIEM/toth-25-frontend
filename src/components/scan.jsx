// components/scan.jsx
import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { X } from "lucide-react";

export default function Scan({ onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);

  const [scannedData, setScannedData] = useState("");
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);

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
      setIsScanning(true);

      const devices =
        await BrowserQRCodeReader.listVideoInputDevices();

      if (!devices.length) {
        setError("No camera found");
        setIsScanning(false);
        return;
      }

      const backCamera =
        devices.find((d) =>
          d.label.toLowerCase().includes("back")
        ) || devices[0];

      await readerRef.current.decodeFromVideoDevice(
        backCamera.deviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            const text = result.getText();
            setScannedData(text);
            setIsScanning(false);
            stopScanning();
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
          className="absolute -top-12 right-0 text-white"
        >
          <X className="size-8" />
        </button>

        <div className="bg-gradient-to-br from-amber-900/90 to-stone-900/90 rounded-2xl p-6 border border-amber-700/50">
          <h2 className="text-xl text-amber-100 text-center mb-4">
            QR Code Scanner
          </h2>

          {/* Camera */}
          <div className="bg-black rounded-xl overflow-hidden mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-[300px] object-cover"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-900/50 text-red-200 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Result */}
          {scannedData && (
            <div className="p-3 bg-green-900/50 text-green-200 rounded-lg break-all">
              {scannedData}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-stone-700 text-white rounded-xl"
            >
              Close
            </button>

            <button
              onClick={startScanning}
              className="flex-1 py-3 bg-amber-600 text-white rounded-xl"
            >
              Scan Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
