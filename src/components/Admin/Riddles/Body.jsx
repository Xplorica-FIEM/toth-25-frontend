"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Plus, Trash2, Download, Edit, Eye, X } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import ConfirmModal from "@/components/ConfirmModal";
import { getAdminRiddles, deleteRiddle } from "@/utils/api";

const RiddlesPageBody = () => {
  const router = useRouter();
  const [riddles, setRiddles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedRiddleId, setSelectedRiddleId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // QR Modal States
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrPreviewUrl, setQrPreviewUrl] = useState("");
  const [qrSize, setQrSize] = useState(300);
  const [qrRiddle, setQrRiddle] = useState(null);

  useEffect(() => {
    fetchRiddles();
    // eslint-disable-next-line
  }, []);

  const fetchRiddles = async () => {
    setLoading(true);
    try {
      const riddlesRes = await getAdminRiddles();
      console.log("Riddles response:", riddlesRes);
      if (riddlesRes.ok && riddlesRes.data.riddles) {
        setRiddles(riddlesRes.data.riddles);
      } else {
        console.error("Failed to fetch riddles:", riddlesRes.data);
        setRiddles([]);
      }
    } catch (error) {
      console.error("Failed to fetch riddles:", error);
      setRiddles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRiddle = async (riddleId) => {
    setSelectedRiddleId(riddleId);
    setShowDeleteModal(true);
  };

  const confirmDeleteRiddle = async () => {
    if (!selectedRiddleId) return;
    try {
      const response = await deleteRiddle(selectedRiddleId);
      console.log("Delete response:", response);
      if (response.ok) {
        setRiddles(prev => prev.filter(r => r.id !== selectedRiddleId));
        setShowSuccessModal(true);
        await fetchRiddles();
      } else {
        setErrorMessage(response.data?.error || "Unknown error");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Delete error:", error);
      setErrorMessage("Failed to delete riddle. Please try again.");
      setShowErrorModal(true);
    } finally {
      setSelectedRiddleId(null);
    }
  };

  const handleOpenQRModal = async (riddle) => {
    try {
      setQrRiddle(riddle);
      setQrSize(300); // Default size

      const QRCode = (await import('qrcode')).default;
      // Modified QR Data: id:encryptionSecret
      const qrData = `${riddle.id}:${riddle.encryptionSecret || ''}`;
      
      // Generate standard preview at reasonable size
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });
      
      setQrPreviewUrl(qrCodeDataUrl);
      setShowQRModal(true);
    } catch (error) {
      console.error('QR preview generation error:', error);
      setErrorMessage("Failed to generate QR preview");
      setShowErrorModal(true);
    }
  };

  const handleExecuteDownloadQR = async () => {
    if (!qrRiddle) return;

    try {
      const QRCode = (await import('qrcode')).default;
      const qrData = `${qrRiddle.id}:${qrRiddle.encryptionSecret || ''}`;
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: Math.max(10, Math.min(3000, qrSize)), // Clamp between 10 and 3000
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });

      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${qrRiddle.riddleName.replace(/\s+/g, '-')}-QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setShowQRModal(false);
    } catch (error) {
      console.error('QR generation error:', error);
      setErrorMessage("Failed to generate QR code");
      setShowErrorModal(true);
    }
  };

  const handleViewRiddle = (riddleId) => {
    router.push(`/ViewRiddles?id=${riddleId}`);
  };

  const handleEditRiddle = (riddleId) => {
    router.push(`/admin/riddles/${riddleId}`);
  };

  return (
    <AdminLayout activeTab="riddles">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-100">All Riddles</h1>
        <div className="flex gap-2">
          <button
            onClick={() => fetchRiddles()}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-700 hover:bg-stone-800 text-amber-200 rounded-lg transition-colors font-medium border border-stone-600"
            title="Refresh riddles"
          >
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.062 19A9 9 0 1 0 6 6.26M19 5a9 9 0 0 0-1.062-1"/></svg>
            Refresh
          </button>
          <button
            onClick={() => router.push("/admin/riddles/create")}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="size-5" />
            add Riddles
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400 border-t-transparent mb-4"></div>
          <p className="text-amber-400 font-mono text-lg animate-pulse">Loading Riddles...</p>
          <p className="text-amber-200/60 text-sm mt-2">Fetching riddle list</p>
        </div>
      ) : riddles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <svg width="80" height="80" fill="none" viewBox="0 0 24 24" className="mb-4 text-amber-400"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" opacity=".2"/><path fill="currentColor" d="M12 7a1 1 0 0 1 1 1v3a1 1 0 0 1-2 0V8a1 1 0 0 1 1-1Zm0 8a1.25 1.25 0 1 1 0-2.5A1.25 1.25 0 0 1 12 15Z"/></svg>
          <h2 className="text-2xl font-semibold text-amber-200 mb-2">No Riddles Found</h2>
          <p className="text-amber-300 mb-6">You haven't created any riddles yet. Start by creating your first riddle!</p>
          <button
            onClick={() => router.push("/admin/riddles/create")}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="size-5" />
            Create Riddle
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {riddles?.map((riddle) => (
            <div
              key={riddle.id}
              className="bg-stone-900 border border-stone-800 rounded-lg p-4 hover:border-amber-700 transition-colors"
            >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-4 flex-1">
                <span className="text-base sm:text-lg font-semibold text-amber-100">
                  {riddle.riddleName}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => handleEditRiddle(riddle.id)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-2 text-sm text-amber-100 hover:bg-amber-900/20 rounded transition-colors"
                  title="Edit riddle"
                >
                  <Edit className="size-5 sm:size-4" />
                  <span className="hidden sm:inline">edit</span>
                </button>
                <button
                  onClick={() => handleOpenQRModal(riddle)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-2 text-sm text-amber-100 hover:bg-amber-900/20 rounded transition-colors"
                  title="Download QR code"
                >
                  <Download className="size-5 sm:size-4" />
                  <span className="hidden sm:inline">Download QR</span>
                </button>
                <button
                  onClick={() => handleViewRiddle(riddle.id)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-2 text-sm text-amber-100 hover:bg-amber-900/20 rounded transition-colors whitespace-nowrap"
                  title="View riddle details"
                >
                  <Eye className="size-5 sm:size-4" />
                  <span className="hidden sm:inline">view riddles</span>
                </button>
                <button
                  onClick={() => handleDeleteRiddle(riddle.id)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-2 text-sm text-red-400 hover:bg-red-900/20 rounded transition-colors"
                  title="Delete riddle"
                >
                  <Trash2 className="size-5 sm:size-4" />
                  <span className="hidden sm:inline">delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* QR Download Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
                onClick={() => setShowQRModal(false)}
                className="absolute right-4 top-4 text-stone-400 hover:text-white transition-colors p-1 hover:bg-stone-800 rounded-full"
            >
                <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-amber-100 mb-6 flex items-center gap-2">
                <Download className="size-5 text-amber-500" /> Download QR Code
            </h3>
            
            <div className="flex flex-col items-center gap-6">
                <div className="bg-white p-3 rounded-lg shadow-inner border border-stone-700">
                    <img src={qrPreviewUrl} alt="QR Preview" className="w-48 h-48 object-contain" />
                </div>
                
                <div className="w-full space-y-3">
                    <label className="text-sm text-stone-400 flex justify-between items-end">
                        <span className="font-medium">Image Size</span>
                        <span className="text-amber-400 font-mono text-xs bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/50">
                          {qrSize}px x {qrSize}px
                        </span>
                    </label>
                    <div className="flex gap-4 items-center">
                        <div className="flex-1 relative h-6 flex items-center">
                          <input 
                              type="range" 
                              min="10" 
                              max="3000" 
                              value={qrSize} 
                              onChange={(e) => setQrSize(Number(e.target.value))}
                              className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400"
                          />
                        </div>
                        <input 
                            type="number" 
                            min="10" 
                            max="3000" 
                            value={qrSize}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) setQrSize(val);
                            }}
                            className="w-20 bg-stone-800 border border-stone-700 text-stone-200 rounded-md px-2 py-1.5 text-sm text-center focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-stone-500 font-mono px-1">
                      <span>10px</span>
                      <span>3000px</span>
                    </div>
                </div>

                <button
                    onClick={handleExecuteDownloadQR}
                    className="w-full mt-2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
                >
                    <Download className="size-4" />
                    Download PNG
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedRiddleId(null);
        }}
        onConfirm={confirmDeleteRiddle}
        title="Delete Riddle?"
        message="Are you sure you want to delete this riddle? This action cannot be undone and will remove the riddle and its QR code permanently."
        confirmText="Delete"
        cancelText="Cancel"
        type="error"
      />

      {/* Success Modal */}
      <ConfirmModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="Riddle Deleted Successfully!"
        message="The riddle has been permanently removed."
        confirmText="OK"
        cancelText="Close"
        type="success"
      />

      {/* Error Modal */}
      <ConfirmModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        onConfirm={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        confirmText="OK"
        cancelText="Close"
        type="error"
      />
    </AdminLayout>
  );
}

export default RiddlesPageBody;