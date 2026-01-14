// pages/admin/delete-scans.jsx
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getAdminUsers, deleteUserScans } from "@/utils/api";
import { Trash2, Search, User, AlertTriangle, Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DeleteUserScansPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchUsers = async () => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getAdminUsers(1, 10, search);
      if (res.ok && res.data?.users) {
        setUsers(res.data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Search users error:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDeleteScans = async (userId, userName) => {
    if (
      !confirm(
        `Are you sure you want to delete ALL scan records for ${userName}? This action cannot be undone and will reset their game progress.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await deleteUserScans(userId);
      if (res.ok) {
        setMessage({ type: "success", text: `Successfully deleted all scans for ${userName}` });
        // Refresh the user list to show updated stats if any
        fetchUsers();
      } else {
        setMessage({ type: "error", text: res.data?.error || "Failed to delete scans" });
      }
    } catch (err) {
      console.error("Delete scans error:", err);
      setMessage({ type: "error", text: "A network error occurred" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <AdminLayout activeTab="delete-scans">
        <div className="max-w-4xl mx-auto p-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-amber-100 mb-2 flex items-center gap-3">
              <Trash2 className="text-red-500" />
              Delete User Scans
            </h1>
            <p className="text-amber-200/60">
              Search for a user to permanently delete all their recorded scans and reset their game session.
            </p>
          </div>

          {/* Search Header */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 size-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                className="w-full bg-stone-950 border border-stone-800 rounded-lg py-3 pl-12 pr-4 text-amber-100 focus:outline-none focus:border-amber-500/50 transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {loading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-amber-500/70 font-mono text-sm">
                <Loader2 className="animate-spin size-4" />
                Searching users...
              </div>
            )}
          </div>

          {/* Message Display */}
          {message.text && (
            <div
              className={`mb-8 p-4 rounded-lg flex items-center gap-3 border ${
                message.type === "success"
                  ? "bg-green-900/20 border-green-800/50 text-green-400"
                  : "bg-red-900/20 border-red-800/50 text-red-400"
              }`}
            >
              <AlertTriangle className="shrink-0 size-5" />
              <p>{message.text}</p>
            </div>
          )}

          {/* Results */}
          <div className="space-y-4">
            {users.length > 0 ? (
              users.map((user) => (
                <div
                  key={user.id}
                  className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-stone-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <User className="text-amber-500 size-6" />
                    </div>
                    <div>
                      <h3 className="text-amber-100 font-semibold text-lg">{user.fullName || "No Name"}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-400">
                        <span>{user.email}</span>
                        <span className="text-stone-600">|</span>
                        <span>{user.phoneNumber || "No Phone"}</span>
                        <span className="text-stone-600">|</span>
                        <span>{user.classRollNo || "No Roll No"}</span>
                      </div>
                      <div className="mt-2 flex gap-4 text-xs font-mono">
                        <span className="text-amber-500/70">
                          Unique Scans: {user.stats?.uniqueRiddles || 0}
                        </span>
                        <span className="text-amber-500/70">
                          Total Scans: {user.stats?.totalScans || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteScans(user.id, user.fullName)}
                    disabled={isDeleting}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-900/50 hover:border-red-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={18} />
                    {isDeleting ? "Deleting..." : "Delete All Scans"}
                  </button>
                </div>
              ))
            ) : search.trim() && !loading ? (
              <div className="text-center py-12 bg-stone-900/50 border border-stone-800/50 border-dashed rounded-xl">
                <Search className="mx-auto size-12 text-stone-700 mb-4" />
                <p className="text-stone-500">No users found matching "{search}"</p>
              </div>
            ) : !search.trim() ? (
              <div className="text-center py-12">
                <p className="text-stone-600 font-mono">Enter a search query to find users</p>
              </div>
            ) : null}
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
