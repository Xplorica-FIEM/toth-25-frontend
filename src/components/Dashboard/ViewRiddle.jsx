"use client";
import { useState, useEffect } from 'react';
import { X } from "lucide-react";
import RiddleTemplate from '../RiddleTemplate';

const ViewRiddleToUser = ({ riddleId, onClose }) => {
  const [riddle, setRiddle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!riddleId) {
      setLoading(false);
      return;
    }

    const fetchLocalRiddle = () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch from unlocked-riddles in localStorage as requested (primary source for multiple riddles)
        const unlockedStored = localStorage.getItem('unlocked-riddles');
        let foundRiddle = null;

        if (unlockedStored) {
          const unlockedMap = JSON.parse(unlockedStored);
          foundRiddle = unlockedMap[riddleId];
        }

        // Fallback: Check currentRiddleData (immediate scan result source)
        if (!foundRiddle) {
           const currentData = localStorage.getItem('currentRiddleData');
           if (currentData) {
               const parsed = JSON.parse(currentData);
               // loose equality for string/number id mismatch safety
               if (String(parsed.id) === String(riddleId)) {
                   foundRiddle = parsed;
               }
           }
        }

        if (foundRiddle) {
          // If foundRiddle is a string (from gameData format), normalize it to object
          if (typeof foundRiddle === 'string') {
              setRiddle({
                  id: riddleId,
                  puzzleText: foundRiddle,
                  riddleName: "Mystery Clue", 
                  isSolved: true
              });
          } else {
              setRiddle(foundRiddle);
          }
        } else {
          setError('Riddle data not found locally. Please try scanning again.');
        }
      } catch (err) {
        console.error("Error reading local riddle:", err);
        setError('Failed to retrieve riddle data.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocalRiddle();
  }, [riddleId]);

  const getBackgroundImage = (id) => {
    if (!id) return '/toth1.png';
    const backgrounds = ['/toth1.png', '/toth2.png', '/toth3.png', '/toth4.png', '/toth5.png', '/toth6.png', '/toth7.png', '/toth8.png'];
    const idStr = String(id);
    const hash = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return backgrounds[hash % backgrounds.length];
  };

  if (!riddleId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-0 overflow-y-auto isolate">
      {/* Close Button UI - Sticky to viewport corner */}
      <button 
        onClick={onClose}
        className="fixed top-6 right-6 z-[110] p-2.5 bg-stone-900/60 hover:bg-stone-800 text-amber-100 rounded-full border border-amber-500/30 hover:border-amber-500/60 transition-all backdrop-blur-md shadow-lg group"
      >
        <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      <div className="w-full min-h-full flex flex-col items-center justify-center">
        {loading && (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-amber-400 font-mono text-xl animate-pulse">Unrolling Scroll...</p>
            <p className="text-amber-200/60 text-sm mt-2">Deciphering ancient content</p>
          </div>
        )}

        {error && (
          <div className="text-center max-w-md mx-4 p-8 bg-red-900/10 border border-red-500/30 rounded-2xl backdrop-blur-sm">
            <p className="text-4xl mb-4">📜</p>
            <p className="text-xl mb-2 text-red-400 font-bold uppercase tracking-widest">Riddle Unavailable</p>
            <p className="text-red-200/70 mb-6">{error}</p>
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg border border-red-500/50 transition-colors"
            >
              Close View
            </button>
          </div>
        )}

        {!loading && !error && riddle && (
          <div className="w-full">
             <RiddleTemplate 
               riddleContent={riddle.puzzleText}
               title={riddle.riddleName}
               backgroundImage={getBackgroundImage(riddle.id)}
               isAuthenticated={true}
               riddleId={riddle.id}
             />
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewRiddleToUser