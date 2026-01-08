// pages/admin/index.jsx - Admin dashboard
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  ArrowLeft,
  Users,
  Scroll,
  BarChart3,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  getAdminRiddles,
  getAdminUsers,
  getAdminStats,
  deleteRiddle,
  deleteUser,
} from "@/utils/api";

function AdminDashboardContent() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [riddles, setRiddles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats"); // stats, riddles, users

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, riddlesRes, usersRes] = await Promise.all([
        getAdminStats(),
        getAdminRiddles(),
        getAdminUsers(),
      ]);

      if (statsRes.ok) setStats(statsRes.data.data);
      if (riddlesRes.ok && riddlesRes.data.data) setRiddles(riddlesRes.data.data);
      if (usersRes.ok && usersRes.data.data) setUsers(usersRes.data.data);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
      // Keep empty arrays on error
      setRiddles([]);
      setUsers([]);
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
        fetchAdminData();
      } else {
        alert(response.data.error || "Failed to delete riddle");
      }
    } catch (error) {
      alert("Error deleting riddle");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await deleteUser(userId);
      if (response.ok) {
        alert("User deleted successfully");
        fetchAdminData();
      } else {
        alert(response.data.error || "Failed to delete user");
      }
    } catch (error) {
      alert("Error deleting user");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-stone-950 via-stone-900 to-amber-950">
      <div className="min-h-screen px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-amber-300 hover:text-amber-100 mb-4 transition-colors"
            >
              <ArrowLeft className="size-5" />
              Back to Dashboard
            </button>

            <div className="flex items-center gap-3 mb-2">
              <Shield className="size-10 text-purple-400" />
              <h1 className="text-amber-100 text-3xl font-bold">
                Admin Panel
              </h1>
            </div>
            <p className="text-amber-200/80">
              Manage riddles, users, and view statistics
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "stats"
                  ? "bg-amber-600 text-white"
                  : "bg-stone-800/60 text-amber-200 hover:bg-stone-700/60"
              }`}
            >
              <BarChart3 className="inline-block size-5 mr-2" />
              Statistics
            </button>
            <button
              onClick={() => setActiveTab("riddles")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "riddles"
                  ? "bg-amber-600 text-white"
                  : "bg-stone-800/60 text-amber-200 hover:bg-stone-700/60"
              }`}
            >
              <Scroll className="inline-block size-5 mr-2" />
              Riddles ({riddles?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "users"
                  ? "bg-amber-600 text-white"
                  : "bg-stone-800/60 text-amber-200 hover:bg-stone-700/60"
              }`}
            >
              <Users className="inline-block size-5 mr-2" />
              Users ({users?.length || 0})
            </button>
          </div>

          {/* Stats Tab */}
          {activeTab === "stats" && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-linear-to-br from-blue-900/60 to-stone-900/60 rounded-xl border border-blue-700/50 p-6">
                <Users className="size-10 text-blue-400 mb-3" />
                <p className="text-blue-200/70 text-sm">Total Users</p>
                <p className="text-blue-100 text-3xl font-bold">
                  {stats.totalUsers}
                </p>
              </div>

              <div className="bg-linear-to-br from-purple-900/60 to-stone-900/60 rounded-xl border border-purple-700/50 p-6">
                <Scroll className="size-10 text-purple-400 mb-3" />
                <p className="text-purple-200/70 text-sm">Total Riddles</p>
                <p className="text-purple-100 text-3xl font-bold">
                  {stats.totalRiddles}
                </p>
              </div>

              <div className="bg-linear-to-br from-green-900/60 to-stone-900/60 rounded-xl border border-green-700/50 p-6">
                <BarChart3 className="size-10 text-green-400 mb-3" />
                <p className="text-green-200/70 text-sm">Total Scans</p>
                <p className="text-green-100 text-3xl font-bold">
                  {stats.totalScans}
                </p>
              </div>

              <div className="bg-linear-to-br from-amber-900/60 to-stone-900/60 rounded-xl border border-amber-700/50 p-6">
                <Shield className="size-10 text-amber-400 mb-3" />
                <p className="text-amber-200/70 text-sm">Completed Games</p>
                <p className="text-amber-100 text-3xl font-bold">
                  {stats.completedGames}
                </p>
              </div>

              <div className="md:col-span-2 bg-linear-to-br from-stone-900/60 to-stone-800/60 rounded-xl border border-stone-700/50 p-6">
                <p className="text-amber-200/70 text-sm mb-2">
                  Average Completion Time
                </p>
                <p className="text-amber-100 text-2xl font-bold">
                  {stats.averageCompletionTime || "N/A"}
                </p>
              </div>

              <div className="md:col-span-2 bg-linear-to-br from-stone-900/60 to-stone-800/60 rounded-xl border border-stone-700/50 p-6">
                <p className="text-amber-200/70 text-sm mb-2">
                  Top Department
                </p>
                <p className="text-amber-100 text-xl font-bold">
                  {stats.topDepartment || "N/A"}
                </p>
              </div>
            </div>
          )}

          {/* Riddles Tab */}
          {activeTab === "riddles" && (
            <div className="bg-linear-to-br from-stone-900/60 to-stone-800/60 rounded-2xl border border-stone-700/50 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-amber-100 text-xl font-semibold">
                  Manage Riddles
                </h2>
                <button
                  onClick={() => router.push("/admin/riddles/create")}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="size-5" />
                  Create Riddle
                </button>
              </div>

              {riddles.length === 0 ? (
                <p className="text-amber-200/70 text-center py-8">
                  No riddles created yet
                </p>
              ) : (
                <div className="space-y-3">
                  {riddles.map((riddle) => (
                    <div
                      key={riddle.id}
                      className="bg-black/40 rounded-lg p-4 border border-amber-900/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-amber-100 font-semibold text-lg">
                            {riddle.title}
                          </h3>
                          <p className="text-amber-200/60 text-sm mt-1">
                            Order: {riddle.orderNumber} | Points:{" "}
                            {riddle.points} | Scans: {riddle.scanCount || 0}
                          </p>
                          <p className="text-amber-300 text-xs mt-2 font-mono">
                            QR Data: {riddle.qrData}
                          </p>
                          <div className="mt-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                riddle.isActive
                                  ? "bg-green-900/30 border border-green-700 text-green-300"
                                  : "bg-red-900/30 border border-red-700 text-red-300"
                              }`}
                            >
                              {riddle.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              router.push(`/admin/riddles/edit/${riddle.id}`)
                            }
                            className="p-2 bg-blue-900/60 hover:bg-blue-900 text-blue-200 rounded-lg transition-colors"
                          >
                            <Edit className="size-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRiddle(riddle.id)}
                            className="p-2 bg-red-900/60 hover:bg-red-900 text-red-200 rounded-lg transition-colors"
                          >
                            <Trash2 className="size-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="bg-linear-to-br from-stone-900/60 to-stone-800/60 rounded-2xl border border-stone-700/50 p-6">
              <h2 className="text-amber-100 text-xl font-semibold mb-6">
                Manage Users
              </h2>

              {users.length === 0 ? (
                <p className="text-amber-200/70 text-center py-8">
                  No users yet
                </p>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="bg-black/40 rounded-lg p-4 border border-amber-900/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-amber-100 font-semibold flex items-center gap-2">
                            {user.fullName}
                            {user.isAdmin && (
                              <span className="px-2 py-0.5 bg-purple-900/30 border border-purple-700 text-purple-300 text-xs rounded-full">
                                Admin
                              </span>
                            )}
                          </h3>
                          <p className="text-amber-200/60 text-sm mt-1">
                            {user.email} | {user.department}
                          </p>
                          <p className="text-amber-200/60 text-xs mt-1">
                            Roll: {user.classRollNo} | Phone:{" "}
                            {user.phoneNumber || "N/A"}
                          </p>
                          {user.stats && (
                            <p className="text-amber-300 text-sm mt-2">
                              {user.stats.totalPoints} points |{" "}
                              {user.stats.uniqueRiddles} riddles |{" "}
                              {user.stats.totalScans} scans
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 bg-red-900/60 hover:bg-red-900 text-red-200 rounded-lg transition-colors"
                          >
                            <Trash2 className="size-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute adminOnly>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

