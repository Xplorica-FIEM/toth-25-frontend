
import React, { useEffect, useState, useCallback } from 'react';
import { getRiddleScanStats } from "@/utils/api";

const RiddleScanStats = ({ refreshInterval = 120000 }) => {
  const [data, setData] = useState([]);
  const [animatedData, setAnimatedData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
        const res = await getRiddleScanStats();
        if(res.ok) {
            setData(res.data.data || []);
        }
    } catch(e) {
        console.error("Failed to fetch riddle stats", e);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const maxCount = Math.max(...(data?.map(d => d.count) || [0]), 1);

  useEffect(() => {
    if (data.length > 0) {
        // Delay setting data to trigger animation
        const timer = setTimeout(() => {
            setAnimatedData(data);
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [data]);


  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 h-full overflow-hidden flex flex-col">
      <h3 className="text-lg font-semibold text-amber-100 mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        Riddle Popularity
      </h3>
      
      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-grow">
        {data.map((item, index) => {
          const isVisible = animatedData.find(d => d.riddleId === item.riddleId);
          const percentage = (item.count / maxCount) * 100;
          
          return (
            <div key={item.riddleId} className="group relative">
              <div className="flex justify-between items-end mb-1 text-sm">
                <span className="text-amber-100 font-medium truncate max-w-[70%]">{item.riddleName}</span>
                <span className="text-amber-400 font-mono">{item.count} scans</span>
              </div>
              
              <div className="h-3 w-full bg-stone-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-600 to-yellow-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all duration-1000 ease-out relative"
                  style={{ width: isVisible ? `${percentage}%` : '0%' }}
                >
                    <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full group-hover:animate-shimmer" />
                </div>
              </div>
            </div>
          );
        })}

        {data.length === 0 && (
            <div className="text-stone-500 text-center py-4">No scan data available</div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default RiddleScanStats;
