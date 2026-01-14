"use client";

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from "next/router";
import {
  Compass, MapPin, Trophy, LogOut, Shield,
  Anchor, Map, Key, Scroll, Crown, X
} from "lucide-react";
import dynamic from "next/dynamic";
import { getCurrentUser, loadGame, getLastGameUpdate } from "@/utils/api";
import { logout, getUser } from "@/utils/auth";
import {
  getAllUnlockedRiddles,
  getUnlockedRiddlesIndex,
  storeLockedRiddles,
  storeUnlockedRiddles,
  hasLockedRiddles as checkHasLockedRiddles,
  clearAllRiddleStorage,
  migrateFromLegacyStorage
} from "@/utils/riddleStorage";
import LoadingScreen from "./LoadingScreen";
import BackgroundElements from "./BackgroundElements";
import Navbar from "./Navbar";
import StatsGrid from "./StatsGrid";
import ScannerModal from "./ScannerModal";
import TimerCountdown from "./TimerCountdown";
import SolvedRiddles from "./SolvedRiddles";

// EDIT THIS DATE TO CHANGE THE COUNTDOWN
const TARGET_GAME_START = "2026-01-14T14:50:00";

const DashboardBody = () => {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const [user, setUser] = useState(null);
  const [riddles, setRiddles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLockedRiddles, setHasLockedRiddles] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [gameStatus, setGameStatus] = useState("loading");
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
        // Token expired or invalid
        handleLogout();
        return;
      }
      // If network error, continue with stored user

      await checkAndLoadGame(false);
    } catch (error) {
      console.error("Init error:", error);
      // Don't re-throw - just log and continue with whatever data we have
    } finally {
      setLoading(false);
    }
  };

  const checkAndLoadGame = async (forceRefetch = false) => {
    try {
      // Migrate legacy storage if needed
      migrateFromLegacyStorage();
      
      // 1. Initial Load from distributed localStorage
      const unlockedList = getAllUnlockedRiddles();
      const unlockedIndex = getUnlockedRiddlesIndex();
      
      if (unlockedList.length > 0) {
        setRiddles(unlockedList);
        setGameStatus("active");
      }

      // 2. Check outdated vs Server
      let shouldFetch = forceRefetch;
      
      if (!shouldFetch) {
        // If we don't have data, we MUST fetch
        if (unlockedIndex.length === 0 && !checkHasLockedRiddles()) {
          shouldFetch = true;
        } else {
            // Check timestamps
            const localLastUpdated = localStorage.getItem("game-last-updated");
            
            const updateRes = await getLastGameUpdate();
            // Only proceed if we got a valid response (not network error)
            if (updateRes.ok) {
                const serverLastUpdated = updateRes.data.lastUpdated;
                if (serverLastUpdated !== localLastUpdated) {
                    shouldFetch = true;
                }
            } else if (updateRes.networkError) {
                // Network error - use local data, don't try to fetch more
                console.warn('⚠️ Network unavailable, using cached data');
                shouldFetch = false;
            }
        }
      }

      // 3. Fetch from Server if needed
      if (shouldFetch) {
          const gameRes = await loadGame();
          
          // Handle network errors gracefully
          if (gameRes.networkError) {
              console.warn('⚠️ Could not load game from server, using local data');
              // If we have no local data at all, show not_started as fallback
              if (unlockedIndex.length === 0 && !checkHasLockedRiddles()) {
                  // No local data and can't reach server - show a message
                  console.warn('No local data available and server unreachable');
              }
          } else if (gameRes.ok) {
              const { riddles: allRiddles, lastUpdated } = gameRes.data;
              
              const newUnlocked = {};
              const newLocked = {};
              
              // Get ALL existing unlocked riddles from localStorage FIRST
              // This preserves riddles that are unlocked locally but not yet synced to server
              const existingUnlocked = getAllUnlockedRiddles();
              existingUnlocked.forEach(existingRiddle => {
                  if (existingRiddle && existingRiddle.id) {
                      // Start with existing local data (has decrypted puzzleText)
                      newUnlocked[existingRiddle.id] = existingRiddle;
                  }
              });
              
              // Now process server riddles
              allRiddles.forEach(r => {
                  if (r.isSolved) {
                      // If we already have this riddle locally with decrypted text, preserve it
                      if (newUnlocked[r.id] && newUnlocked[r.id].puzzleText) {
                          // Merge: keep local decrypted puzzleText, update metadata from server
                          newUnlocked[r.id] = {
                              ...newUnlocked[r.id],
                              ...r,
                              puzzleText: newUnlocked[r.id].puzzleText, // Keep decrypted text
                              isSolved: true
                          };
                      } else {
                          // No local data - use server data (may be encrypted if solved elsewhere)
                          newUnlocked[r.id] = r;
                      }
                  } else {
                      // Only add to locked if NOT already unlocked locally
                      if (!newUnlocked[r.id]) {
                          newLocked[r.id] = r;
                      }
                  }
              });
              
              // Store using distributed storage
              storeUnlockedRiddles(newUnlocked);
              storeLockedRiddles(newLocked);
              if (lastUpdated) {
                  localStorage.setItem("game-last-updated", lastUpdated);
              }
              
              const unlockedListNew = Object.values(newUnlocked);
              setRiddles(unlockedListNew);
              
              setGameStatus("active");

          } else if (gameRes.status === 403 && gameRes.data?.type === 'game_not_started') {
              setGameStatus("not_started");
          }
      }

      // Check for available locked riddles to enable scanning
      setHasLockedRiddles(checkHasLockedRiddles());
      
    } catch (error) {
        console.error("Error loading game:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAllRiddleStorage();
    localStorage.removeItem("game-last-updated");
    logout();
    router.push("/login");
  };

  const closeScanner = () => {
    setShowScanner(false);
    checkAndLoadGame(true); // Always refresh after a scan attempt
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

            {hasLockedRiddles && (
              <StatsGrid
                onOpenScanner={() => setShowScanner(true)}
              />
            )}

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
