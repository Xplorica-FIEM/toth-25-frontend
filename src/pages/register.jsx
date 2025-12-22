import { useState } from "react";
import { useRouter } from "next/router";
import { Mail, Lock, KeyRound, Compass } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${BACKEND_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      router.push(
        `/verifyotp?email=${encodeURIComponent(form.email)}`
      );
    } catch (err) {
      console.error("❌ Register error:", err);
      setError(err.message || "Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1598177183267-28a7765536de?auto=format&fit=crop&w=1600&q=80')",
        }}
      />
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Compass className="w-10 h-10 text-amber-400 animate-pulse" />
              <h1 className="text-2xl font-bold text-amber-100">
                Join The Hunt
              </h1>
            </div>
            <p className="text-amber-100/70">
              Create your account to begin
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleRegister}
            className="bg-amber-900/60 border border-amber-700/50 backdrop-blur-md rounded-2xl p-8 space-y-5 shadow-xl"
          >
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400/60" />
              <input
                name="email"
                type="email"
                required
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 rounded bg-black/30 text-amber-100 placeholder-amber-100/40 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400/60" />
              <input
                name="password"
                type="password"
                required
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 rounded bg-black/30 text-amber-100 placeholder-amber-100/40 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400/60" />
              <input
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 rounded bg-black/30 text-amber-100 placeholder-amber-100/40 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-500 hover:to-amber-600 transition disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
