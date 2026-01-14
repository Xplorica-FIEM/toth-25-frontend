import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  ImagePlus, Edit2, Trash2, QrCode, Eye, EyeOff, 
  ArrowLeft, Link2, Upload, AlertCircle, CheckCircle, X 
} from 'lucide-react';
import QRCode from 'qrcode';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import useAdminStore from '@/store/adminStore';
import { ADMIN_API_URL } from '@/utils/api';

function MemeRiddlesAdminContent() {
  const router = useRouter();
  const { memeRiddles, memeRiddlesLoading, setMemeRiddles, setMemeRiddlesLoading } = useAdminStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    caption: ''
  });
  const [errors, setErrors] = useState({});
  const [qrCodeData, setQrCodeData] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    fetchMemeRiddles();
  }, []);

  const fetchMemeRiddles = async () => {
    setMemeRiddlesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${ADMIN_API_URL}/api/meme-riddles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      setMemeRiddles(data.memeRiddles || []);
    } catch (error) {
      console.error('Error fetching meme riddles:', error);
    } finally {
      setMemeRiddlesLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Image URL is required';
    } else {
      try {
        new URL(formData.imageUrl);
      } catch {
        newErrors.imageUrl = 'Invalid URL format';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const url = editingId
        ? `${ADMIN_API_URL}/api/meme-riddles/${editingId}`
        : `${ADMIN_API_URL}/api/meme-riddles`;
      
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', imageUrl: '', caption: '' });
      fetchMemeRiddles();
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  const handleEdit = (meme) => {
    setEditingId(meme.id);
    setFormData({
      name: meme.name,
      imageUrl: meme.imageUrl,
      caption: meme.caption || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this meme riddle?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${ADMIN_API_URL}/api/meme-riddles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete');

      fetchMemeRiddles();
    } catch (error) {
      alert('Error deleting meme riddle: ' + error.message);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${ADMIN_API_URL}/api/meme-riddles/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to toggle');

      fetchMemeRiddles();
    } catch (error) {
      alert('Error toggling status: ' + error.message);
    }
  };

  const generateQRCode = async (meme) => {
    try {
      // Simple QR data - just the meme ID
      const qrData = meme.id;
      
      const qrCodeUrl = await QRCode.toDataURL(qrData, {
        width: 500,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeData({ url: qrCodeUrl, meme });
      setShowQrModal(true);
    } catch (error) {
      alert('Error generating QR code: ' + error.message);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.download = `meme-${qrCodeData.meme.name.replace(/\s+/g, '-')}.png`;
    link.href = qrCodeData.url;
    link.click();
  };

  if (memeRiddlesLoading) {
    return (
      <AdminLayout activeTab="meme-riddles">
        <div className="flex flex-col justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-400 border-t-transparent mb-4"></div>
          <p className="text-purple-400 font-mono text-lg animate-pulse">Loading Meme Riddles...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="meme-riddles">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-100">
              🎭 Meme Riddles Management
            </h1>
            <p className="text-amber-200/70 text-sm mt-1">
              Create fun surprise memes for Trails of the Hunters
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({ name: '', imageUrl: '', caption: '' });
              setErrors({});
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <ImagePlus className="w-5 h-5" />
            Add New Meme
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-linear-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-sm border-2 border-purple-700/30 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-purple-100 mb-4">
              {editingId ? 'Edit Meme Riddle' : 'Create New Meme Riddle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Meme Name */}
              <div>
                <label className="flex items-center gap-2 text-purple-200 text-sm font-medium mb-2">
                  <ImagePlus className="w-4 h-4" />
                  Meme Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({...formData, name: e.target.value});
                    setErrors({...errors, name: ''});
                  }}
                  className="w-full px-4 py-3 bg-stone-900/50 border-2 border-purple-700/30 rounded-xl text-purple-100 placeholder-purple-600/40 focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="e.g., Rick Roll Surprise, Pikachu Shock"
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Image URL */}
              <div>
                <label className="flex items-center gap-2 text-purple-200 text-sm font-medium mb-2">
                  <Link2 className="w-4 h-4" />
                  Image URL (Imgur, Cloudinary, or any public link)
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({...formData, imageUrl: e.target.value});
                    setErrors({...errors, imageUrl: ''});
                  }}
                  className="w-full px-4 py-3 bg-stone-900/50 border-2 border-purple-700/30 rounded-xl text-purple-100 placeholder-purple-600/40 focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="https://i.imgur.com/example.jpg"
                />
                {errors.imageUrl && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.imageUrl}
                  </p>
                )}
                <p className="text-purple-300/50 text-xs mt-1">
                  💡 Upload to <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" className="underline">Imgur</a> to get a direct image link
                </p>
              </div>

              {/* Caption */}
              <div>
                <label className="flex items-center gap-2 text-purple-200 text-sm font-medium mb-2">
                  💬 Caption (Optional)
                </label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({...formData, caption: e.target.value})}
                  className="w-full px-4 py-3 bg-stone-900/50 border-2 border-purple-700/30 rounded-xl text-purple-100 placeholder-purple-600/40 focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="Gotcha! You've been pranked! 😂"
                  rows="2"
                />
              </div>

              {/* Image Preview */}
              {formData.imageUrl && (
                <div>
                  <label className="text-purple-200 text-sm font-medium mb-2 block">Preview</label>
                  <div className="relative w-full max-w-md">
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview"
                      className="w-full rounded-xl border-2 border-purple-500/30"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-48 bg-stone-900/50 border-2 border-purple-700/30 rounded-xl items-center justify-center text-purple-400 text-sm">
                      Invalid image URL
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3">
                  <p className="text-red-200 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all"
                >
                  {editingId ? 'Update Meme' : 'Create Meme'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: '', imageUrl: '', caption: '' });
                    setErrors({});
                  }}
                  className="px-6 py-3 bg-stone-700 hover:bg-stone-600 text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Meme Riddles Grid */}
        {memeRiddles.length === 0 ? (
          <div className="bg-purple-900/40 border border-purple-700/30 rounded-2xl p-12 text-center">
            <ImagePlus className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
            <h3 className="text-purple-100 text-xl font-bold mb-2">No Meme Riddles Yet</h3>
            <p className="text-purple-300/70 mb-4">Create your first meme riddle to surprise your Trails of the Hunters!</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
            >
              Create First Meme
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {memeRiddles.map(meme => (
              <div 
                key={meme.id} 
                className={`bg-linear-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-sm border-2 rounded-2xl p-4 transition-all ${
                  meme.isActive ? 'border-purple-500/30' : 'border-stone-700/30 opacity-60'
                }`}
              >
                {/* Image */}
                <div className="relative mb-3">
                  <img 
                    src={meme.imageUrl} 
                    alt={meme.name}
                    className="w-full h-48 object-cover rounded-xl border-2 border-purple-500/30"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                  {!meme.isActive && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">INACTIVE</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="mb-3">
                  <h3 className="text-purple-100 font-bold text-lg mb-1">{meme.name}</h3>
                  {meme.caption && (
                    <p className="text-purple-200/70 text-sm line-clamp-2">{meme.caption}</p>
                  )}
                  <p className="text-purple-300/50 text-xs mt-2">
                    ID: {meme.id}
                  </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => generateQRCode(meme)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    QR Code
                  </button>
                  <button
                    onClick={() => handleToggleActive(meme.id, meme.isActive)}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${
                      meme.isActive 
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {meme.isActive ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Show
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(meme)}
                    className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(meme.id)}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQrModal && qrCodeData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-linear-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-lg border-2 border-purple-500/50 rounded-2xl p-6 sm:p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-purple-100">
                QR Code
              </h2>
              <button
                onClick={() => {
                  setShowQrModal(false);
                  setQrCodeData(null);
                }}
                className="text-purple-300 hover:text-purple-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="text-center mb-4">
              <p className="text-purple-200 font-medium mb-1">{qrCodeData.meme.name}</p>
              <p className="text-purple-300/70 text-sm">Meme ID: {qrCodeData.meme.id}</p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-xl mb-4">
              <img 
                src={qrCodeData.url} 
                alt="QR Code" 
                className="w-full"
              />
            </div>

            {/* Download Button */}
            <button
              onClick={downloadQRCode}
              className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all"
            >
              📥 Download QR Code
            </button>

            <p className="text-purple-300/50 text-xs text-center mt-4">
              Print this QR code and place it as a surprise!
            </p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default function MemeRiddlesAdmin() {
  return (
    <ProtectedRoute adminOnly>
      <MemeRiddlesAdminContent />
    </ProtectedRoute>
  );
}
