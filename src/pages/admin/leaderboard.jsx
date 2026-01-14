// pages/admin/leaderboard.jsx - Admin Leaderboard Page
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import LeaderboardBody from "@/components/Admin/Leaderboard/Body";

function AdminLeaderboardContent() {
  return (
    <AdminLayout activeTab="leaderboard">
      <div className="space-y-6">
        <header className="rounded-2xl border border-stone-800 bg-stone-900/80 p-6">
          <p className="text-[11px] uppercase tracking-[0.4em] text-amber-500 font-semibold">
            Live intelligence
          </p>
          <h1 className="text-3xl font-bold text-amber-50">Leaderboard Control Room</h1>
          <p className="mt-2 text-sm text-amber-200/70">
            Monitor who cracked each riddle first and the players covering the most unique riddles.
            Data refreshes automatically every minute.
          </p>
        </header>

        <LeaderboardBody />
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
