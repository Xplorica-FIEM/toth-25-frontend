// pages/admin/leaderboard.jsx - Admin Leaderboard Page
import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { getLeaderboard } from "@/utils/api";
import { DEPARTMENTS } from "@/constants/departments";

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
      console.log("Leaderboard response:", response);
      
      if (response.ok && response.data.leaderboard) {
        setLeaderboard(response.data.leaderboard);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout activeTab="leaderboard">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-amber-100">Leaderboard</h1>

        {/* Department Filter */}
        <div className="flex items-center gap-2">
          <Filter className="size-4 sm:size-5 text-amber-400" />
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-stone-800 text-amber-100 border border-stone-700 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:border-amber-600 flex-1 sm:flex-none"
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
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-max">
            <thead className="bg-stone-800">
              <tr>
                <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-amber-200 font-semibold text-sm sm:text-base whitespace-nowrap">Rank</th>
                <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-amber-200 font-semibold text-sm sm:text-base whitespace-nowrap">Name</th>
                <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-amber-200 font-semibold text-sm sm:text-base whitespace-nowrap">Department</th>
                <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-amber-200 font-semibold text-sm sm:text-base whitespace-nowrap">Riddles</th>
                <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-amber-200 font-semibold text-sm sm:text-base whitespace-nowrap">Scans</th>
                <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-amber-200 font-semibold text-sm sm:text-base whitespace-nowrap">Time</th>
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
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-sm sm:text-base ${
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
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-amber-100 font-semibold text-sm sm:text-base whitespace-nowrap">
                    {player.fullName}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-amber-200/70 text-xs sm:text-sm whitespace-nowrap">
                    {player.department}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-yellow-400 font-bold text-sm sm:text-base whitespace-nowrap">
                    {player.uniqueRiddles}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-amber-200/70 text-sm sm:text-base whitespace-nowrap">
                    {player.totalScans}
                  </td>
                  <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-green-400 font-semibold text-sm sm:text-base whitespace-nowrap">
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
