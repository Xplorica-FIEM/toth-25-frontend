import { Scroll, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { useState } from "react";

export default function RiddleList() {
  const [riddles, setRiddles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    hint: ""
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({ question: "", answer: "", hint: "" });
    setEditingIndex(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.question || !formData.answer) {
      setMessage({ type: "error", text: "Question & Answer required" });
      return;
    }

    if (editingIndex !== null) {
      // Update existing
      const updated = [...riddles];
      updated[editingIndex] = { ...formData };
      setRiddles(updated);
      setMessage({ type: "success", text: "Riddle updated!" });
    } else {
      // Add new
      setRiddles([...riddles, { ...formData }]);
      setMessage({ type: "success", text: "Riddle added!" });
    }

    resetForm();
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleEdit = (index) => {
    setFormData({ ...riddles[index] });
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = (index) => {
    if (!confirm("Delete this riddle?")) return;
    const updated = riddles.filter((_, i) => i !== index);
    setRiddles(updated);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen relative bg-stone-900 text-amber-100 p-6">
      <header className="text-center mb-12">
        <Scroll className="mx-auto size-14 text-amber-400 animate-pulse" />
        <h1 className="text-4xl font-bold mt-4">Riddle Vault</h1>
        <p className="text-amber-100/70 mt-2">
          Frontend-only Riddle Management
        </p>
      </header>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg text-center ${
            message.type === "success"
              ? "bg-green-500/20 text-green-100"
              : "bg-red-500/20 text-red-100"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-600 px-5 py-3 rounded-lg flex gap-2"
        >
          {showForm ? <X /> : <Plus />}
          {showForm ? "Cancel" : "Add Riddle"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-amber-900/60 border border-amber-700/50 rounded-xl p-6 mb-10"
        >
          <input
            name="question"
            value={formData.question}
            onChange={handleChange}
            placeholder="Riddle Question"
            className="w-full mb-4 p-3 rounded bg-stone-800 text-amber-100"
            required
          />
          <input
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            placeholder="Answer"
            className="w-full mb-4 p-3 rounded bg-stone-800 text-amber-100"
            required
          />
          <input
            name="hint"
            value={formData.hint}
            onChange={handleChange}
            placeholder="Hint (optional)"
            className="w-full mb-4 p-3 rounded bg-stone-800 text-amber-100"
          />
          <button
            type="submit"
            className="bg-green-600 px-6 py-3 rounded-lg text-white flex gap-2"
          >
            <Save /> {editingIndex !== null ? "Update" : "Save"}
          </button>
        </form>
      )}

      <div className="bg-amber-900/60 rounded-xl overflow-hidden">
        {riddles.length === 0 ? (
          <p className="p-6 text-center text-amber-100/70">
            No riddles added yet.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-amber-800/40">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Question</th>
                <th className="p-4">Answer</th>
                <th className="p-4">Hint</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {riddles.map((r, i) => (
                <tr key={i} className="border-t border-amber-700/30">
                  <td className="p-4">{i + 1}</td>
                  <td className="p-4">{r.question}</td>
                  <td className="p-4 text-green-400">{r.answer}</td>
                  <td className="p-4">{r.hint || "-"}</td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(i)}
                      className="text-blue-300"
                    >
                      <Edit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(i)}
                      className="text-red-300"
                    >
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
