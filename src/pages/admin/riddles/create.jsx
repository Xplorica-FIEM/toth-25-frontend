// pages/admin/riddles/create.jsx - Create new riddle
import { useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Save } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmModal from "@/components/ConfirmModal";
import { createRiddle } from "@/utils/api";

function CreateRiddleContent() {
  const router = useRouter();
  const [form, setForm] = useState({
    riddleName: "",
    puzzleText: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await createRiddle({
        riddleName: form.riddleName,
        puzzleText: form.puzzleText,
      });

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        setError(response.data.error || "Failed to create riddle");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (form.riddleName.trim() || form.puzzleText.trim()) {
      setShowDiscardModal(true);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-black/85" />

      <div className="relative z-10 min-h-screen px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleDiscard}
            className="flex items-center gap-2 text-amber-300 hover:text-amber-100 mb-6 transition-colors"
          >
            <ArrowLeft className="size-5" />
            Back
          </button>

          <div className="bg-linear-to-br from-stone-900/90 to-stone-800/90 rounded-2xl border border-stone-700/50 p-8">
            <h1 className="text-amber-100 text-2xl font-bold mb-6">
              Create New Riddle
            </h1>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-amber-200 text-sm font-semibold block mb-2">
                  Riddle Name (Admin Identifier) *
                </label>
                <input
                  type="text"
                  name="riddleName"
                  value={form.riddleName}
                  onChange={handleChange}
                  required
                  placeholder="The Beginning"
                  className="w-full p-3 rounded bg-black/40 text-white border border-amber-900/50 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-amber-200 text-sm font-semibold block mb-2">
                  Puzzle Text (What users see) *
                </label>
                <textarea
                  name="puzzleText"
                  value={form.puzzleText}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="I speak without a mouth and hear without ears..."
                  className="w-full p-3 rounded bg-black/40 text-white border border-amber-900/50 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="size-5" />
                {loading ? "Creating..." : "Create Riddle"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <ConfirmModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push("/admin/riddles");
        }}
        onConfirm={() => router.push("/admin/riddles")}
        title="Riddle Created Successfully!"
        message="Your riddle has been created and a QR code has been generated."
        confirmText="View All Riddles"
        cancelText="Close"
        type="success"
      />

      {/* Discard Confirmation Modal */}
      <ConfirmModal
        isOpen={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        onConfirm={() => router.back()}
        title="Discard Changes?"
        message="Are you sure you want to leave? Your unsaved changes will be lost."
        confirmText="Discard"
        cancelText="Keep Editing"
        type="warning"
      />
    </div>
  );
}

export default function CreateRiddle() {
  return (
    <ProtectedRoute>
      <CreateRiddleContent />
    </ProtectedRoute>
  );
}

