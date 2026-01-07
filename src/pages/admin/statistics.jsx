// pages/admin/statistics.jsx - Admin Statistics Page
import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { getAdminStats, getLeaderboard } from "@/utils/api";

function AdminStatisticsContent() {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, leaderboardRes] = await Promise.all([
        getAdminStats(),
        getLeaderboard(""),
      ]);

      console.log("Stats response:", statsRes);
      console.log("Leaderboard response:", leaderboardRes);

      if (statsRes.ok) setStats(statsRes.data.stats);
      if (leaderboardRes.ok && leaderboardRes.data.leaderboard) setLeaderboard(leaderboardRes.data.leaderboard);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout activeTab="statistics">
      <h1 className="text-3xl font-bold text-amber-100 mb-6">Statistics</h1>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400 border-t-transparent mb-4"></div>
          <p className="text-amber-400 font-mono text-lg animate-pulse">Loading Statistics...</p>
          <p className="text-amber-200/60 text-sm mt-2">Gathering game data</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-amber-100 mb-4">Game Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-amber-200/70">Total Users:</span>
              <span className="text-amber-100 font-bold">{stats?.totalUsers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-200/70">Active Players:</span>
              <span className="text-amber-100 font-bold">{stats?.activePlayers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-200/70">Total Riddles:</span>
              <span className="text-amber-100 font-bold">{stats?.totalRiddles || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-200/70">Total Scans:</span>
              <span className="text-amber-100 font-bold">{stats?.totalScans || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-amber-100 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {leaderboard?.slice(0, 5).map((player, index) => (
              <div key={player.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-amber-200/70 font-mono w-6">#{index + 1}</span>
                  <span className="text-amber-100">{player.fullName}</span>
                </div>
                <span className="text-yellow-400 font-bold">{player.totalPoints} pts</span>
              </div>
            ))}
          </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default function AdminStatistics() {
  return (
    <ProtectedRoute adminOnly>
      <AdminStatisticsContent />
    </ProtectedRoute>
  );
}
