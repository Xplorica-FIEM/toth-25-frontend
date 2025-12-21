"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Compass, KeyRound } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  // Optional: form state
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // TODO: Add actual backend registration logic here

    // Redirect after "registration"
    router.push("/rohan/persona");
  };

  return (
    <div className="min-h-screen relative">
      {/* Background with overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1598177183267-28a7765536de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwdGVtcGxlJTIwcnVpbnMlMjBzdG9uZXxlbnwxfHx8fDE3NjYyNTk3MDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`,
        }}
      />
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 min-h-screen px-6 py-12 flex flex-col items-center justify-center">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <Compass className="size-12 text-amber-400 animate-pulse" />
            <h1 className="text-amber-100">Join The Hunt</h1>
          </div>
          <p className="text-amber-100/70">Create your account to begin the adventure</p>
        </div>

        {/* Registration Form Container */}
        <div className="w-full max-w-md">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-amber-900/20 rounded-2xl blur-2xl" />

            {/* Main container */}
            <form
              onSubmit={handleRegister}
              className="relative bg-gradient-to-br from-amber-900/60 to-stone-900/60 backdrop-blur-md rounded-2xl border border-amber-700/50 p-8 shadow-2xl"
            >
              <div className="text-center mb-8">
                <h2 className="text-amber-100 mb-2">Register</h2>
                <p className="text-amber-100/60">Become a treasure hunter</p>
              </div>

              {/* Email Field */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Mail className="size-5 text-amber-400/60" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-black/30 border border-amber-700/40 rounded-xl text-amber-100 placeholder:text-amber-100/30 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="size-5 text-amber-400/60" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-black/30 border border-amber-700/40 rounded-xl text-amber-100 placeholder:text-amber-100/30 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="mb-8">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <KeyRound className="size-5 text-amber-400/60" />
                  </div>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-black/30 border border-amber-700/40 rounded-xl text-amber-100 placeholder:text-amber-100/30 focus:border-amber-500/60 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/50 hover:scale-105 flex items-center justify-center gap-3 mb-6"
              >
                <Compass className="size-5" />
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}