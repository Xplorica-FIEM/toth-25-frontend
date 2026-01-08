import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Compass, AlertCircle, Map, Anchor, Key, Shield } from "lucide-react";
import { login } from "@/utils/api";
import { saveToken, saveUser, isAuthenticated, isAdmin } from "@/utils/auth";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Prevent FOUC by ensuring styles are loaded
    setMounted(true);
    
    // Redirect if already authenticated
    if (isAuthenticated()) {
      if (isAdmin()) {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(
        form.email.trim().toLowerCase(),
        form.password.trim()
      );

      if (!response.ok) {
        setLoading(false);
        
        // User doesn't exist - redirect to register
        if (response.status === 404 && response.data?.action === "register") {
          setError(response.data?.error || "No account found");
          setTimeout(() => {
            router.push(`/register?email=${encodeURIComponent(form.email)}`);
          }, 2000);
          return;
        }
        
        // Wrong password
        if (response.status === 401) {
          setError(response.data?.error || "Incorrect password. Please try again.");
          return;
        }
        
        // Email not verified
        if (response.status === 403 && response.data?.action === "verify-email") {
          setError("Please verify your email first. Redirecting...");
          setTimeout(() => {
            router.push(`/verifyotp?email=${encodeURIComponent(form.email)}`);
          }, 2000);
          return;
        }
        
        // Profile not completed
        if (response.status === 403 && response.data?.action === "complete-profile") {
          setError("Please complete your profile. Redirecting...");
          setTimeout(() => {
            router.push(`/completeprofile?email=${encodeURIComponent(form.email)}`);
          }, 2000);
          return;
        }
        
        // Other errors
        setError(response.data?.error || response.data?.message || "Login failed");
        return;
      }

      // Extract token and user from response.data
      const { token, user } = response.data;

      if (!token || !user) {
        setLoading(false);
        setError("Invalid response from server");
        return;
      }

      // Save token and user data
      saveToken(token);
      saveUser(user);

      // Redirect based on admin status
      if (user.isAdmin) {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      setError(err.message || "Server not reachable. Check connection.");
    }
  };

  // Prevent FOUC - don't render until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-900" />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2070')",
          filter: "brightness(0.35) saturate(1.2)",
          opacity: mounted ? 1 : 0,
        }}
      />
      
      {/* Floating Treasure Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-16 text-amber-400/15 animate-pulse" style={{animationDelay: '0s'}}>
          <Map size={40} className="animate-float" />
        </div>
        <div className="absolute top-40 right-24 text-amber-400/15 animate-pulse" style={{animationDelay: '1.5s'}}>
          <Anchor size={36} className="animate-float" />
        </div>
        <div className="absolute bottom-32 left-32 text-amber-400/15 animate-pulse" style={{animationDelay: '0.7s'}}>
          <Key size={34} className="animate-float" />
        </div>
        <div className="absolute bottom-40 right-16 text-amber-400/15 animate-pulse" style={{animationDelay: '2s'}}>
          <Shield size={38} className="animate-float" />
        </div>
      </div>
      
      {/* Vignette Overlay */}
      <div className="fixed inset-0 bg-gradient-radial from-transparent via-black/40 to-black/70" />

      <div className="min-h-screen flex items-center justify-center px-6 relative z-10">
        <div className="w-full max-w-md p-8 bg-gradient-to-br from-amber-900/70 via-orange-900/60 to-amber-900/70 rounded-2xl shadow-2xl border-2 border-amber-600/40 backdrop-blur-sm transition-all duration-700" style={{ 
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)'
        }}>
          {/* Decorative Corners */}
          <div className="absolute -top-2 -left-2 w-20 h-20 border-t-4 border-l-4 border-amber-400/60 rounded-tl-2xl"></div>
          <div className="absolute -top-2 -right-2 w-20 h-20 border-t-4 border-r-4 border-amber-400/60 rounded-tr-2xl"></div>
          <div className="absolute -bottom-2 -left-2 w-20 h-20 border-b-4 border-l-4 border-amber-400/60 rounded-bl-2xl"></div>
          <div className="absolute -bottom-2 -right-2 w-20 h-20 border-b-4 border-r-4 border-amber-400/60 rounded-br-2xl"></div>
          
          {/* Header */}
          <div className="text-center mb-8 relative">
            <div className="relative inline-block mb-4">
              <Compass className="mx-auto text-amber-400 animate-spin-slow" size={56} />
              <div className="absolute inset-0 animate-ping opacity-20">
                <Compass className="text-amber-300" size={56} />
              </div>
            </div>
            <h1 className="text-amber-100 text-3xl font-bold tracking-wide drop-shadow-lg">
              ⚓ Hunter's Portal ⚓
            </h1>
            <p className="text-amber-200/80 text-sm mt-2 font-medium">
              🗺️ Continue your legendary quest!
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-500/30 border-2 border-red-400/50 p-3 rounded-lg text-red-100 text-sm flex items-center gap-2 animate-shake shadow-lg">
                <AlertCircle size={18} />
                <span className="font-medium">🚨 {error}</span>
              </div>
            )}

            <div className="space-y-2 relative group">
              <label className="text-amber-200/90 text-sm ml-1 font-semibold flex items-center gap-2">
                ✉️ Adventurer's Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="your.email@quest.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full p-3.5 rounded-lg bg-black/50 border-2 border-amber-600/30 text-white placeholder-amber-300/40 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all group-hover:border-amber-500/50 shadow-inner"
              />
            </div>

            <div className="space-y-2 relative group">
              <label className="text-amber-200/90 text-sm ml-1 font-semibold flex items-center gap-2">
                🔐 Secret Code
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full p-3.5 rounded-lg bg-black/50 border-2 border-amber-600/30 text-white placeholder-amber-300/40 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all group-hover:border-amber-500/50 shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-6 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:via-orange-500 hover:to-amber-500 text-white font-bold text-lg rounded-lg shadow-lg border-2 border-amber-400/50 hover:shadow-amber-500/50 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Compass className="animate-spin" size={22} />
                  ⚔️ Entering...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🏴‍☠️ Begin the Adventure 🏴‍☠️
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 border-amber-600/30 text-center text-amber-200/70 text-sm">
            <span>New to the quest? </span>
            <Link
              href="/register"
              className="text-amber-400 hover:text-amber-300 underline underline-offset-4 font-semibold"
            >
              ⚓ Join the Hunt
            </Link>
          </div>
        </div>
      </div>
      
      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(5deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}

