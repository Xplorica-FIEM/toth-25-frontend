// pages/dashboard.jsx - Treasure Hunt Mobile-First Dashboard
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { 
  Compass, MapPin, Trophy, Users, LogOut, Shield, 
  Anchor, Map, Key, Scroll, Crown, Target, X
} from "lucide-react";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getCurrentUser, getProgress, getRiddlesMetadata, getRiddlesForCache } from "@/utils/api";
import { logout, getUser } from "@/utils/auth";
import { getSessionKey } from "@/utils/sessionKey";
import { cacheRiddles, isCachePopulated, cleanupOldIndexedDB } from "@/utils/riddleCache";
import { startBackgroundSync, stopBackgroundSync } from "@/utils/backgroundSync";

const Scan = dynamic(() => import("../components/scan"), {
  ssr: false,
});

function DashboardContent() {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    fetchDashboardData();
    initializeCache();
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
    if (storedUser) {
      setUser(storedUser);
      setLoading(false);
    }

    try {
      const userResponse = await getCurrentUser();
      if (userResponse.ok) {
        setUser(userResponse.data.user);
      }

      const progressResponse = await getProgress();
      if (progressResponse.ok) {
        setProgress(progressResponse.data);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      if (error.message === "Unauthorized" || error.message === "Authentication required") {
        logout();
        router.push("/login");
      }
    }
  };

  const initializeCache = async () => {
    try {
      // Clean up old IndexedDB first (migration from IndexedDB to localStorage)
      await cleanupOldIndexedDB();

      // Ensure session key is generated
      getSessionKey();

      // Check if cache is already populated
      const cacheExists = await isCachePopulated();
      if (cacheExists) {
        console.log('📦 Riddle cache already populated');
        
        // Validate cache has actual puzzle text (not empty from old bug)
        try {
          const cache = localStorage.getItem('toth_riddles_cache');
          if (cache) {
            const riddles = JSON.parse(cache);
            const firstRiddle = riddles[0];
            if (firstRiddle?.encryptedPuzzleText) {
              console.log('✓ Cache validation: encrypted text length =', firstRiddle.encryptedPuzzleText.length);
              // If encrypted text is suspiciously short (< 100), it might be encrypting empty strings
              if (firstRiddle.encryptedPuzzleText.length < 100) {
                console.warn('⚠️ Cache contains invalid data, clearing and reinitializing...');
                const { clearCache } = await import('@/utils/riddleCache');
                await clearCache();
                // Fall through to re-fetch
              } else {
                return; // Cache is valid
              }
            }
          }
        } catch (err) {
          console.error('Cache validation error:', err);
        }
      }

      // Fetch all riddles from backend (with puzzleText)
      console.log('📥 Fetching riddles for offline cache...');
      const response = await getRiddlesForCache();
      
      if (response.ok && response.data.riddles) {
        const riddles = response.data.riddles;
        console.log(`📦 Fetched ${riddles.length} riddles. First riddle puzzleText length:`, riddles[0]?.puzzleText?.length || 0);
        await cacheRiddles(riddles);
        console.log('✅ Riddles cached successfully with encrypted puzzleText');
      }
    } catch (error) {
      console.error('❌ Failed to initialize cache:', error);
      // Non-blocking - app continues to work
    }
  };

  const handleLogout = async () => {
    // Clear cache and stop sync before logout
    const { clearCache } = await import('@/utils/riddleCache');
    const { clearSessionKey } = await import('@/utils/sessionKey');
    
    await clearCache();
    clearSessionKey();
    stopBackgroundSync();
    
    logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-stone-900 via-amber-950 to-stone-900 flex items-center justify-center p-4">
        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes ping-slow {
            0% { transform: scale(1); opacity: 1; }
            75%, 100% { transform: scale(2); opacity: 0; }
          }
        `}</style>
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <Compass className="w-12 h-12 sm:w-16 sm:h-16 text-amber-500 mx-auto" style={{ animation: 'spin-slow 3s linear infinite' }} />
            <div className="absolute inset-0 rounded-full border-2 border-amber-500/50" style={{ animation: 'ping-slow 2s ease-out infinite' }} />
          </div>
          <p className="text-amber-100 text-sm sm:text-base font-medium">Preparing your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-stone-900 via-amber-950 to-stone-900 relative overflow-hidden">
      {/* Floating Treasure Particles - Hidden on mobile, visible on larger screens */}
      <div className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden">
        <Map className="absolute top-10 left-10 w-8 h-8 text-amber-600/20" style={{ animation: 'float 6s ease-in-out infinite' }} />
        <Anchor className="absolute top-40 right-20 w-10 h-10 text-amber-700/20" style={{ animation: 'float 8s ease-in-out infinite 1s' }} />
        <Key className="absolute bottom-20 left-16 w-6 h-6 text-amber-500/20" style={{ animation: 'float 7s ease-in-out infinite 2s' }} />
        <Scroll className="absolute bottom-40 right-10 w-8 h-8 text-amber-600/20" style={{ animation: 'float 9s ease-in-out infinite 1.5s' }} />
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }
          50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.8); }
        }
        @keyframes treasure-bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Mobile-First Navigation Bar */}
      <nav className="relative z-50 bg-linear-to-r from-stone-900/95 to-amber-950/95 backdrop-blur-md border-b border-amber-700/30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5">
          <div className="flex items-center justify-between">
            {/* Logo/Title - Mobile optimized */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" style={{ animation: 'spin-slow 6s linear infinite' }} />
              </div>
              <div>
                <h1 className="text-amber-100 text-base sm:text-lg font-bold">Treasure Hunt</h1>
                <p className="text-amber-200/60 text-xs hidden sm:block">Adventure Awaits</p>
              </div>
            </div>

            {/* Profile Section - Mobile optimized */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 bg-amber-900/40 hover:bg-amber-800/50 border border-amber-700/50 rounded-lg px-2.5 py-2 transition-colors"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-linear-to-br from-amber-600 to-amber-800 flex items-center justify-center border-2 border-amber-500/50">
                  <span className="text-white font-bold text-sm sm:text-base">
                    {user?.fullName?.charAt(0)?.toUpperCase() || "H"}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-amber-100 text-sm font-medium truncate max-w-32">
                    {user?.fullName?.split(' ')[0] || "Hunter"}
                  </p>
                  <p className="text-amber-200/60 text-xs">Explorer</p>
                </div>
              </button>

              {/* Profile Dropdown Menu - Mobile optimized */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-stone-900/98 backdrop-blur-lg border border-amber-700/50 rounded-xl shadow-2xl overflow-hidden z-50">
                  {/* Profile Header */}
                  <div className="bg-linear-to-br from-amber-900/60 to-amber-950/60 p-4 border-b border-amber-700/30">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-linear-to-br from-amber-600 to-amber-800 flex items-center justify-center border-2 border-amber-500/50 shrink-0">
                        <span className="text-white font-bold text-lg sm:text-xl">
                          {user?.fullName?.charAt(0)?.toUpperCase() || "H"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-amber-100 text-base sm:text-lg font-semibold truncate">
                          {user?.fullName}
                        </p>
                        <p className="text-amber-200/70 text-xs sm:text-sm truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details - Mobile optimized */}
                  <div className="px-4 py-3 space-y-2 border-b border-stone-700/50">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-amber-200/70">⚓ Department:</span>
                      <span className="text-amber-100 font-medium truncate ml-2">{user?.department}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-amber-200/70">🗺️ Roll No:</span>
                      <span className="text-amber-100 font-medium">{user?.classRollNo}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-amber-200/70">📞 Phone:</span>
                      <span className="text-amber-100 font-medium">{user?.phoneNumber}</span>
                    </div>
                  </div>

                  {/* Actions - Mobile friendly buttons */}
                  <div className="p-2 space-y-1">
                    {user?.isAdmin && (
                      <>
                        <Link href="/admin/dashboard">
                          <button
                            onClick={() => setShowProfileMenu(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-purple-200 hover:bg-purple-900/40 rounded-lg transition-colors text-sm sm:text-base"
                          >
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Admin Command Center</span>
                          </button>
                        </Link>
                        <Link href="/leaderboard">
                          <button
                            onClick={() => setShowProfileMenu(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-amber-200 hover:bg-amber-900/40 rounded-lg transition-colors text-sm sm:text-base"
                          >
                            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Leaderboard</span>
                          </button>
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-200 hover:bg-red-900/40 rounded-lg transition-colors text-sm sm:text-base"
                    >
                      <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Abandon Quest</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Mobile-First Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-6 space-y-3 sm:space-y-6 h-[calc(100vh-140px)] flex flex-col">
        {/* Welcome Banner - Mobile optimized */}
        <div className="bg-linear-to-r from-amber-900/40 to-stone-900/40 backdrop-blur-sm border border-amber-700/30 rounded-xl p-3 sm:p-6">
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-linear-to-br from-amber-600 to-amber-800 flex items-center justify-center border-2 border-amber-500/50 shrink-0">
              <Crown className="w-5 h-5 sm:w-8 sm:h-8 text-amber-100" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-amber-100 text-base sm:text-2xl md:text-3xl font-bold mb-0.5 sm:mb-1">
                Ahoy, {user?.fullName?.split(' ')[0] || "Explorer"}! ⚓
              </h2>
              <p className="text-amber-200/70 text-xs sm:text-sm md:text-base">
                Your treasure awaits discovery
              </p>
            </div>
          </div>
        </div>

        {/* Main Content - Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 flex-1">
          {/* Stats Card - Full Width on Mobile, Half on Desktop */}
          <div className="bg-linear-to-br from-amber-900/40 to-stone-900/40 backdrop-blur-sm border border-amber-700/30 rounded-xl p-4 sm:p-8 shadow-xl">
            <div className="flex flex-col items-center text-center h-full justify-center">
              <Trophy className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 text-amber-500 mb-3" style={{ animation: 'treasure-bounce 2s ease-in-out infinite' }} />
              <p className="text-amber-200/70 text-sm sm:text-base md:text-lg mb-1.5">Treasures Found</p>
              <p className="text-amber-100 text-5xl sm:text-6xl md:text-7xl font-bold">
                {progress?.riddlesSolved || 0}
              </p>
            </div>
          </div>

          {/* Main Action Button - Full Width on Mobile, Half on Desktop */}
          <button
            onClick={() => setShowScanner(true)}
            className="bg-linear-to-br from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-bold rounded-xl shadow-2xl border-2 border-amber-500/50 transition-all transform hover:scale-[1.02] active:scale-95"
            style={{ 
              animation: 'pulse-glow 3s ease-in-out infinite',
            }}
          >
            <div className="flex flex-col items-center justify-center gap-2 h-full py-6 px-4">
              <MapPin className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24" />
              <div className="text-center">
                <div className="text-lg sm:text-2xl md:text-3xl font-bold mb-1.5">Search for Treasure</div>
                <div className="text-amber-100 text-sm sm:text-base md:text-lg">Scan a marker to begin your quest</div>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Adventures - Full Width Below */}
        {progress?.recentRiddles && progress.recentRiddles.length > 0 && (
          <div className="bg-linear-to-br from-stone-900/60 to-amber-950/60 backdrop-blur-sm border border-amber-700/30 rounded-xl p-3 sm:p-6">
            <h3 className="text-amber-100 text-sm sm:text-lg md:text-xl font-bold mb-2 sm:mb-4 flex items-center gap-2">
              <Scroll className="w-4 h-4 sm:w-6 sm:h-6 text-amber-500" />
              Recent Adventures
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {progress.recentRiddles.slice(0, 3).map((riddle, index) => (
                <div
                  key={index}
                  className="bg-stone-900/50 border border-amber-700/20 rounded-lg p-2.5 sm:p-4 flex items-center gap-2.5 hover:bg-stone-900/70 transition-colors"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-900/50 flex items-center justify-center border border-amber-700/30 shrink-0">
                    <Key className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-amber-100 text-sm sm:text-base font-medium truncate">{riddle.name}</p>
                    <p className="text-amber-200/60 text-xs sm:text-xs">Solved successfully</p>
                  </div>
                  <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-amber-500 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full h-full max-w-4xl max-h-full">
            <button
              onClick={() => {
                setShowScanner(false);
                fetchDashboardData();
              }}
              className="absolute top-2 right-2 z-50 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>
            <Scan
              onClose={() => {
                setShowScanner(false);
                fetchDashboardData();
              }}
            />
          </div>
        </div>
      )}

      {/* Footer - XplOriCa Love */}
      <footer className="relative z-10 mt-auto py-3 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-amber-200/50 text-xs sm:text-sm flex items-center justify-center gap-2">
            <span>Built with</span>
            <span className="text-red-400 animate-pulse text-sm">♥</span>
            <span>from</span>
            <span className="text-amber-400 font-bold">XplOriCa</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
