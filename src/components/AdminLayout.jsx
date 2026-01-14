// components/AdminLayout.jsx - Shared admin layout with sidebar
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  Users,
  Scroll,
  Trophy,
  BarChart3,
  LogOut,
  Menu,
  X,
  Shield,
  ImagePlus,
  Settings,
  ScanLine,
} from "lucide-react";
import { logout } from "@/utils/auth";
import { getCurrentUser } from "@/utils/api";

export default function AdminLayout({ children, activeTab }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Fetch user from API instead of localStorage
    const fetchUser = async () => {
        try {
            const res = await getCurrentUser();
            if (res.ok && res.data?.user) {
                setCurrentUser(res.data.user);
            }
        } catch (err) {
            console.error("Failed to fetch user in layout", err);
        }
    };
    fetchUser();
    
    // Detect mobile on mount and resize
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true); // Auto-open on desktop
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: "users", label: "Users", icon: Users, path: "/admin/users" },
    { id: "riddles", label: "Riddles", icon: Scroll, path: "/admin/riddles" },
    
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, path: "/admin/leaderboard" },
    { id: "statistics", label: "Statistics", icon: BarChart3, path: "/admin/statistics" },
    { id: "verify-qr", label: "Verify QR", icon: ScanLine, path: "/admin/verify-qr" },
    { id: "settings", label: "Global Settings", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <div className="h-screen bg-stone-950 flex relative overflow-hidden">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isMobile
            ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : sidebarOpen ? "w-64" : "w-20"
        } bg-stone-900 border-r border-stone-800 flex flex-col h-screen`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <Shield className="size-8 text-amber-400" />
                <div>
                  <h2 className="text-amber-100 font-bold">Admin Panel</h2>
                  <p className="text-amber-200/60 text-xs">TOTH 2026</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-amber-200 hover:text-amber-100"
              >
                <X className="size-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-amber-200 hover:text-amber-100 mx-auto"
            >
              <Menu className="size-6" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  router.push(item.path);
                  if (isMobile) setSidebarOpen(false); // Close sidebar on mobile after navigation
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-amber-600 text-white"
                    : "text-amber-200 hover:bg-stone-800"
                }`}
              >
                <Icon className="size-5 shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          {sidebarOpen && (
            <div className="px-4 py-2 bg-stone-800/50 rounded-lg mb-2">
              <p className="text-amber-100 text-sm font-semibold truncate">
                {currentUser?.fullName}
              </p>
              <p className="text-amber-200/60 text-xs truncate">{currentUser?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="size-5 shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col h-screen overflow-hidden ${isMobile ? 'w-full' : ''}`}>
        {/* Mobile Menu Button */}
        {isMobile && !sidebarOpen && (
          <div className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur-sm border-b border-stone-800 p-4 flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 text-amber-200 hover:text-amber-100"
            >
              <Menu className="size-6" />
              <span className="font-medium">Menu</span>
            </button>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
