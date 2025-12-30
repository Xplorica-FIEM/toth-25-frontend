// pages/admin/riddles.jsx - Admin Riddles Management Page
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Plus, Trash2 } from "lucide-react";
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
      if (riddlesRes.ok && riddlesRes.data.data) setRiddles(riddlesRes.data.data);
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
        <h1 className="text-3xl font-bold text-amber-100">Riddles Management</h1>
        <button
          onClick={() => router.push("/admin/riddles/create")}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <Plus className="size-5" />
          Create Riddle
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {riddles?.map((riddle) => (
          <div
            key={riddle.id}
            className="bg-stone-900 border border-stone-800 rounded-xl p-6 hover:border-amber-700 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-amber-900/30 text-amber-300 rounded-lg text-sm font-bold">
                    #{riddle.orderNumber}
                  </span>
                  <h3 className="text-xl font-bold text-amber-100">{riddle.riddleName}</h3>
                </div>
                <p className="text-amber-100 leading-relaxed whitespace-pre-wrap">{riddle.puzzleText}</p>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => handleDeleteRiddle(riddle.id)}
                  className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete riddle"
                >
                  <Trash2 className="size-5" />
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
