import { Compass, ScanLine, Scroll, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { BrowserQRCodeReader } from '@zxing/library';

export default function HomePage() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  // Initialize / Cleanup QR Scanner
  useEffect(() => {
    if (showScanner && !codeReaderRef.current) {
      codeReaderRef.current = new BrowserQRCodeReader();
      startScanning();
    }

    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
    };
  }, [showScanner]);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      setError('');
      setScannedData('');

      const devices = await codeReaderRef.current.listVideoInputDevices();

      if (!devices.length) {
        setError('No camera found. Please allow camera access.');
        setIsScanning(false);
        return;
      }

      // Prefer back camera on mobile
      const backCamera =
        devices.find(device =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear')
        ) || devices[0];

      codeReaderRef.current.decodeFromVideoDevice(
        backCamera.deviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            setScannedData(result.getText());
            setIsScanning(false);
            codeReaderRef.current.reset(); // stop camera
          }
          if (err && err.name !== 'NotFoundException') {
            console.error(err);
          }
        }
      );
    } catch (err) {
      console.error(err);
      setError('Camera access failed. Check permissions.');
      setIsScanning(false);
    }
  };

  const closeScanner = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setShowScanner(false);
    setScannedData('');
    setError('');
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1618385418700-35dc948cdeec')"
        }}
      />
      <div className="fixed inset-0 bg-black/65 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 min-h-screen px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <Compass className="size-14 text-amber-400 animate-pulse" />
              <h1 className="text-amber-100">Treasure Hunt Portal</h1>
            </div>
            <p className="text-amber-100/80 max-w-2xl mx-auto">
              Scan ancient QR codes and solve riddles to uncover hidden secrets.
            </p>
          </header>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Scanner Card */}
            <div className="relative bg-gradient-to-br from-amber-900/60 to-stone-900/60 backdrop-blur-md rounded-2xl border border-amber-700/50 p-8 shadow-2xl">
              <div className="mb-6 p-5 bg-amber-700/40 rounded-2xl w-fit">
                <ScanLine className="size-12 text-amber-100" />
              </div>
              <h2 className="text-amber-100 mb-4">Open Scanner</h2>
              <p className="text-amber-100/70 mb-8">
                Scan hidden QR codes to reveal clues and rewards.
              </p>
              <button
                onClick={() => setShowScanner(true)}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl"
              >
                Launch Scanner
              </button>
            </div>

            {/* Riddles Card */}
            <div className="relative bg-gradient-to-br from-amber-900/60 to-stone-900/60 backdrop-blur-md rounded-2xl border border-amber-700/50 p-8 shadow-2xl">
              <div className="mb-6 p-5 bg-amber-700/40 rounded-2xl w-fit">
                <Scroll className="size-12 text-amber-100" />
              </div>
              <h2 className="text-amber-100 mb-4">Riddles</h2>
              <p className="text-amber-100/70 mb-8">
                Solve puzzles to unlock the next treasure stage.
              </p>
              <button className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl">
                Open Riddles
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl mx-4">
            <button
              onClick={closeScanner}
              className="absolute -top-12 right-0 text-white"
            >
              <X className="size-8" />
            </button>

            <div className="bg-gradient-to-br from-amber-900/90 to-stone-900/90 rounded-2xl p-6 border border-amber-700/50">
              <h2 className="text-xl text-amber-100 text-center mb-4">
                QR Code Scanner
              </h2>

              <div className="relative bg-black rounded-xl overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="w-full h-auto max-h-[60vh]"
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
                  {scannedData.startsWith('http') && (
                    <a
                      href={scannedData}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-3 text-center bg-amber-600 text-white py-2 rounded-lg"
                    >
                      Open Link
                    </a>
                  )}
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  onClick={closeScanner}
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
      )}
    </div>
  );
}
