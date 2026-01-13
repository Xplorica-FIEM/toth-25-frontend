// pages/login.jsx - Mobile-First Trails of the Hunt Login
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Mail, Lock, Compass, Key, Anchor, Map, Shield, LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresVerification) {
          router.push(`/verifyotp?email=${encodeURIComponent(formData.email)}`);
        } else {
          setErrors({ submit: data.message || 'Login failed' });
          setLoading(false);
        }
        return;
      }

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to appropriate dashboard
      if (data.user.isAdmin) {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-stone-900 via-amber-950 to-stone-900 relative overflow-hidden">
      {/* Subtle Floating Treasure Icons - Hidden on mobile */}
      <div className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <Key className="absolute top-20 left-20 w-12 h-12 text-amber-600" style={{ animation: 'float 7s ease-in-out infinite' }} />
        <Anchor className="absolute top-1/3 right-16 w-16 h-16 text-amber-700" style={{ animation: 'float 9s ease-in-out infinite 1s' }} />
        <Map className="absolute bottom-1/3 left-10 w-14 h-14 text-amber-500" style={{ animation: 'float 8s ease-in-out infinite 1.5s' }} />
        <Shield className="absolute bottom-20 right-20 w-10 h-10 text-amber-600" style={{ animation: 'float 6s ease-in-out infinite 2s' }} />
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
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>

      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-500 to-transparent"></div>

      {/* Main Container - Mobile First */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header Section with Compass */}
          <div className="text-center mb-8 sm:mb-10">
            {/* Spinning Compass with Ping Effect */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/30" style={{ animation: 'ping-slow 3s ease-out infinite' }} />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-linear-to-br from-amber-600 to-amber-800 border-4 border-amber-500/50 flex items-center justify-center shadow-2xl">
                <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-amber-100" style={{ animation: 'spin-slow 12s linear infinite' }} />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-amber-100 mb-3">
              Hunter's Portal
            </h1>
            <p className="text-amber-200/70 text-sm sm:text-base px-4">
              Enter your credentials to embark on the adventure
            </p>
          </div>

          {/* Login Form Card - Mobile Optimized */}
          <div className="bg-linear-to-br from-stone-900/90 to-amber-950/90 backdrop-blur-lg border-2 border-amber-700/30 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Email Field */}
              <div>
                <label className="flex items-center gap-2 text-amber-200 text-sm font-medium mb-2">
                  <Mail className="w-4 h-4" />
                  Adventurer's Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 sm:py-4 bg-stone-900/50 border-2 border-amber-700/30 rounded-xl text-amber-100 text-base placeholder-amber-600/40 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="hunter@example.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="flex items-center gap-2 text-amber-200 text-sm font-medium mb-2">
                  <Lock className="w-4 h-4" />
                  Secret Code
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-4 bg-stone-900/50 border-2 border-amber-700/30 rounded-xl text-amber-100 text-base placeholder-amber-600/40 focus:border-amber-500 focus:outline-none transition-colors pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500/70 hover:text-amber-400 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 sm:p-4" style={{ animation: 'shake 0.5s ease-in-out' }}>
                  <p className="text-red-200 text-sm text-center">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button - Touch Friendly (min 44px height) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg flex items-center justify-center gap-2"
                style={{ minHeight: '56px' }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Begin the Adventure</span>
                  </>
                )}
              </button>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-4 text-center">
              <Link 
                href="/forgot-password" 
                className="text-amber-400 hover:text-amber-300 text-sm underline"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Register Link */}
            <div className="mt-6 text-center border-t border-amber-700/20 pt-6">
              <p className="text-amber-200/70 text-sm">
                New to the quest?{' '}
                <Link href="/register" className="text-amber-400 hover:text-amber-300 font-semibold underline">
                  Join the Crew
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom Decorative Elements */}
          <div className="mt-6 flex items-center justify-center gap-4 text-amber-600/50 text-xs">
            <span className="flex items-center gap-1">
              <Key className="w-3 h-3" />
              Secure Login
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
