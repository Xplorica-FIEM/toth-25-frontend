
import React, { useEffect, useState, useCallback } from 'react';
import { getRecentScans } from "@/utils/api";

const RecentScans = ({ refreshInterval = 120000 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
        const res = await getRecentScans(10); // Limit 10
        if(res.ok) {
            setData(res.data.data || []);
        }
    } catch(e) {
        console.error("Failed to fetch recent scans", e);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-amber-100 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        Recent Activity
      </h3>
      
      <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-stone-700 text-stone-400 text-xs uppercase tracking-wider">
              <th className="pb-3 px-2">Time</th>
              <th className="pb-3 px-2">User</th>
              <th className="pb-3 px-2">Riddle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {data.map((scan) => (
              <tr key={scan.id} className="hover:bg-stone-800/50 transition-colors">
                <td className="py-3 px-2 text-stone-300 text-sm font-mono whitespace-nowrap">
                  {new Date(scan.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td className="py-3 px-2">
                  <div className="text-amber-100 text-sm font-medium">{scan.user.fullName}</div>
                  <div className="text-stone-500 text-xs">{scan.user.email}</div>
                </td>
                <td className="py-3 px-2">
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-stone-800 text-amber-500 border border-stone-700">
                    {scan.riddle.riddleName}
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
                <tr>
                    <td colSpan="3" className="text-stone-500 text-center py-4">No recent scans</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentScans;
