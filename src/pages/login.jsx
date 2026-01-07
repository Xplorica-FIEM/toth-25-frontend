import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Compass, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2070')",
          filter: "brightness(0.4)",
          opacity: mounted ? 1 : 0,
        }}
      />
      <div className="fixed inset-0 bg-black/60" />

      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md p-8 bg-amber-900/60 rounded-xl shadow-xl border border-amber-800/30 transition-all duration-500" style={{ 
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)'
        }}>
          <div className="text-center mb-8">
            <Compass className="mx-auto text-amber-400" size={42} />
            <h1 className="text-amber-100 text-2xl mt-2 font-serif tracking-wider">
             Treasure Of The Hunt
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-900/50 border border-red-500/50 p-3 rounded text-red-200 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-amber-200/80 text-sm ml-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="seeker@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full p-3 rounded bg-black/40 text-white placeholder-amber-500/50 border border-amber-900/50 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-amber-200/80 text-sm ml-1">Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full p-3 rounded bg-black/40 text-white placeholder-amber-500/50 border border-amber-900/50 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <button
              disabled={loading}
              className="w-full py-3 mt-4 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded shadow-lg shadow-amber-900/50 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading ? "Unlocking..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center text-amber-200/60 text-sm">
            New here?{" "}
            <Link
              href="/register"
              className="text-amber-400 hover:text-amber-300 underline underline-offset-4"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

