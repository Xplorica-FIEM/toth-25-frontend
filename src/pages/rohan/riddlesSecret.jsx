import { Compass, Plus, Trash2, Edit2, Save, X, Scroll } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function RiddlesSecret() {
  const [riddles, setRiddles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    hint: ''
  });

  // Fetch all riddles
  useEffect(() => {
    fetchRiddles();
  }, []);

  const fetchRiddles = async () => {
    try {
      const response = await fetch('http://localhost:4000/riddles');
      const data = await response.json();
      setRiddles(data.riddles || []);
      setLoading(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch riddles' });
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question || !formData.answer) {
      setMessage({ type: 'error', text: 'Question and Answer are required' });
      return;
    }

    try {
      const url = editingId 
        ? `http://localhost:4000/riddles/${editingId}`
        : 'http://localhost:4000/riddles';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: editingId ? 'Riddle updated successfully!' : 'Riddle added successfully!' 
        });
        setFormData({ question: '', answer: '', hint: '' });
        setShowAddForm(false);
        setEditingId(null);
        fetchRiddles();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to save riddle' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Could not connect to server' });
    }
  };

  const handleEdit = (riddle) => {
    setFormData({
      question: riddle.question,
      answer: riddle.answer,
      hint: riddle.hint || ''
    });
    setEditingId(riddle.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this riddle?')) return;

    try {
      const response = await fetch(`http://localhost:4000/riddles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Riddle deleted successfully!' });
        fetchRiddles();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete riddle' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Could not connect to server' });
    }
  };

  const cancelEdit = () => {
    setFormData({ question: '', answer: '', hint: '' });
    setEditingId(null);
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1618385418700-35dc948cdeec')"
        }}
      />
      <div className="fixed inset-0 bg-black/65 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 min-h-screen px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <Scroll className="size-14 text-amber-400 animate-pulse" />
              <h1 className="text-5xl font-bold text-amber-100">Secret Riddles Vault</h1>
            </div>
            <p className="text-amber-100/70 text-lg">
              Developer Panel - Manage Treasure Hunt Riddles
            </p>
          </header>

          {/* Success/Error Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg text-center ${
              message.type === 'success' 
                ? 'bg-green-500/20 text-green-100 border border-green-500/50' 
                : 'bg-red-500/20 text-red-100 border border-red-500/50'
            }`}>
              {message.text}
            </div>
          )}

          {/* Add Riddle Button */}
          <div className="mb-8 flex justify-end">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="group relative bg-gradient-to-br from-amber-600 to-amber-800 text-white px-6 py-3 rounded-lg font-semibold hover:from-amber-500 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-amber-500/50 flex items-center gap-2"
            >
              {showAddForm ? (
                <>
                  <X className="w-5 h-5" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add New Riddle
                </>
              )}
            </button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="group relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-amber-900/20 rounded-2xl blur-2xl opacity-100 transition-opacity duration-500" />
              
              <form 
                onSubmit={handleSubmit}
                className="relative bg-gradient-to-br from-amber-900/60 to-stone-900/60 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-amber-700/50"
              >
                <h2 className="text-2xl font-bold text-amber-100 mb-6">
                  {editingId ? 'Edit Riddle' : 'Add New Riddle'}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-amber-100/80 mb-2 text-sm font-semibold">
                      Riddle Question *
                    </label>
                    <textarea
                      name="question"
                      value={formData.question}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-3 bg-stone-900/50 border border-amber-700/30 rounded-lg text-amber-100 placeholder-amber-100/30 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                      placeholder="Enter the riddle question..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-amber-100/80 mb-2 text-sm font-semibold">
                      Answer *
                    </label>
                    <input
                      type="text"
                      name="answer"
                      value={formData.answer}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-stone-900/50 border border-amber-700/30 rounded-lg text-amber-100 placeholder-amber-100/30 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                      placeholder="Enter the answer..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-amber-100/80 mb-2 text-sm font-semibold">
                      Hint (Optional)
                    </label>
                    <input
                      type="text"
                      name="hint"
                      value={formData.hint}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-stone-900/50 border border-amber-700/30 rounded-lg text-amber-100 placeholder-amber-100/30 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                      placeholder="Enter a hint..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-br from-green-600 to-green-800 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-500 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {editingId ? 'Update Riddle' : 'Save Riddle'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-3 bg-stone-700/50 text-amber-100 rounded-lg font-semibold hover:bg-stone-700 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Riddles Table */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-amber-900/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative bg-gradient-to-br from-amber-900/60 to-stone-900/60 backdrop-blur-md rounded-2xl shadow-2xl border border-amber-700/50 overflow-hidden">
              <div className="p-6 border-b border-amber-700/50">
                <h2 className="text-2xl font-bold text-amber-100">
                  All Riddles ({riddles.length})
                </h2>
              </div>

              {loading ? (
                <div className="p-12 text-center text-amber-100/70">
                  Loading riddles...
                </div>
              ) : riddles.length === 0 ? (
                <div className="p-12 text-center text-amber-100/70">
                  No riddles found. Add your first riddle!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-amber-900/40">
                      <tr>
                        <th className="px-6 py-4 text-left text-amber-100 font-semibold">S.No</th>
                        <th className="px-6 py-4 text-left text-amber-100 font-semibold">Riddle</th>
                        <th className="px-6 py-4 text-left text-amber-100 font-semibold">Answer</th>
                        <th className="px-6 py-4 text-left text-amber-100 font-semibold">Hint</th>
                        <th className="px-6 py-4 text-left text-amber-100 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-700/30">
                      {riddles.map((riddle, index) => (
                        <tr 
                          key={riddle.id}
                          className="hover:bg-amber-900/20 transition-colors"
                        >
                          <td className="px-6 py-4 text-amber-100/90 font-semibold">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 text-amber-100/90 max-w-md">
                            {riddle.question}
                          </td>
                          <td className="px-6 py-4 text-green-400 font-semibold">
                            {riddle.answer}
                          </td>
                          <td className="px-6 py-4 text-amber-100/70 italic">
                            {riddle.hint || '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(riddle)}
                                className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(riddle.id)}
                                className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Developer Note */}
          <div className="mt-8 p-4 bg-amber-900/30 border border-amber-700/50 rounded-lg text-center text-amber-100/60 text-sm">
            🔒 This is a developer-only page. Access via direct URL routing.
          </div>
        </div>
      </div>
    </div>
  );
}
