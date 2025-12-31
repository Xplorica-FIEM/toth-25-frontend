// pages/admin/riddles.jsx - Admin Riddles Management Page
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Plus, Trash2, Download, Edit, Eye } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { getAdminRiddles, deleteRiddle } from "@/utils/api";
import Loader from "../loadinganimation";

function AdminRiddlesContent() {
  const router = useRouter();
  const [riddles, setRiddles] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (!confirm("Are you sure you want to delete this riddle?")) return;
    try {
      const response = await deleteRiddle(riddleId);
      if (response.ok) {
        alert("Riddle deleted successfully");
        fetchRiddles();
      }
    } catch (error) {
      alert("Failed to delete riddle");
    }
  };

  const handleDownloadQR = (riddle) => {
    if (!riddle.qrCodeBase64) {
      alert("QR code not available for this riddle");
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
    router.push(`/admin/riddles/${riddleId}`);
  };

  const handleEditRiddle = (riddleId) => {
    router.push(`/admin/riddles/edit/${riddleId}`);
  };

  if (loading) {
    return (
      <AdminLayout activeTab="riddles">
        <div className="flex items-center justify-center h-96">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

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

      <div className="space-y-3">
        {riddles?.map((riddle) => (
          <div
            key={riddle.id}
            className="bg-stone-900 border border-stone-800 rounded-lg p-4 hover:border-amber-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <span className="text-lg font-semibold text-amber-100">
                  {riddle.orderNumber}. {riddle.riddleName}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleEditRiddle(riddle.id)}
                  className="px-4 py-2 text-amber-100 hover:text-amber-300 transition-colors font-medium"
                  title="Edit riddle"
                >
                  edit
                </button>
                <button
                  onClick={() => handleDownloadQR(riddle)}
                  className="px-4 py-2 text-amber-100 hover:text-amber-300 transition-colors font-medium"
                  title="Download QR code"
                >
                  download
                </button>
                <button
                  onClick={() => handleViewRiddle(riddle.id)}
                  className="px-4 py-2 text-amber-100 hover:text-amber-300 transition-colors font-medium"
                  title="View riddle details"
                >
                  view riddles
                </button>
                <button
                  onClick={() => handleDeleteRiddle(riddle.id)}
                  className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors font-medium"
                  title="Delete riddle"
                >
                  delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
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
