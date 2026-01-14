// pages/admin/riddles/[id].jsx - Edit Riddle Page
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Type, Upload, ChevronUp, ChevronDown } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import ConfirmModal from "@/components/ConfirmModal";
import { getAdminRiddleById, updateRiddle } from "@/utils/api";

function EditRiddleContent() {
  const router = useRouter();
  const { id } = router.query;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [riddle, setRiddle] = useState(null);
  const [formData, setFormData] = useState({
    riddleName: "",
    components: [],
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
      const response = await getAdminRiddleById(id);
      if (response.ok && response.data.riddle) {
        const currentRiddle = response.data.riddle;
        setRiddle(currentRiddle);
        
        let parsedComponents = [{ type: "text", data: currentRiddle.puzzleText || "" }];
        try {
          if (currentRiddle.puzzleText && (currentRiddle.puzzleText.startsWith("[") || currentRiddle.puzzleText.startsWith("{"))) {
            const parsed = JSON.parse(currentRiddle.puzzleText);
            if (Array.isArray(parsed)) {
              parsedComponents = parsed;
            }
          }
        } catch (e) {
          console.log("Legacy riddle format detected");
        }

        setFormData({
          riddleName: currentRiddle.riddleName,
          components: parsedComponents,
          isActive: currentRiddle.isActive,
        });
      } else {
        setErrorMessage(response.data?.error || "Riddle not found");
        setShowErrorModal(true);
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

  const addComponent = (type) => {
    setFormData({
      ...formData,
      components: [...formData.components, { type, data: "" }],
    });
  };

  const removeComponent = (index) => {
    const newComponents = [...formData.components];
    newComponents.splice(index, 1);
    setFormData({ ...formData, components: newComponents });
  };

  const updateComponent = (index, data) => {
    const newComponents = [...formData.components];
    newComponents[index].data = data;
    setFormData({ ...formData, components: newComponents });
  };

  const moveComponent = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formData.components.length - 1) return;

    const newComponents = [...formData.components];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newComponents[index], newComponents[targetIndex]] = [newComponents[targetIndex], newComponents[index]];
    setFormData({ ...formData, components: newComponents });
  };

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      setErrorMessage("Image size should be less than 500KB");
      setShowErrorModal(true);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateComponent(index, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.riddleName.trim()) {
      setErrorMessage("Riddle name is required");
      setShowErrorModal(true);
      return;
    }

    if (formData.components.length === 0) {
      setErrorMessage("At least one component is required");
      setShowErrorModal(true);
      return;
    }

    const hasEmpty = formData.components.some(c => !c.data);
    if (hasEmpty) {
      setErrorMessage("All components must have content or an image");
      setShowErrorModal(true);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        riddleName: formData.riddleName,
        puzzleText: JSON.stringify(formData.components),
        isActive: formData.isActive
      };

      const response = await updateRiddle(id, payload);
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
    const currentPuzzleText = JSON.stringify(formData.components);
    if (riddle && (
      formData.riddleName !== riddle.riddleName ||
      currentPuzzleText !== riddle.puzzleText ||
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

          {/* Riddle Content (Multi-part) */}
          <div className="space-y-4">
            <label className="block text-amber-100 font-medium mb-2">
              Riddle Content (Multi-part)
              <span className="text-red-400 ml-1">*</span>
            </label>
            
            {formData.components.map((comp, index) => (
              <div key={index} className="relative group bg-stone-800/50 p-4 rounded-xl border border-stone-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {comp.type === 'text' ? (
                      <Type className="size-4 text-amber-400" />
                    ) : (
                      <ImageIcon className="size-4 text-blue-400" />
                    )}
                    <span className="text-xs font-mono text-stone-400 uppercase tracking-widest">
                      {comp.type} Component
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveComponent(index, 'up')}
                      disabled={index === 0}
                      className="p-1 px-2 text-stone-500 hover:text-amber-400 hover:bg-stone-900 rounded transition-colors disabled:opacity-0"
                      title="Move Up"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveComponent(index, 'down')}
                      disabled={index === formData.components.length - 1}
                      className="p-1 px-2 text-stone-500 hover:text-amber-400 hover:bg-stone-900 rounded transition-colors disabled:opacity-0"
                      title="Move Down"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeComponent(index)}
                      className="p-1 px-2 text-stone-500 hover:text-red-400 hover:bg-stone-900 rounded transition-colors ml-1"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                {comp.type === 'text' ? (
                  <textarea
                    value={comp.data}
                    onChange={(e) => updateComponent(index, e.target.value)}
                    placeholder="Enter riddle text here..."
                    rows={4}
                    className="w-full p-3 rounded bg-stone-900 text-white border border-stone-700 focus:border-amber-500 focus:outline-none text-sm"
                  />
                ) : (
                  <div className="space-y-3">
                    {comp.data ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-stone-700 bg-black">
                        <img src={comp.data} alt="Preview" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => updateComponent(index, "")}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-700 rounded-lg cursor-pointer hover:bg-stone-800/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="size-8 text-stone-500 mb-2" />
                          <p className="text-xs text-stone-400">Click to upload image (Max 2MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e)}
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => addComponent("text")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded-lg border border-stone-700 transition-all text-sm font-medium"
              >
                <Plus className="size-4" />
                Add Text
              </button>
              <button
                type="button"
                onClick={() => addComponent("image")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded-lg border border-stone-700 transition-all text-sm font-medium"
              >
                <Plus className="size-4" />
                Add Image
              </button>
            </div>
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
