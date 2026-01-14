"use client";
import { useState, useEffect } from 'react';
import { X } from "lucide-react";
import RiddleTemplate from '../RiddleTemplate';
import { getRiddleById } from "@/utils/api";

const ViewRiddleToUser = ({ riddle: riddleProp, riddleId, onClose }) => {
  const [riddle, setRiddle] = useState(riddleProp || null);
  const [loading, setLoading] = useState(!riddleProp);
  const [error, setError] = useState('');

  useEffect(() => {
    // If riddle is passed directly, use it
    if (riddleProp) {
      setRiddle(riddleProp);
      setLoading(false);
      return;
    }

    // If only riddleId is passed, fetch from API
    if (!riddleId) {
      setLoading(false);
      return;
    }

    const fetchRiddle = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await getRiddleById(riddleId);

        if (response.networkError) {
          setError('You are offline. Please check your connection.');
          return;
        }

        if (!response.ok) {
          setError(response.data?.error || 'Failed to load riddle');
          return;
        }

        if (response.data?.riddle) {
          setRiddle(response.data.riddle);
        } else {
          setError('Riddle not found');
        }
      } catch (err) {
        console.error("Error fetching riddle:", err);
        setError('Failed to load riddle');
      } finally {
        setLoading(false);
      }
    };

    fetchRiddle();
  }, [riddleProp, riddleId]);

  const getBackgroundImage = (id) => {
    if (!id) return '/toth1.png';
    const backgrounds = ['/toth1.png', '/toth2.png', '/toth3.png', '/toth4.png', '/toth5.png', '/toth6.png', '/toth7.png', '/toth8.png'];
    const idStr = String(id);
    const hash = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return backgrounds[hash % backgrounds.length];
  };

  if (!riddleProp && !riddleId) return null;

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
               title=""
               backgroundImage={getBackgroundImage(riddle.id)}
               isAuthenticated={true}
               riddleId={riddle.id}
               onClose={onClose}
             />
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewRiddleToUser