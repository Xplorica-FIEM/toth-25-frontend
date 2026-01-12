"use client";

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from "next/router";
import Link from "next/link";
import { 
  Compass, MapPin, Trophy, LogOut, Shield, 
  Anchor, Map, Key, Scroll, Crown, X
} from "lucide-react";
import dynamic from "next/dynamic";
import { getCurrentUser } from "@/utils/api";
import { logout, getUser } from "@/utils/auth";
import { getSessionKey } from "@/utils/sessionKey";
import { cacheRiddles, isCachePopulated, cleanupOldIndexedDB } from "@/utils/riddleCache";
import { startBackgroundSync, stopBackgroundSync } from "@/utils/backgroundSync";
import LoadingScreen from "./LoadingScreen";
import BackgroundElements from "./BackgroundElements";
import Navbar from "./Navbar";
import StatsGrid from "./StatsGrid";
import ScannerModal from "./ScannerModal";
import TimerCountdown from "./TimerCountdown";
import SolvedRiddles from "./SolvedRiddles";

// EDIT THIS DATE TO CHANGE THE COUNTDOWN
// Format: YYYY-MM-DDTHH:mm:ss (ISO Format)
const TARGET_GAME_START = "2026-02-15T10:00:00"; 

const Scan = dynamic(() => import("../scan"), {
  ssr: false,
});

const DashboardBody = () => {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [riddles, setRiddles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [gameStatus, setGameStatus] = useState("loading"); // loading, not_started, active
  
  // Initialize with the hardcoded constant
  const [startTime, setStartTime] = useState(TARGET_GAME_START);
  
  const profileMenuRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
    // Cache init is now handled in loadGame logic mostly, but we keep sync
    startBackgroundSync();

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      stopBackgroundSync();
    };
  }, []);

  const fetchDashboardData = async () => {
    const storedUser = getUser();
    if (storedUser) setUser(storedUser);

    try {
      // 1. Get User Details
      const userResponse = await getCurrentUser();
      if (userResponse.ok) {
        setUser(userResponse.data.user);
      }

      // 2. Load Game State
      const token = localStorage.getItem('token');
      const loadResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/game/load`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const gameData = await loadResponse.json();

      if (gameData.success === false && gameData.type === "game_not_started") {
        setGameStatus("not_started");
        // We do NOT update startTime from backend here, we use the hardcoded state
        setLoading(false);
        return;
      }

      if (gameData.success && gameData.riddles && gameData.riddles.length > 0) {
        // Cache the riddles
        await cleanupOldIndexedDB();
        await getSessionKey();
        await cacheRiddles(gameData.riddles);
        
        // Save locked riddles to localStorage
        const lockedRiddles = {};
        gameData.riddles.forEach(riddle => {
          lockedRiddles[riddle.id] = riddle.puzzleText;
        });
        localStorage.setItem("locked-riddles", JSON.stringify(lockedRiddles));
        
        // Calculate progress based on riddles state since we removed the progress endpoint
        const solvedCount = gameData.riddles.filter(r => r.solved || r.isSolved).length;
        setProgress({ riddlesSolved: solvedCount });
        setRiddles(gameData.riddles);
        
        setGameStatus("active");
      } else {
        // Fallback if success but no riddles (maybe game over or empty?)
        console.warn("Game loaded but no riddles found");
        setGameStatus("active"); 
      }

      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      if (error.message === "Unauthorized" || error.message === "Authentication required") {
        logout();
        router.push("/login");
      }
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { clearCache } = await import('@/utils/riddleCache');
    const { clearSessionKey } = await import('@/utils/sessionKey');
    await clearCache();
    clearSessionKey();
    stopBackgroundSync();
    logout();
    router.push("/login");
  };

  const closeScanner = () => {
    setShowScanner(false);
    fetchDashboardData();
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-linear-to-br from-stone-900 via-amber-950 to-stone-900 relative overflow-hidden">
      <style jsx global>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.5); } 50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.8); } }
        @keyframes treasure-bounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
      `}</style>
      
      <BackgroundElements />
      
      <Navbar 
        user={user} 
        handleLogout={handleLogout} 
        showProfileMenu={showProfileMenu} 
        setShowProfileMenu={setShowProfileMenu}
        profileMenuRef={profileMenuRef} 
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-6 space-y-3 sm:space-y-6 flex flex-col">
        {gameStatus === "not_started" ? (
          <TimerCountdown startTime={startTime} />
        ) : (
          <>
            <div className="bg-linear-to-r from-amber-900/40 to-stone-900/40 backdrop-blur-sm border border-amber-700/30 rounded-xl p-3 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-linear-to-br from-amber-600 to-amber-800 flex items-center justify-center border-2 border-amber-500/50">
                  <Crown className="w-5 h-5 sm:w-8 sm:h-8 text-amber-100" />
                </div>
                <div>
                  <h2 className="text-amber-100 text-base sm:text-2xl font-bold">Ahoy, {user?.fullName?.split(' ')[0] || "Explorer"}! ⚓</h2>
                  <p className="text-amber-200/70 text-xs sm:text-sm">Your treasure awaits discovery</p>
                </div>
              </div>
            </div>

            <StatsGrid 
              onOpenScanner={() => setShowScanner(true)} 
            />

            <SolvedRiddles riddles={riddles} />
          </>
        )}
      </div>

      <footer className="max-w-7xl mx-auto px-4 py-8 mt-auto">
        <div className="border-t border-amber-900/20 pt-8 flex flex-col items-center justify-center space-y-2">
          <p className="text-amber-200/30 text-xs font-medium tracking-[0.2em] uppercase">
            Made with <span className="text-red-500/50 animate-pulse inline-block mx-1">❤️</span> by Xplorica Tech Team
          </p>
          <div className="h-1 w-8 bg-linear-to-r from-transparent via-amber-700/30 to-transparent rounded-full"></div>
        </div>
      </footer>

      {showScanner && <ScannerModal onClose={closeScanner} />}
    </div>
  );
}

export default DashboardBody;