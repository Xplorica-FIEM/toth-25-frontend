// components/AdminLayout.jsx - Shared admin layout with sidebar
import { useState } from "react";
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
} from "lucide-react";
import { logout, getUser } from "@/utils/auth";

export default function AdminLayout({ children, activeTab }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const currentUser = getUser();

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
  ];

  return (
    <div className="min-h-screen bg-stone-950 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-stone-900 border-r border-stone-800 transition-all duration-300 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <Shield className="size-8 text-amber-400" />
                <div>
                  <h2 className="text-amber-100 font-bold">Admin Panel</h2>
                  <p className="text-amber-200/60 text-xs">TOTH 2025</p>
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
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-amber-600 text-white"
                    : "text-amber-200 hover:bg-stone-800"
                }`}
              >
                <Icon className="size-5 flex-shrink-0" />
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
            <LogOut className="size-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
