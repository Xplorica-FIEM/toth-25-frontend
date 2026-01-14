import React, { useState } from 'react';
import { Scroll, Search } from "lucide-react";
import ViewRiddleToUser from './ViewRiddle';

const SolvedRiddles = ({ riddles }) => {
  const [selectedRiddleId, setSelectedRiddleId] = useState(null);
  
  // Normalize riddles - handle both string format (legacy) and object format
  // All riddles in unlocked-riddles are solved, so no need to filter by isSolved
  const solvedRiddles = riddles.map((riddle, index) => {
    // If riddle is a string (legacy format), convert to object
    if (typeof riddle === 'string') {
      return {
        id: `legacy-${index}`,
        puzzleText: riddle,
        isSolved: true
      };
    }
    // If riddle is already an object, ensure it has required properties
    return {
      id: riddle.id || `riddle-${index}`,
      puzzleText: riddle.puzzleText || riddle,
      isSolved: true,
      scannedAt: riddle.scannedAt
    };
  });

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-1 bg-amber-500 rounded-full"></div>
        <h3 className="text-xl font-bold text-amber-100 uppercase tracking-[0.2em] shadow-amber-500/20">Unlocked Findings</h3>
      </div>

      {solvedRiddles.length === 0 ? (
        <div className="bg-stone-900/30 border border-dashed border-amber-900/30 rounded-xl p-12 text-center group hover:border-amber-700/50 transition-colors duration-500">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-amber-500/5 blur-xl rounded-full"></div>
            <Search className="w-12 h-12 text-amber-900/40 relative group-hover:scale-110 transition-transform duration-500" />
          </div>
          <p className="text-amber-200/40 font-medium tracking-wide">No treasures found yet. Start scanning to unlock riddles!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {solvedRiddles.map((riddle, index) => (
            <div 
              key={riddle.id}
              onClick={() => setSelectedRiddleId(riddle.id)}
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
                  <div className="text-[10px] text-amber-500/40 font-medium">
                    {riddle.scannedAt ? new Date(riddle.scannedAt).toLocaleDateString() : 'Found'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRiddleId && (
        <ViewRiddleToUser 
          riddleId={selectedRiddleId} 
          onClose={() => setSelectedRiddleId(null)} 
        />
      )}
    </div>
  );
};

export default SolvedRiddles;
    