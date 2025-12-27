// pages/admin/leaderboard.jsx - Admin Leaderboard Page
import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { getLeaderboard } from "@/utils/api";
import { DEPARTMENTS } from "@/constants/departments";
import Loader from "../loadinganimation";

function AdminLeaderboardContent() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedDepartment]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await getLeaderboard(selectedDepartment);
      if (response.ok && response.data.data) {
        setLeaderboard(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout activeTab="leaderboard">
        <div className="flex items-center justify-center h-96">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="leaderboard">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-100">Leaderboard</h1>

        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <Filter className="size-5 text-amber-400" />
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-stone-800 text-amber-100 border border-stone-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-600"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-800">
              <tr>
                <th className="px-6 py-4 text-left text-amber-200 font-semibold">Rank</th>
                <th className="px-6 py-4 text-left text-amber-200 font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-amber-200 font-semibold">Department</th>
                <th className="px-6 py-4 text-left text-amber-200 font-semibold">Riddles</th>
                <th className="px-6 py-4 text-left text-amber-200 font-semibold">Scans</th>
                <th className="px-6 py-4 text-left text-amber-200 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {leaderboard?.map((player, index) => (
                <tr
                  key={player.userId}
                  className={`hover:bg-stone-800/50 ${
                    index < 3 ? "bg-amber-900/10" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        index === 0
                          ? "bg-yellow-500 text-black"
                          : index === 1
                          ? "bg-gray-300 text-black"
                          : index === 2
                          ? "bg-amber-600 text-white"
                          : "bg-stone-800 text-amber-200"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-amber-100 font-semibold">
                    {player.fullName}
                  </td>
                  <td className="px-6 py-4 text-amber-200/70 text-sm">
                    {player.department}
                  </td>
                  <td className="px-6 py-4 text-yellow-400 font-bold">
                    {player.uniqueRiddles}
                  </td>
                  <td className="px-6 py-4 text-amber-200/70">
                    {player.totalScans}
                  </td>
                  <td className="px-6 py-4 text-green-400 font-semibold">
                    {player.completionTimeFormatted || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
