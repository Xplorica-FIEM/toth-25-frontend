// pages/admin/riddles/create.jsx - Create new riddle
import { useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Save } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { createRiddle } from "@/utils/api";

function CreateRiddleContent() {
  const router = useRouter();
  const [form, setForm] = useState({
    riddleName: "",
    puzzleText: "",
    orderNumber: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        orderNumber: parseInt(form.orderNumber),
      });

      if (response.ok) {
        alert("Riddle created successfully!");
        router.push("/admin/riddles");
      } else {
        setError(response.data.error || "Failed to create riddle");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-black/85" />

      <div className="relative z-10 min-h-screen px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.back()}
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

              <div>
                <label className="text-amber-200 text-sm font-semibold block mb-2">
                  Order Number *
                </label>
                <input
                  type="number"
                  name="orderNumber"
                  value={form.orderNumber}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="1"
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
    </div>
  );
}

export default function CreateRiddle() {
  return (
    <ProtectedRoute adminOnly>
      <CreateRiddleContent />
    </ProtectedRoute>
  );
}

