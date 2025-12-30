import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Compass, AlertCircle } from "lucide-react";
import { register } from "@/utils/api";
import { isAuthenticated, isAdmin } from "@/utils/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { email: emailParam } = router.query;

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
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
    if (!form.email || !form.password || !form.confirmPassword) {
      setError("All fields are required");
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
        form.confirmPassword
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
    <div className="min-h-screen flex items-center justify-center bg-black/80 px-6">
      <div className="w-full max-w-md p-8 bg-amber-900/60 rounded-xl shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <Compass className="mx-auto text-amber-400" size={48} />
          <h1 className="text-amber-100 text-2xl mt-2">Create an Account</h1>
          <p className="text-amber-200/70 text-sm mt-2">
            Sign up to unlock the realm
          </p>
        </div>

        {/* Info Message */}
        {showMessage && (
          <div className="p-3 bg-blue-500/20 rounded text-blue-200 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={16} />
            <span>No account found. Create one to continue!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/20 rounded text-red-200 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-3 rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-3 rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full p-3 rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 rounded text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Register"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-4 text-center text-amber-200/60 text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-amber-400 hover:text-amber-300 underline underline-offset-4"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

