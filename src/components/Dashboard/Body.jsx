"use client";

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from "next/router";
import { Crown } from "lucide-react";
import { getCurrentUser } from "@/utils/api";
import { logout, getUser } from "@/utils/auth";
import LoadingScreen from "./LoadingScreen";
import BackgroundElements from "./BackgroundElements";
import Navbar from "./Navbar";
import StatsGrid from "./StatsGrid";
import ScannerModal from "./ScannerModal";
import TimerCountdown from "./TimerCountdown";

// EDIT THIS DATE TO CHANGE THE COUNTDOWN
const TARGET_GAME_START = "2026-01-14T14:50:00";

const DashboardBody = () => {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [gameStatus, setGameStatus] = useState("active");
  const [startTime] = useState(TARGET_GAME_START);

  const profileMenuRef = useRef(null);

  useEffect(() => {
    initializeDashboard();

    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initializeDashboard = async () => {
    const storedUser = getUser();
    if (storedUser) setUser(storedUser);

    try {
      const userResponse = await getCurrentUser();
      if (userResponse.ok) {
        setUser(userResponse.data.user);
      } else if (userResponse.status === 401) {
        handleLogout();
        return;
      }
    } catch (error) {
      console.error("Init error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const closeScanner = () => {
    setShowScanner(false);
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
