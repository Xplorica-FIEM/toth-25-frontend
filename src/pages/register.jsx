// pages/register.jsx - Mobile-First Trails of the Hunt Registration
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { UserPlus, Mail, Phone, User, Hash, Lock, Map, Anchor, Ship, Scroll, Compass, Eye, EyeOff } from 'lucide-react';
import { DEPARTMENTS } from '../constants/departments';
import { saveToken } from '@/utils/auth';
import Head from 'next/head';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    department: '',
    classRollNo: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid Indian phone number';
    }

    if (!formData.department) {
      newErrors.department = 'Please select your department';
    }

    if (!formData.classRollNo.trim()) {
      newErrors.classRollNo = 'Roll number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log('Register response:', { status: res.status, data });

      if (!res.ok) {
        const errorMessage = data.error || data.message || 'Registration failed';

        // Check if email already registered - redirect to login
        if (errorMessage.toLowerCase().includes('email') &&
          (errorMessage.toLowerCase().includes('already') ||
            errorMessage.toLowerCase().includes('exists') ||
            errorMessage.toLowerCase().includes('registered'))) {
          // Show error briefly then redirect
          setErrors({ submit: errorMessage });
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }

        setErrors({ submit: errorMessage });
        setLoading(false);
        return;
      }

      const { token, user } = data;
      if (token) {
        saveToken(token);
      }

      router.push(user?.isAdmin ? '/admin/dashboard' : '/dashboard');
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-stone-900 via-amber-950 to-stone-900 relative overflow-hidden">
      <Head>
        <title>Register - Trails of the Hunt</title>
        <meta name="description" content="Join the Trails of the Hunt - Register to embark on legendary adventures and uncover hidden treasures!" />
      </Head>
      {/* Subtle Floating Particles - Hidden on mobile, visible on tablet+ */}
      <div className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <Map className="absolute top-20 left-10 w-16 h-16 text-amber-600" style={{ animation: 'float 8s ease-in-out infinite' }} />
        <Anchor className="absolute top-1/4 right-20 w-20 h-20 text-amber-700" style={{ animation: 'float 10s ease-in-out infinite 1s' }} />
        <Ship className="absolute bottom-1/4 left-16 w-14 h-14 text-amber-500" style={{ animation: 'float 9s ease-in-out infinite 2s' }} />
        <Scroll className="absolute bottom-20 right-10 w-12 h-12 text-amber-600" style={{ animation: 'float 7s ease-in-out infinite 1.5s' }} />
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(5deg); }
        }
        @keyframes pulse-border {
          0%, 100% { border-color: rgba(251, 191, 36, 0.3); }
          50% { border-color: rgba(251, 191, 36, 0.6); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-amber-500 to-transparent"></div>

      {/* Main Container - Mobile First */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-br from-amber-600 to-amber-800 border-4 border-amber-500/30 mb-4" style={{ animation: 'spin-slow 20s linear infinite' }}>
              <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-amber-100" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-100 mb-2">
              Recruit New Hunter
            </h1>
            <p className="text-amber-200/70 text-sm sm:text-base">
              Chart your course to legendary treasures!
            </p>
          </div>

          {/* Registration Form - Mobile Optimized */}
          <div className="bg-linear-to-br from-stone-900/90 to-amber-950/90 backdrop-blur-lg border-2 border-amber-700/30 rounded-2xl p-5 sm:p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-amber-200 text-sm font-medium mb-2">
                  <User className="w-4 h-4" />
                  Hunter's Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-stone-900/50 border-2 border-amber-700/30 rounded-xl text-amber-100 text-base placeholder-amber-600/40 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
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
                  className="w-full px-4 py-3 bg-stone-900/50 border-2 border-amber-700/30 rounded-xl text-amber-100 text-base placeholder-amber-600/40 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="hunter@example.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="flex items-center gap-2 text-amber-200 text-sm font-medium mb-2">
                  <Phone className="w-4 h-4" />
                  Contact Signal
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-stone-900/50 border-2 border-amber-700/30 rounded-xl text-amber-100 text-base placeholder-amber-600/40 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="9876543210"
                />
                {errors.phoneNumber && (
                  <p className="text-red-400 text-xs mt-1">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="flex items-center gap-2 text-amber-200 text-sm font-medium mb-2">
                  <Map className="w-4 h-4" />
                  Guild Division
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-stone-900/50 border-2 border-amber-700/30 rounded-xl text-amber-100 text-base focus:border-amber-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="" className="bg-stone-900">Select your guild</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept.code} value={dept.code} className="bg-stone-900">
                      {dept.code} - {dept.name}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="text-red-400 text-xs mt-1">{errors.department}</p>
                )}
              </div>

              {/* Roll Number */}
              <div>
                <label className="flex items-center gap-2 text-amber-200 text-sm font-medium mb-2">
                  <Hash className="w-4 h-4" />
                  Hunter ID
                </label>
                <input
                  type="text"
                  name="classRollNo"
                  value={formData.classRollNo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-stone-900/50 border-2 border-amber-700/30 rounded-xl text-amber-100 text-base placeholder-amber-600/40 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Your roll number"
                />
                {errors.classRollNo && (
                  <p className="text-red-400 text-xs mt-1">{errors.classRollNo}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="flex items-center gap-2 text-amber-200 text-sm font-medium mb-2">
                  <Lock className="w-4 h-4" />
                  Secret Code
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-stone-900/50 border-2 border-amber-700/30 rounded-xl text-amber-100 text-base placeholder-amber-600/40 focus:border-amber-500 focus:outline-none transition-colors pr-12"
                    placeholder="Min. 6 characters"
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
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="flex items-center gap-2 text-amber-200 text-sm font-medium mb-2">
                  <Lock className="w-4 h-4" />
                  Confirm Secret Code
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-stone-900/50 border-2 border-amber-700/30 rounded-xl text-amber-100 text-base placeholder-amber-600/40 focus:border-amber-500 focus:outline-none transition-colors pr-12"
                    placeholder="Repeat your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500/70 hover:text-amber-400 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3">
                  <p className="text-red-200 text-sm text-center">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button - Touch Friendly */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
                style={{ minHeight: '56px' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering...
                  </span>
                ) : (
                  '🏴‍☠️ Join the Trails of the Hunt'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-amber-200/70 text-sm">
                Already a crew member?{' '}
                <Link href="/login" className="text-amber-400 hover:text-amber-300 font-semibold underline">
                  Return to Portal
                </Link>
              </p>
            </div>
          </div>

          {/* Decorative Bottom Element */}
          <div className="mt-6 text-center">
            <p className="text-amber-600/50 text-xs">
              ⚓ Secure Registration • Encrypted Data ⚓
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
