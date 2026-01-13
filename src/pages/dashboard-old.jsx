// pages/dashboard.jsx - Main dashboard with user stats
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link"; // Import Link for prefetching
import { Compass, ScanLine, Trophy, Users, LogOut, User, TrendingUp, ChevronDown, Shield } from "lucide-react";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getCurrentUser, getProgress, getRiddlesMetadata } from "@/utils/api";
import { logout, getUser } from "@/utils/auth";

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
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Only fetch once on mount
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchDashboardData();
    }

    // Close profile menu when clicking outside
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDashboardData = async () => {
    // PHASE 1: Load critical data from cache immediately (0ms)
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
      setLoading(false); // ✅ User can interact immediately!
    }

    // PHASE 2: Fetch fresh data in background (non-blocking)
    try {
      // Critical: User data first
      const userResponse = await getCurrentUser();
      if (userResponse.ok) {
        setUser(userResponse.data.user);
      }

      // Non-critical: Progress/stats after
      const progressResponse = await getProgress();
      if (progressResponse.ok) {
        setProgress(progressResponse.data.progress);
      }

      // Cache riddles metadata for instant scan results
      const riddlesResponse = await getRiddlesMetadata();
      if (riddlesResponse.ok && riddlesResponse.data.riddles) {
        localStorage.setItem('riddlesMetadata', JSON.stringify({
          riddles: riddlesResponse.data.riddles,
          cachedAt: Date.now()
        }));
        console.log(`✅ Cached ${riddlesResponse.data.riddles.length} riddles metadata`);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      if (!storedUser) {
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col relative">
      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2070')",
        }}
      />
      
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/65" />
      
      <div className="flex flex-col h-full relative z-10">
        {/* Top Navigation Bar */}
        <nav className="bg-stone-900/95 border-b border-stone-700/50 z-20 flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <Compass className="size-6 sm:size-7 text-amber-400" />
                <h1 className="text-amber-100 text-lg sm:text-xl font-bold">TOTH-26</h1>
              </div>

              {/* Profile Section */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-stone-800/60 hover:bg-stone-800 rounded-lg transition-colors border border-stone-700/50"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                      <User className="size-4 text-white" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-amber-100 text-xs font-semibold">
                        {user?.fullName}
                      </p>
                      <p className="text-amber-200/60 text-[10px]">
                        {user?.department}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`size-3 text-amber-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-stone-900/98 border border-stone-700/50 rounded-lg shadow-2xl overflow-hidden">
                    {/* User Info Header */}
                    <div className="px-4 py-3 bg-stone-800/50 border-b border-stone-700/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                          <User className="size-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-amber-100 font-semibold truncate">
                            {user?.fullName}
                          </p>
                          <p className="text-amber-200/70 text-sm truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Profile Details */}
                    <div className="px-4 py-3 space-y-2 border-b border-stone-700/50">
                      <div className="flex justify-between items-center gap-2 text-sm">
                        <span className="text-amber-200/70 flex-shrink-0">Department:</span>
                        <span className="text-amber-100 font-medium text-right truncate">{user?.department}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2 text-sm">
                        <span className="text-amber-200/70 flex-shrink-0">Roll No:</span>
                        <span className="text-amber-100 font-medium text-right truncate">{user?.classRollNo}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2 text-sm">
                        <span className="text-amber-200/70 flex-shrink-0">Phone:</span>
                        <span className="text-amber-100 font-medium text-right truncate">{user?.phoneNumber}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-2">
                      {user?.isAdmin && (
                        <>
                          <Link href="/admin/dashboard">
                            <button
                              onClick={() => setShowProfileMenu(false)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-purple-200 hover:bg-purple-900/40 rounded-lg transition-colors"
                            >
                              <Shield className="size-4" />
                              <span className="text-sm">Admin Panel</span>
                            </button>
                          </Link>
                          <Link href="/leaderboard">
                            <button
                              onClick={() => setShowProfileMenu(false)}
                              className="w-full flex items-center gap-3 px-4 py-2 text-purple-200 hover:bg-purple-900/40 rounded-lg transition-colors"
                            >
                              <Users className="size-4" />
                              <span className="text-sm">Leaderboard</span>
                            </button>
                          </Link>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-200 hover:bg-red-900/40 rounded-lg transition-colors"
                      >
                        <LogOut className="size-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-4 overflow-hidden">
          <div className="max-w-xl w-full">
            {/* Welcome Message - Compact */}
            <div className="mb-4 text-center">
              <h2 className="text-amber-100 text-xl sm:text-2xl font-semibold mb-1">
                Welcome, {user?.fullName?.split(' ')[0] || "Seeker"}! 👋
              </h2>
              <p className="text-amber-100/70 text-sm">
                Ready for your next adventure?
              </p>
            </div>

            {/* Main Scan Button - Centered and Responsive */}
            <div 
              className="bg-linear-to-br from-amber-600/80 to-amber-800/80 rounded-2xl border border-amber-500/50 p-8 sm:p-12 shadow-2xl transform hover:scale-105 transition-transform cursor-pointer active:scale-95"
              onClick={() => setShowScanner(true)}
            >
              <ScanLine className="size-16 sm:size-20 text-white mb-4 mx-auto" />
              <h2 className="text-white text-2xl sm:text-3xl font-bold text-center mb-2">
                Scan QR Code
              </h2>
              <p className="text-amber-100 text-center text-sm sm:text-base">
                Find and scan QR codes to unlock riddles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner modal */}
      {showScanner && (
        <Scan
          onClose={() => {
            setShowScanner(false);
            fetchDashboardData(); // Refresh data after scan
          }}
        />
      )}
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