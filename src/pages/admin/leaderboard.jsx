// pages/admin/leaderboard.jsx - Admin Leaderboard Page
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import LeaderboardBody from "@/components/Admin/Leaderboard/Body";

function AdminLeaderboardContent() {
  const [refreshInterval, setRefreshInterval] = useState(120000); // Default 2 mins

  return (
    <AdminLayout activeTab="leaderboard">
      <div className="space-y-6">
        <header className="rounded-2xl border border-stone-800 bg-stone-900/80 p-6 flex justify-between items-start">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-amber-500 font-semibold">
              Live intelligence
            </p>
            <h1 className="text-3xl font-bold text-amber-50">Leaderboard Control Room</h1>
            <p className="mt-2 text-sm text-amber-200/70">
              Monitor who cracked each riddle first and the players covering the most unique riddles.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <label className="text-xs text-amber-500/80 font-bold uppercase tracking-wider">
              Auto-Refresh
            </label>
            <select
              className="bg-stone-950 border border-stone-700 text-amber-100/90 text-sm rounded-lg p-2.5 focus:ring-amber-500 focus:border-amber-500 block w-full outline-none"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            >
              <option value={30000}>30s</option>
              <option value={60000}>1 min</option>
              <option value={120000}>2 mins</option>
              <option value={300000}>5 mins</option>
              <option value={600000}>10 mins</option>
              <option value={900000}>15 mins</option>
            </select>
          </div>
        </header>

        <LeaderboardBody refreshInterval={refreshInterval} />
      </div>
    </AdminLayout>
  );
}

export default function AdminLeaderboard() {
  return (
    <ProtectedRoute adminOnly>
      <AdminLeaderboardContent />
    </ProtectedRoute>
  );
}
