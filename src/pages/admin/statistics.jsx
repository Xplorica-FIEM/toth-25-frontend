// pages/admin/statistics.jsx - Admin Statistics Page
import { useState, useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import { getAdminStats } from "@/utils/api";

// Import new components
import RecentScans from "@/components/Admin/Statistics/RecentScans";
import RiddleScanStats from "@/components/Admin/Statistics/RiddleScanStats";
import UserScanStats from "@/components/Admin/Statistics/UserScanStats";

function AdminStatisticsContent() {
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [generalStats, setGeneralStats] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(120000); // Default 2 mins

  const fetchData = useCallback(async () => {
    // Keep loading state mainly for initial load, or maybe just silent update?
    // If I set loading=true every time, it will flicker.
    // Better to only set loading true if generalStats is null.
    if (!generalStats) setLoading(true); 
    
    try {
      const statsRes = await getAdminStats();
      if (statsRes.ok) setGeneralStats(statsRes.data?.stats ?? null);
    } catch (error) {
      console.error("Failed to fetch statistics data:", error);
    } finally {
      setLoading(false);
    }
  }, [generalStats]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);


  return (
    <AdminLayout activeTab="statistics">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-100">Statistics Dashboard</h1>
        
        <div className="flex items-center gap-4">
             <div className="flex flex-col items-end gap-1">
                <label className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider">Auto-Refresh</label>
                <select 
                  className="bg-stone-900 border border-stone-700 text-amber-100/90 text-sm rounded px-2 py-1 outline-none focus:border-amber-500"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                >
                  <option value={30000}>30s</option>
                  <option value={60000}>1m</option>
                  <option value={120000}>2m</option>
                  <option value={300000}>5m</option>
                  <option value={600000}>10m</option>
                  <option value={900000}>15m</option>
                </select>
             </div>

            <button 
              onClick={fetchData}
              className="p-2 bg-stone-800 rounded-lg hover:bg-stone-700 text-amber-500 transition-colors"
              title="Refresh Data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-40 h-[60vh]">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-amber-500"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-amber-500 text-xs font-bold">LOADING</div>
          </div>
          <p className="text-amber-200/60 mt-4 animate-pulse">Gathering intelligence...</p>
        </div>
      ) : (
        <div className="space-y-6 pb-8">
          {/* General Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              title="Total Users" 
              value={generalStats?.totalUsers || 0} 
              icon={<path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />}
              color="text-blue-400"
            />
            <StatCard 
              title="Active Players" 
              value={generalStats?.activePlayers || 0} 
              icon={<path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 00-1.447.894v2.764l4-2V5.118a1 1 0 00-.553-.894l-2 1z" />}
              color="text-green-400"
            />
             <StatCard 
              title="Total Scans" 
              value={generalStats?.totalScans || 0} 
              icon={<path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />}
              color="text-purple-400"
            />
            <StatCard 
              title="Active Riddles" 
              value={generalStats?.activeRiddles || 0} 
              icon={<path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />}
              color="text-amber-400"
            />
          </div>

          {/* New Detailed Components Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
             {/* Left Column - Riddle Stats */}
             <div className="h-full">
                <RiddleScanStats refreshInterval={refreshInterval} />
             </div>

             {/* Right Column - User Stats & Recent */}
             <div className="grid grid-rows-2 gap-6 h-full">
                <UserScanStats refreshInterval={refreshInterval} />
                <RecentScans refreshInterval={refreshInterval} />
             </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

// Simple internal component for small cards
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden group">
    <div className="relative z-10">
      <p className="text-stone-400 text-xs uppercase font-bold tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
    <div className={`p-3 bg-stone-800 rounded-full ${color}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            {icon}
        </svg>
    </div>
    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500"></div>
  </div>
);

export default function AdminStatistics() {
  return (
    <ProtectedRoute adminOnly>
      <AdminStatisticsContent />
    </ProtectedRoute>
  );
}
