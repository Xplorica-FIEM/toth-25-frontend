
import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Scan, Compass } from 'lucide-react';

export default function ScanPage() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front, 'environment' for back
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Start camera
  const startCamera = async (mode) => {
    try {
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 1280 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      alert('Unable to access camera. Please grant camera permissions.');
    }
  };

  // Initialize camera on mount
  useEffect(() => {
    startCamera(facingMode);

    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Switch camera
  const handleSwitchCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // Scan again
  const handleScanAgain = () => {
    setIsScanning(true);
    // Simulate scanning animation
    setTimeout(() => {
      setIsScanning(false);
      alert('Scan complete! Treasure detected.');
    }, 2000);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background with overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1618385418700-35dc948cdeec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwdHJlYXN1cmUlMjBtYXAlMjBwYXJjaG1lbnR8ZW58MXx8fHwxNzY2MDQ2MTMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`
        }}
      />
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 min-h-screen px-6 py-12 flex flex-col items-center justify-center">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <Compass className="size-12 text-amber-400 animate-pulse" />
            <h1 className="text-amber-100">Trails Of The Hunt</h1>
          </div>
        </div>

        {/* Scanner Container */}
        <div className="w-full max-w-lg">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-amber-900/20 rounded-2xl blur-2xl" />

            {/* Main container */}
            <div className="relative bg-gradient-to-br from-amber-900/60 to-stone-900/60 backdrop-blur-md rounded-2xl border border-amber-700/50 p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-amber-100 mb-2">Treasure Scanner</h2>
                <p className="text-amber-100/60">Point at ancient artifacts</p>
              </div>

              {/* Camera View - Square Window */}
              <div className="relative mb-6">
                {/* Camera container with square aspect ratio */}
                <div className="relative w-full aspect-square bg-black/50 rounded-xl overflow-hidden border-2 border-amber-600/50">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Scanning overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                      <div className="animate-pulse">
                        <Scan className="size-16 text-amber-400" />
                      </div>
                    </div>
                  )}

                  {/* Corner brackets for scanner effect */}
                  <div className="absolute top-4 left-4 w-12 h-12 border-t-3 border-l-3 border-amber-400/70 rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-12 h-12 border-t-3 border-r-3 border-amber-400/70 rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-b-3 border-l-3 border-amber-400/70 rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-b-3 border-r-3 border-amber-400/70 rounded-br-lg" />

                  {/* Scanning line animation */}
                  {isScanning && (
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-scan" />
                  )}

                  {/* Camera icon if no permission */}
                  {!hasPermission && (
                    <div className="absolute inset-0 flex items-center justify-center bg-amber-950/80">
                      <div className="text-center">
                        <Camera className="size-16 text-amber-400/50 mx-auto mb-3" />
                        <p className="text-amber-100/70">Camera access required</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Switch Camera Button */}
              <button
                onClick={handleSwitchCamera}
                className="w-full mb-4 py-4 bg-gradient-to-r from-amber-700/60 to-amber-800/60 hover:from-amber-600/70 hover:to-amber-700/70 border border-amber-600/50 text-amber-100 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-600/30 hover:scale-105 flex items-center justify-center gap-3"
              >
                <RefreshCw className="size-5" />
                Switch Camera
              </button>

              {/* Scan Again Button */}
              <button
                onClick={handleScanAgain}
                disabled={isScanning}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/50 hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Scan className="size-5" />
                {isScanning ? 'Scanning...' : 'Scan Again'}
              </button>

              {/* Decorative divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent my-6" />

              {/* Additional Info */}
              <div className="text-center">
                <p className="text-amber-100/50">
                  Align the QR within the frame
                </p>
              </div>

              {/* Decorative corner accents */}
              <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-amber-600/20 rounded-tr-xl" />
              <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-amber-600/20 rounded-bl-xl" />
            </div>
          </div>
        </div>

        {/* Footer ornament */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-amber-400/40">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-400/40" />
            <Compass className="size-4" />
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-400/40" />
          </div>
        </div>
      </div>

      {/* Custom styles for scanning animation */}
      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
        .border-t-3 {
          border-top-width: 3px;
        }
        .border-r-3 {
          border-right-width: 3px;
        }
        .border-b-3 {
          border-bottom-width: 3px;
        }
        .border-l-3 {
          border-left-width: 3px;
        }
      `}</style>
    </div>
  );
}
