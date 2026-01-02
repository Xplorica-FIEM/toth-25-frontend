// pages/dashboard.jsx - Main dashboard with user stats
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Compass, ScanLine, Trophy, Users, LogOut, User, TrendingUp, ChevronDown, Shield } from "lucide-react";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getCurrentUser, getProgress } from "@/utils/api";
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
    setLoading(true);
    try {
      // Get user from localStorage first
      const storedUser = getUser();
      if (storedUser) {
        setUser(storedUser);
      }

      // Fetch fresh user data and progress
      const [userResponse, progressResponse] = await Promise.all([
        getCurrentUser(),
        getProgress(),
      ]);

      if (userResponse.ok) {
        setUser(userResponse.data.user);
      }

      if (progressResponse.ok) {
        setProgress(progressResponse.data.progress);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1618385418700-35dc948cdeec')",
        }}
      />

      {/* Overlay (hide when scanner is open) */}
      {!showScanner && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm" />
      )}

      <div className="relative z-10 min-h-screen">
        {/* Top Navigation Bar */}
        <nav className="bg-stone-900/90 backdrop-blur-md border-b border-stone-700/50 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <Compass className="size-8 text-amber-400" />
                <h1 className="text-amber-100 text-2xl font-bold">TOTH-25</h1>
              </div>

              {/* Profile Section */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 px-4 py-2 bg-stone-800/60 hover:bg-stone-800 rounded-lg transition-colors border border-stone-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                      <User className="size-5 text-white" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-amber-100 text-sm font-semibold">
                        {user?.fullName}
                      </p>
                      <p className="text-amber-200/60 text-xs">
                        {user?.department}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`size-4 text-amber-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-stone-900/95 backdrop-blur-md border border-stone-700/50 rounded-lg shadow-2xl overflow-hidden">
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
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-200/70">Department:</span>
                        <span className="text-amber-100 font-medium">{user?.department}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-200/70">Roll No:</span>
                        <span className="text-amber-100 font-medium">{user?.classRollNo}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-200/70">Total Scans:</span>
                        <span className="text-green-400 font-bold">{progress?.totalScans || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-2">
                      {user?.isAdmin && (
                        <>
                          <button
                            onClick={() => {
                              router.push("/admin/dashboard");
                              setShowProfileMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-purple-200 hover:bg-purple-900/40 rounded-lg transition-colors"
                          >
                            <Shield className="size-4" />
                            <span className="text-sm">Admin Panel</span>
                          </button>
                          <button
                            onClick={() => {
                              router.push("/leaderboard");
                              setShowProfileMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-purple-200 hover:bg-purple-900/40 rounded-lg transition-colors"
                          >
                            <Users className="size-4" />
                            <span className="text-sm">Leaderboard</span>
                          </button>
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
        <div className="px-6 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Welcome Message */}
            <div className="mb-8">
              <h2 className="text-amber-100 text-2xl font-semibold mb-2">
                Welcome back, {user?.fullName?.split(' ')[0] || "Seeker"}! 👋
              </h2>
              <p className="text-amber-100/70">
                Ready to continue your treasure hunt adventure?
              </p>
            </div>

            {/* Main Scan Button - Centered and Large for Mobile */}
            <div className="mb-8">
              <div 
                className="bg-linear-to-br from-amber-600/80 to-amber-800/80 rounded-2xl border border-amber-500/50 p-12 shadow-2xl transform hover:scale-105 transition-transform cursor-pointer active:scale-95"
                onClick={() => setShowScanner(true)}
              >
                <ScanLine className="size-24 text-white mb-6 mx-auto" />
                <h2 className="text-white text-3xl font-bold text-center mb-3">
                  Scan QR Code
                </h2>
                <p className="text-amber-100 text-center text-lg">
                  Find and scan QR codes to unlock riddles
                </p>
              </div>
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