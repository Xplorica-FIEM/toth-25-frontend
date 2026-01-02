// pages/admin/dashboard.jsx - Admin Overview Page
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Users, Scroll, BarChart3, Trophy, Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { getAdminStats } from "@/utils/api";

function AdminDashboardContent() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const statsRes = await getAdminStats();
      console.log("Stats response:", statsRes);
      if (statsRes.ok) {
        // Backend returns { success: true, stats: {...} }
        setStats(statsRes.data.stats);
      } else {
        console.error("Failed to fetch stats:", statsRes.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout activeTab="overview">
      <div className="p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-amber-100 mb-4 md:mb-6">Dashboard Overview</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 md:p-6">
            <Users className="size-8 md:size-10 text-blue-400 mb-2 md:mb-3" />
            <p className="text-amber-200/70 text-xs md:text-sm mb-1">Total Users</p>
            <p className="text-2xl md:text-3xl font-bold text-amber-100">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 md:p-6">
            <Scroll className="size-8 md:size-10 text-amber-400 mb-2 md:mb-3" />
            <p className="text-amber-200/70 text-xs md:text-sm mb-1">Total Riddles</p>
            <p className="text-2xl md:text-3xl font-bold text-amber-100">{stats?.totalRiddles || 0}</p>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 md:p-6">
            <BarChart3 className="size-8 md:size-10 text-green-400 mb-2 md:mb-3" />
            <p className="text-amber-200/70 text-xs md:text-sm mb-1">Total Scans</p>
            <p className="text-2xl md:text-3xl font-bold text-amber-100">{stats?.totalScans || 0}</p>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 md:p-6">
            <Trophy className="size-8 md:size-10 text-yellow-400 mb-2 md:mb-3" />
            <p className="text-amber-200/70 text-xs md:text-sm mb-1">Active Players</p>
            <p className="text-2xl md:text-3xl font-bold text-amber-100">{stats?.completedGames || 0}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-amber-100 mb-3 md:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <button
              onClick={() => router.push("/admin/riddles/create")}
              className="flex items-center justify-center md:justify-start gap-3 px-4 md:px-6 py-3 md:py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm md:text-base"
            >
              <Plus className="size-5" />
              <span className="font-semibold">Create Riddle</span>
            </button>
            <button
              onClick={() => router.push("/admin/users")}
              className="flex items-center justify-center md:justify-start gap-3 px-4 md:px-6 py-3 md:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm md:text-base"
            >
              <Users className="size-5" />
              <span className="font-semibold">Manage Users</span>
            </button>
            <button
              onClick={() => router.push("/admin/leaderboard")}
              className="flex items-center justify-center md:justify-start gap-3 px-4 md:px-6 py-3 md:py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm md:text-base"
            >
              <Trophy className="size-5" />
              <span className="font-semibold">View Leaderboard</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute adminOnly>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
