// pages/admin/riddles/[id].jsx - Edit Riddle Page
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Save } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import ConfirmModal from "@/components/ConfirmModal";
import { getAdminRiddles, updateRiddle } from "@/utils/api";

function EditRiddleContent() {
  const router = useRouter();
  const { id } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [riddle, setRiddle] = useState(null);
  const [formData, setFormData] = useState({
    riddleName: "",
    puzzleText: "",
    isActive: true,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (id) {
      fetchRiddle();
    }
  }, [id]);

  const fetchRiddle = async () => {
    setLoading(true);
    try {
      const response = await getAdminRiddles();
      if (response.ok && response.data.riddles) {
        const currentRiddle = response.data.riddles.find(r => r.id === id);
        if (currentRiddle) {
          setRiddle(currentRiddle);
          setFormData({
            riddleName: currentRiddle.riddleName,
            puzzleText: currentRiddle.puzzleText,
            isActive: currentRiddle.isActive,
          });
        } else {
          setErrorMessage("Riddle not found");
          setShowErrorModal(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch riddle:", error);
      setErrorMessage("Failed to load riddle");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.riddleName.trim() || !formData.puzzleText.trim()) {
      setErrorMessage("Riddle name and puzzle text are required");
      setShowErrorModal(true);
      return;
    }

    setSaving(true);
    try {
      const response = await updateRiddle(id, formData);
      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        setErrorMessage(response.data?.error || "Unknown error");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Update error:", error);
      setErrorMessage("Failed to update riddle. Please try again.");
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    // Check if form has been modified
    if (riddle && (
      formData.riddleName !== riddle.riddleName ||
      formData.puzzleText !== riddle.puzzleText ||

      formData.isActive !== riddle.isActive
    )) {
      setShowDiscardModal(true);
    } else {
      router.push("/admin/riddles");
    }
  };

  if (loading) {
    return (
      <AdminLayout activeTab="riddles">
        <div className="flex items-center justify-center h-96">
          <div className="text-amber-100 text-lg">Loading riddle...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="riddles">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push("/admin/riddles")}
            className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="size-6 text-amber-400" />
          </button>
          <h1 className="text-3xl font-bold text-amber-100">Edit Riddle</h1>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Riddle Name */}
          <div>
            <label className="block text-amber-100 font-medium mb-2">
              Riddle Name
              <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="text"
              name="riddleName"
              value={formData.riddleName}
              onChange={handleChange}
              placeholder="Enter riddle name (for admin reference)"
              className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-amber-100 placeholder-amber-200/40 focus:outline-none focus:border-amber-600"
              required
            />
          </div>

          {/* Puzzle Text */}
          <div>
            <label className="block text-amber-100 font-medium mb-2">
              Puzzle Text
              <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              name="puzzleText"
              value={formData.puzzleText}
              onChange={handleChange}
              placeholder="Enter the riddle/puzzle that users will see"
              rows={8}
              className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-amber-100 placeholder-amber-200/40 focus:outline-none focus:border-amber-600 resize-none"
              required
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3 p-4 bg-stone-800/50 rounded-lg border border-stone-700">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5 rounded bg-stone-700 border-stone-600 text-amber-600 focus:ring-amber-600 focus:ring-offset-stone-900"
            />
            <label htmlFor="isActive" className="text-amber-100 font-medium cursor-pointer">
              Active (users can scan this riddle)
            </label>
          </div>

          {/* QR Code Info */}
          {riddle?.qrCodeBase64 && (
            <div className="p-4 bg-stone-800/50 rounded-lg border border-stone-700">
              <p className="text-amber-100 font-medium mb-2">QR Code</p>
              <div className="flex items-center gap-4">
                <img 
                  src={riddle.qrCodeBase64} 
                  alt="QR Code" 
                  className="w-32 h-32 bg-white p-2 rounded"
                />
                <p className="text-amber-200/60 text-sm">
                  QR code was generated when the riddle was created. It cannot be edited.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleDiscard}
              className="flex-1 px-6 py-3 bg-stone-700 hover:bg-stone-600 text-white rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-900 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              <Save className="size-5" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <ConfirmModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/admin/riddles");
        }}
        onConfirm={() => router.push("/admin/riddles")}
        title="Riddle Updated Successfully!"
        message="Your changes have been saved."
        confirmText="View All Riddles"
        cancelText="Close"
        type="success"
      />

      {/* Error Modal */}
      <ConfirmModal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          if (errorMessage === "Riddle not found" || errorMessage === "Failed to load riddle") {
            router.push("/admin/riddles");
          }
        }}
        onConfirm={() => {
          setShowErrorModal(false);
          if (errorMessage === "Riddle not found" || errorMessage === "Failed to load riddle") {
            router.push("/admin/riddles");
          }
        }}
        title="Error"
        message={errorMessage}
        confirmText="OK"
        cancelText="Close"
        type="error"
      />

      {/* Discard Confirmation Modal */}
      <ConfirmModal
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        onConfirm={() => router.push("/admin/riddles")}
        title="Discard Changes?"
        message="Are you sure you want to leave? Your unsaved changes will be lost."
        confirmText="Discard"
        cancelText="Keep Editing"
        type="warning"
      />
    </AdminLayout>
  );
}

export default function EditRiddle() {
  return (
    <ProtectedRoute >
      <EditRiddleContent />
    </ProtectedRoute>
  );
}
