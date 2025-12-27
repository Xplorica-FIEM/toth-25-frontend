// pages/dashboard.jsx - Main dashboard with user stats
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Compass, ScanLine, Trophy, Users, LogOut, User, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getCurrentUser, getProgress } from "@/utils/api";
import { logout, getUser } from "@/utils/auth";
import Loader from "./loadinganimation";

const Scan = dynamic(() => import("../components/scan"), {
  ssr: false,
});

function DashboardContent() {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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
        setProgress(progressResponse.data.data);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader />
      </div>
    );
  }

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

      <div className="relative z-10 min-h-screen px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <header className="mb-8 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Compass className="size-10 text-amber-400" />
                <h1 className="text-amber-100 text-3xl font-bold">
                  Treasure Hunt
                </h1>
              </div>
              <p className="text-amber-100/80">
                Welcome, {user?.fullName || "Seeker"}!
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-900/60 hover:bg-red-900 text-red-200 rounded-lg transition-colors border border-red-700/50"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </header>

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

          {/* Scan Count - Always Show */}
          <div className="bg-linear-to-br from-stone-900/60 to-stone-800/60 rounded-2xl border border-stone-700/50 p-6 shadow-2xl mb-6 text-center">
            <ScanLine className="size-8 text-green-400 mb-2 mx-auto" />
            <p className="text-amber-100 text-lg">
              Total Scans: <span className="font-bold text-green-400">{progress?.gameSession?.totalScans || 0}</span>
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-linear-to-br from-stone-900/60 to-stone-800/60 rounded-2xl border border-stone-700/50 p-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <User className="size-12 text-amber-400" />
              <div className="flex-1">
                <h3 className="text-amber-100 text-lg font-semibold">
                  {user?.fullName}
                </h3>
                <p className="text-amber-200/70 text-sm">
                  {user?.department}
                </p>
                <p className="text-amber-200/60 text-xs mt-1">
                  {user?.email} • {user?.classRollNo}
                </p>
              </div>
              {user?.isAdmin && (
                <button
                  onClick={() => router.push("/admin/dashboard")}
                  className="px-4 py-2 bg-purple-900/60 hover:bg-purple-900 text-purple-200 rounded-lg transition-colors border border-purple-700/50"
                >
                  Admin Panel
                </button>
              )}
            </div>
          </div>

          {/* Admin-only Leaderboard Access */}
          {user?.isAdmin && (
            <div
              className="mt-6 bg-linear-to-br from-purple-900/60 to-stone-900/60 rounded-2xl border border-purple-700/50 p-6 shadow-2xl cursor-pointer hover:border-purple-500 transition-colors"
              onClick={() => router.push("/leaderboard")}
            >
              <Users className="size-12 text-purple-400 mb-4 mx-auto" />
              <h2 className="text-purple-100 text-xl font-semibold mb-2 text-center">
                Leaderboard
              </h2>
              <p className="text-purple-200/70 text-sm text-center">
                View rankings and top performers
              </p>
            </div>
          )}
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

