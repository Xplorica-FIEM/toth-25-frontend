import React, { useState, useEffect } from 'react';
import { QrCode, Scroll, Search, Loader2 } from "lucide-react";
import { getScannedRiddleIds, getRiddleById } from "@/utils/api";
import ViewRiddleToUser from './ViewRiddle';

const StatsGrid = ({ onOpenScanner }) => {
  const [scannedIds, setScannedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRiddle, setSelectedRiddle] = useState(null);
  const [riddleLoading, setRiddleLoading] = useState(false);

  useEffect(() => {
    fetchScannedRiddles();
  }, []);

  const fetchScannedRiddles = async () => {
    try {
      const response = await getScannedRiddleIds();
      if (response.ok && response.data?.scannedRiddleIds) {
        setScannedIds(response.data.scannedRiddleIds);
      }
    } catch (error) {
      console.error("Failed to fetch scanned riddles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRiddleClick = async (riddleId) => {
    setRiddleLoading(true);
    try {
      const response = await getRiddleById(riddleId);
      if (response.ok && response.data?.riddle) {
        setSelectedRiddle(response.data.riddle);
      }
    } catch (error) {
      console.error("Failed to fetch riddle:", error);
    } finally {
      setRiddleLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Scanner Box with Styled Corners */}
      <div className="bg-linear-to-br from-amber-900/40 to-stone-900/40 border border-amber-700/30 rounded-xl p-8 sm:p-12 relative flex flex-col items-center justify-center min-h-[320px]">
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-600/50 rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-600/50 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-amber-600/50 rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-600/50 rounded-br-xl"></div>

        {/* QR Content */}
        <div className="flex flex-col items-center gap-10 w-full max-w-md">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full animate-pulse"></div>
            <QrCode className="w-28 h-28 text-amber-500/30 relative" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-amber-100 text-xl font-bold tracking-wide">Ready for the Next Clue?</h3>
            <p className="text-amber-200/50 text-sm">Scan the QR code found at the location to unlock your next challenge.</p>
          </div>

          <button 
            onClick={onOpenScanner} 
            className="w-full bg-linear-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-amber-50 font-black py-5 px-8 rounded-xl border border-amber-400/30 shadow-2xl shadow-amber-950/50 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group"
          >
            <div className="w-2.5 h-2.5 bg-amber-200 rounded-full animate-pulse group-hover:bg-amber-100"></div>
            <span className="uppercase tracking-widest text-sm">Scan Qr</span>
          </button>
        </div>
      </div>

      {/* Unlocked Riddles Section */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-amber-500 rounded-full"></div>
          <h3 className="text-xl font-bold text-amber-100 uppercase tracking-[0.2em] shadow-amber-500/20">Unlocked Findings</h3>
          <span className="ml-auto text-amber-500/60 text-sm font-medium">{scannedIds.length} found</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : scannedIds.length === 0 ? (
          <div className="bg-stone-900/30 border border-dashed border-amber-900/30 rounded-xl p-12 text-center group hover:border-amber-700/50 transition-colors duration-500">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-amber-500/5 blur-xl rounded-full"></div>
              <Search className="w-12 h-12 text-amber-900/40 relative group-hover:scale-110 transition-transform duration-500" />
            </div>
            <p className="text-amber-200/40 font-medium tracking-wide">No treasures found yet. Start scanning to unlock riddles!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scannedIds.map((riddleId, index) => (
              <div 
                key={riddleId}
                onClick={() => handleRiddleClick(riddleId)}
                className="group cursor-pointer bg-linear-to-br from-amber-900/20 to-stone-900/40 border border-amber-700/20 rounded-xl p-5 hover:border-amber-600/50 transition-all duration-300 relative overflow-hidden"
              >
                {/* Background Decoration */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 group-hover:border-amber-500/40 transition-colors">
                    <Scroll className="w-5 h-5 text-amber-500" />
                  </div>
                </div>
                
                <div className="relative z-10">
                  <p className="text-amber-100 text-lg font-semibold mb-4">
                    Riddle {index + 1}
                  </p>
                  
                  <div className="flex items-center justify-end pt-4 border-t border-amber-900/30">
                    <span className="text-[10px] text-amber-500/60 font-medium uppercase tracking-wider group-hover:text-amber-400 transition-colors">
                      Tap to view
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riddle Loading Overlay */}
      {riddleLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
            <p className="text-amber-400 font-mono">Unrolling Scroll...</p>
          </div>
        </div>
      )}

      {/* View Riddle Modal */}
      {selectedRiddle && (
        <ViewRiddleToUser 
          riddle={selectedRiddle}
          onClose={() => setSelectedRiddle(null)} 
        />
      )}
    </div>
  );
};

export default StatsGrid;