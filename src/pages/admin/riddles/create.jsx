// pages/admin/riddles/create.jsx - Create new riddle
import { useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Type, Upload, ChevronUp, ChevronDown } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmModal from "@/components/ConfirmModal";
import { createRiddle } from "@/utils/api";

function CreateRiddleContent() {
  const router = useRouter();
  const [form, setForm] = useState({
    riddleName: "",
    components: [{ type: "text", data: "" }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const addComponent = (type) => {
    setForm({
      ...form,
      components: [...form.components, { type, data: "" }],
    });
  };

  const removeComponent = (index) => {
    const newComponents = [...form.components];
    newComponents.splice(index, 1);
    setForm({ ...form, components: newComponents });
  };

  const updateComponent = (index, data) => {
    const newComponents = [...form.components];
    newComponents[index].data = data;
    setForm({ ...form, components: newComponents });
  };

  const moveComponent = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === form.components.length - 1) return;

    const newComponents = [...form.components];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newComponents[index], newComponents[targetIndex]] = [newComponents[targetIndex], newComponents[index]];
    setForm({ ...form, components: newComponents });
  };

  const handleImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError("Image size should be less than 1MB");
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
    setError("");

    // Validation
    if (!form.riddleName.trim()) {
      setError("Riddle name is required");
      return;
    }

    if (form.components.length === 0) {
      setError("At least one component is required");
      return;
    }

    const hasEmpty = form.components.some(c => !c.data);
    if (hasEmpty) {
      setError("All components must have content or an image");
      return;
    }

    setLoading(true);

    try {
      const response = await createRiddle({
        riddleName: form.riddleName,
        puzzleText: JSON.stringify(form.components),
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
    const hasContent = form.riddleName.trim() || form.components.some(c => c.data.trim());
    if (hasContent) {
      setShowDiscardModal(true);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-black/85" />

      <div className="relative z-10 min-h-screen px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleDiscard}
            className="flex items-center gap-2 text-amber-300 hover:text-amber-100 mb-6 transition-colors"
          >
            <ArrowLeft className="size-5" />
            Back
          </button>

          <div className="bg-linear-to-br from-stone-900/90 to-stone-800/90 rounded-2xl border border-stone-700/50 p-8">
            <h1 className="text-amber-100 text-2xl font-bold mb-6">
              Create New Multi-Part Riddle
            </h1>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="space-y-4">
                <label className="text-amber-200 text-sm font-semibold block">
                  Riddle Content (Multi-part) *
                </label>
                
                {form.components.map((comp, index) => (
                  <div key={index} className="relative group bg-black/30 p-4 rounded-xl border border-stone-700/50">
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
                          className="p-1 px-2 text-stone-500 hover:text-amber-400 hover:bg-stone-800 rounded transition-colors disabled:opacity-0"
                          title="Move Up"
                        >
                          <ChevronUp className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveComponent(index, 'down')}
                          disabled={index === form.components.length - 1}
                          className="p-1 px-2 text-stone-500 hover:text-amber-400 hover:bg-stone-800 rounded transition-colors disabled:opacity-0"
                          title="Move Down"
                        >
                          <ChevronDown className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeComponent(index)}
                          className="p-1 px-2 text-stone-500 hover:text-red-400 hover:bg-stone-800 rounded transition-colors ml-1"
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
                        rows={3}
                        className="w-full p-3 rounded bg-black/40 text-white border border-amber-900/30 focus:border-amber-500 focus:outline-none text-sm"
                      />
                    ) : (
                      <div className="space-y-3">
                        {comp.data ? (
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-stone-700">
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
                              <p className="text-xs text-stone-400">Click to upload image (Max 1MB)</p>
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
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded-xl border border-stone-700 transition-all text-sm font-medium"
                  >
                    <Plus className="size-4" />
                    Add Text
                  </button>
                  <button
                    type="button"
                    onClick={() => addComponent("image")}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-200 rounded-xl border border-stone-700 transition-all text-sm font-medium"
                  >
                    <Plus className="size-4" />
                    Add Image
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-8 shadow-lg shadow-green-900/20"
              >
                <Save className="size-5" />
                {loading ? "Creating Riddle..." : "Publish Riddle"}
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

