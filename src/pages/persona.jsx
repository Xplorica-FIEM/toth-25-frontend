"use client";

import { User, Building2, Phone, Hash, Compass } from "lucide-react";
import { useRouter } from "next/router";

export default function Persona() {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();

    // redirect after form submit
    router.push("/homepg");
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1574432919085-15e4f655360d?auto=format&fit=crop&w=1600&q=80')",
        }}
      />
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Compass className="w-10 h-10 text-amber-400 animate-pulse" />
              <h1 className="text-2xl font-bold text-amber-100">
                Ancient Treasures
              </h1>
            </div>
            <p className="text-amber-100/70">
              Complete your adventurer profile
            </p>
          </div>

          {/* Card */}
          <div className="bg-amber-900/60 border border-amber-700/50 rounded-2xl p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-amber-100 mb-1">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    placeholder="Your full name"
                    className="w-full pl-11 pr-4 py-3 rounded bg-black/40 text-white outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-amber-100 mb-1">Department</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
                  <select
                    required
                    className="w-full pl-11 pr-4 py-3 rounded bg-black/40 text-white outline-none"
                  >
                    <option value="">Select department</option>
                    <option>Computer Science</option>
                    <option>Information Technology</option>
                    <option>Electronics & Communication</option>
                    <option>Mechanical Engineering</option>
                    <option>Electrical Engineering</option>
                    <option>Civil Engineering</option>
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-amber-100 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full pl-11 pr-4 py-3 rounded bg-black/40 text-white outline-none"
                  />
                </div>
              </div>

              {/* Roll No */}
              <div>
                <label className="block text-amber-100 mb-1">
                  Roll Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    placeholder="Department roll number"
                    className="w-full pl-11 pr-4 py-3 rounded bg-black/40 text-white outline-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-xl text-white font-semibold transition"
              >
                Save & Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
