import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Compass, AlertCircle, Map, Scroll, Anchor, Ship } from "lucide-react";
import { register } from "@/utils/api";
import { isAuthenticated, isAdmin } from "@/utils/auth";
import { DEPARTMENTS } from "@/constants/departments";

export default function RegisterPage() {
  const router = useRouter();
  const { email: emailParam } = router.query;

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    classRollNo: "",
    phoneNumber: "",
    department: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated()) {
      if (isAdmin()) {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }
    
    // Pre-fill email if coming from login redirect
    if (emailParam && !form.email) {
      setForm(prev => ({ ...prev, email: emailParam }));
      setShowMessage(true);
    }
  }, [router, emailParam]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!form.email || !form.password || !form.confirmPassword || !form.fullName || !form.classRollNo || !form.department) {
      setError("All fields are required except phone number");
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await register(
        form.email.trim(),
        form.password,
        form.confirmPassword,
        form.fullName.trim(),
        form.classRollNo.trim(),
        form.phoneNumber.trim(),
        form.department
      );

      if (!response.ok) {
        throw new Error(response.data.error || "Registration failed");
      }

      // Store email for OTP verification
      localStorage.setItem("email", form.email.trim());

      // Redirect to OTP verification page
      router.push(`/verifyotp?email=${encodeURIComponent(form.email.trim())}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto flex items-center justify-center bg-black px-4 py-4 relative">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2070')",
          filter: "brightness(0.35) saturate(1.2)"
        }}
      />
      
      {/* Animated Treasure Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-amber-400/20 animate-pulse">
          <Map size={32} className="animate-float" />
        </div>
        <div className="absolute top-20 right-20 text-amber-400/20 animate-pulse" style={{animationDelay: '1s'}}>
          <Anchor size={28} className="animate-float" />
        </div>
        <div className="absolute bottom-32 left-20 text-amber-400/20 animate-pulse" style={{animationDelay: '2s'}}>
          <Ship size={36} className="animate-float" />
        </div>
        <div className="absolute bottom-20 right-32 text-amber-400/20 animate-pulse" style={{animationDelay: '0.5s'}}>
          <Scroll size={30} className="animate-float" />
        </div>
      </div>
      
      {/* Dark Overlay with Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-black/30 via-black/50 to-black/70" />
      
      {/* Content */}
      <div className="w-full max-w-md p-6 bg-linear-to-br from-amber-900/70 via-orange-900/60 to-amber-900/70 rounded-2xl shadow-2xl border-2 border-amber-600/40 space-y-4 relative z-10 my-4 backdrop-blur-sm">
        {/* Decorative Corner Elements */}
        <div className="absolute -top-2 -left-2 w-16 h-16 border-t-4 border-l-4 border-amber-400/60 rounded-tl-xl"></div>
        <div className="absolute -top-2 -right-2 w-16 h-16 border-t-4 border-r-4 border-amber-400/60 rounded-tr-xl"></div>
        <div className="absolute -bottom-2 -left-2 w-16 h-16 border-b-4 border-l-4 border-amber-400/60 rounded-bl-xl"></div>
        <div className="absolute -bottom-2 -right-2 w-16 h-16 border-b-4 border-r-4 border-amber-400/60 rounded-br-xl"></div>
        
        {/* Header */}
        <div className="text-center relative">
          <div className="relative inline-block">
            <Compass className="mx-auto text-amber-400 animate-spin-slow" size={48} />
            <div className="absolute inset-0 animate-ping opacity-30">
              <Compass className="text-amber-300" size={48} />
            </div>
          </div>
          <h1 className="text-amber-100 text-3xl font-bold mt-3 tracking-wide drop-shadow-lg">
            ⚓ Recruit New Hunter ⚓
          </h1>
          <p className="text-amber-200/80 text-sm mt-2 font-medium">
            🗺️ Chart your course to legendary treasures!
          </p>
        </div>

        {/* Info Message */}
        {showMessage && (
          <div className="p-3 bg-blue-500/30 border border-blue-400/50 rounded-lg text-blue-100 text-sm flex items-center gap-2 animate-bounce-in shadow-lg">
            <AlertCircle size={16} />
            <span>⚡ No adventurer found! Join the quest!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/30 border border-red-400/50 rounded-lg text-red-100 text-sm flex items-center gap-2 animate-shake shadow-lg">
            <AlertCircle size={16} />
            <span>🚨 {error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-3">
          <div className="relative group">
            <input
              type="email"
              name="email"
              placeholder="✉️ Adventurer's Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-3 text-sm rounded-lg bg-black/50 border-2 border-amber-600/30 text-white placeholder-amber-300/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all group-hover:border-amber-500/50"
            />
          </div>
          
          <div className="relative group">
            <input
              type="text"
              name="fullName"
              placeholder="👤 Hunter's Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full p-3 text-sm rounded-lg bg-black/50 border-2 border-amber-600/30 text-white placeholder-amber-300/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all group-hover:border-amber-500/50"
            />
          </div>
          
          <div className="relative group">
            <input
              type="text"
              name="classRollNo"
              placeholder="🎯 Hunter ID (Roll Number)"
              value={form.classRollNo}
              onChange={handleChange}
              required
              className="w-full p-3 text-sm rounded-lg bg-black/50 border-2 border-amber-600/30 text-white placeholder-amber-300/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all group-hover:border-amber-500/50"
            />
          </div>
          
          <div className="relative group">
            <input
              type="tel"
              name="phoneNumber"
              placeholder="📱 Contact Signal (Optional)"
              value={form.phoneNumber}
              onChange={handleChange}
              className="w-full p-3 text-sm rounded-lg bg-black/50 border-2 border-amber-600/30 text-white placeholder-amber-300/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all group-hover:border-amber-500/50"
            />
          </div>
          
          <div className="relative group">
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
              required
              className="w-full p-3 text-sm rounded-lg bg-black/50 border-2 border-amber-600/30 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all group-hover:border-amber-500/50"
            >
              <option value="" disabled className="bg-stone-900">🏛️ Select Your Guild</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="bg-stone-900">
                  {dept}
                </option>
              ))}
            </select>
          </div>
          
          <div className="relative group">
            <input
              type="password"
              name="password"
              placeholder="🔐 Secret Code"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full p-3 text-sm rounded-lg bg-black/50 border-2 border-amber-600/30 text-white placeholder-amber-300/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all group-hover:border-amber-500/50"
            />
          </div>
          
          <div className="relative group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="🔒 Confirm Secret Code"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-3 text-sm rounded-lg bg-black/50 border-2 border-amber-600/30 text-white placeholder-amber-300/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all group-hover:border-amber-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-base font-bold bg-linear-to-r from-amber-600 via-orange-600 to-amber-600 rounded-lg text-white hover:from-amber-500 hover:via-orange-500 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg border-2 border-amber-400/50 hover:shadow-amber-500/50 hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Compass className="animate-spin" size={20} />
                🗺️ Setting Sail...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                🏴‍☠️ Join the Treasure Hunt 🏴‍☠️
              </span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t-2 border-amber-600/30 text-center text-amber-200/70 text-sm">
          <span>Already a seasoned hunter? </span>
          <Link
            href="/login"
            className="text-amber-400 hover:text-amber-300 underline underline-offset-4 font-semibold"
          >
            ⚔️ Return to the Quest
          </Link>
        </div>
      </div>
      
      {/* Add custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}

