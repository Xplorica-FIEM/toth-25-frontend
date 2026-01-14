import { useState } from "react";
import { QrCode, CheckCircle, XCircle, Search, AlertTriangle, ScanLine } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import Scan from "@/components/scan";
import { getAdminRiddleById } from "@/utils/api";

function VerifyQRContent() {
  const [showScanner, setShowScanner] = useState(false);
  const [scannedId, setScannedId] = useState("");
  const [riddleData, setRiddleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [secretMatch, setSecretMatch] = useState(null);

  const handleScanSuccess = (decodedText) => {
    setShowScanner(false);
    verifyRiddle(decodedText);
  };

  const verifyRiddle = async (inputString) => {
    setScannedId(inputString);
    setLoading(true);
    setError(null);
    setRiddleData(null);
    setHasScanned(true);
    setSecretMatch(null);

    let idToCheck = inputString ? inputString.trim() : "";
    let secretToCheck = null;
    
    // Handle encrypted QR format (ID:Secret)
    if (idToCheck.includes(':')) {
        const parts = idToCheck.split(':');
        idToCheck = parts[0].trim();
        secretToCheck = parts[1].trim();
    }

    // Basic format validation (UUID v4 or partial ID)
    if (!idToCheck || idToCheck.length < 4 || idToCheck.length > 36) {
        setError("Invalid QR format: ID must be between 4 and 36 characters");
        setLoading(false);
        return;
    }

    try {
      const res = await getAdminRiddleById(idToCheck);
      
      if (res.ok && res.data.success) {
        setRiddleData(res.data.riddle);

        // Verify secret if provided
        if (secretToCheck && res.data.riddle.encSecret) {
            setSecretMatch(secretToCheck === res.data.riddle.encSecret);
        }
      } else {
        setError(res.data?.error || "Riddle not found or invalid QR");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Failed to verify QR Code. Server error.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    verifyRiddle(scannedId);
  };

  return (
    <AdminLayout activeTab="verify-qr">
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-amber-100 mb-2 flex items-center gap-3">
          <ScanLine className="size-8 text-amber-500" />
          Verify QR Code
        </h1>
        <p className="text-amber-200/60 mb-8">
          Scan a QR code or enter a riddle ID to verify its validity and view details.
        </p>

        {/* Action Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Scan Button */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-amber-500/50 transition-colors">
            <div className="bg-slate-800 p-4 rounded-full mb-4">
               <QrCode className="size-8 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-amber-100 mb-2">Scan with Camera</h3>
            <p className="text-sm text-amber-200/50 mb-4">Use your device camera to scan a printed QR code</p>
            <button
              onClick={() => setShowScanner(true)}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <ScanLine className="size-4" />
              Start Scanner
            </button>
          </div>

          {/* Manual Input */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 flex flex-col justify-center">
            <h3 className="text-lg font-bold text-amber-100 mb-4 flex items-center gap-2">
                <Search className="size-5 text-amber-400" />
                Manual Entry
            </h3>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={scannedId}
                onChange={(e) => setScannedId(e.target.value)}
                placeholder="Paste Riddle ID here..."
                className="flex-1 bg-stone-950 border border-stone-800 rounded-lg px-4 py-2 text-amber-100 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!scannedId || loading}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-100 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                Check
              </button>
            </form>
          </div>
        </div>

        {/* Results Area */}
        {loading && (
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-8 text-center animate-pulse">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent mb-4"></div>
                <p className="text-amber-200">Verifying QR Code...</p>
            </div>
        )}

        {!loading && hasScanned && (
            <div className={`border rounded-xl p-6 ${error ? 'bg-red-900/10 border-red-500/30' : 'bg-green-900/10 border-green-500/30'}`}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${error ? 'bg-red-900/50' : 'bg-green-900/50'}`}>
                        {error ? <XCircle className="size-8 text-red-500" /> : <CheckCircle className="size-8 text-green-500" />}
                    </div>
                    <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-1 ${error ? 'text-red-400' : 'text-green-400'}`}>
                            {error ? 'Invalid QR Code' : 'Valid Riddle Found'}
                        </h3>
                        
                        {error ? (
                            <p className="text-red-300/70">{error}</p>
                        ) : (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs text-green-300/50 uppercase tracking-wider">Riddle Name</p>
                                    <p className="text-lg font-bold text-amber-100">{riddleData?.riddleName}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-green-300/50 uppercase tracking-wider">Riddle ID</p>
                                    <p className="text-sm font-mono text-amber-200/70 break-all">{riddleData?.id}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-green-300/50 uppercase tracking-wider">Status</p>
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${riddleData?.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {riddleData?.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-green-300/50 uppercase tracking-wider">Total Scans</p>
                                    <p className="text-lg font-mono text-amber-100">{riddleData?.totalScans || 0}</p>
                                </div>
                                
                                <div className="space-y-1 md:col-span-2 border-t border-stone-800 pt-3 mt-1">
                                    <p className="text-xs text-green-300/50 uppercase tracking-wider mb-1">Secret Key Verification</p>
                                    {secretMatch === null ? (
                                        <p className="text-sm text-stone-500 italic">No secret key in scanned QR</p>
                                    ) : secretMatch ? (
                                        <div className="flex items-center gap-2 text-green-400 bg-green-900/20 p-2 rounded-lg border border-green-500/20 w-full sm:w-fit">
                                            <CheckCircle className="size-5" /> 
                                            <span className="font-bold">Secret Key Matches</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-2 rounded-lg border border-red-500/20 w-fit">
                                            <XCircle className="size-5" /> 
                                            <span className="font-bold">Secret Key Mismatch</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

      </div>

      {showScanner && (
        <Scan
          mode="raw"
          onClose={() => setShowScanner(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}
    </AdminLayout>
  );
}

export default function VerifyQR() {
  return (
    <ProtectedRoute>
      <VerifyQRContent />
    </ProtectedRoute>
  );
}
