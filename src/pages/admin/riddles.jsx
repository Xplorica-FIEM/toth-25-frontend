// pages/admin/riddles.jsx - Admin Riddles Management Page
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Plus, Trash2, Download, Edit, Eye } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import ConfirmModal from "@/components/ConfirmModal";
import { getAdminRiddles, deleteRiddle } from "@/utils/api";

function AdminRiddlesContent() {
  const router = useRouter();
  const [riddles, setRiddles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedRiddleId, setSelectedRiddleId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchRiddles();
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
        // Immediately remove from UI for instant feedback
        setRiddles(prev => prev.filter(r => r.id !== selectedRiddleId));
        setShowSuccessModal(true);
        
        // Refresh to ensure data is in sync
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

  const handleDownloadQR = (riddle) => {
    if (!riddle.qrCodeBase64) {
      setErrorMessage("QR code not available for this riddle");
      setShowErrorModal(true);
      return;
    }

    // Convert base64 to blob and download
    const base64Data = riddle.qrCodeBase64.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${riddle.orderNumber}-${riddle.riddleName.replace(/\s+/g, '-')}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleViewRiddle = (riddleId) => {
    // View riddle as users see it (same page users get after scanning QR)
    router.push(`/viewriddles?id=${riddleId}`);
  };

  const handleEditRiddle = (riddleId) => {
    router.push(`/admin/riddles/${riddleId}`);
  };

  return (
    <AdminLayout activeTab="riddles">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-100">All Riddles</h1>
        <button
          onClick={() => router.push("/admin/riddles/create")}
          className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="size-5" />
          add Riddles
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400 border-t-transparent mb-4"></div>
          <p className="text-amber-400 font-mono text-lg animate-pulse">Loading Riddles...</p>
          <p className="text-amber-200/60 text-sm mt-2">Fetching riddle list</p>
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
                  {riddle.orderNumber}. {riddle.riddleName}
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
                  onClick={() => handleDownloadQR(riddle)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-2 text-sm text-amber-100 hover:bg-amber-900/20 rounded transition-colors"
                  title="Download QR code"
                >
                  <Download className="size-5 sm:size-4" />
                  <span className="hidden sm:inline">download</span>
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

export default function AdminRiddles() {
  return (
    <ProtectedRoute adminOnly>
      <AdminRiddlesContent />
    </ProtectedRoute>
  );
}
