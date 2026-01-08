import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Compass, AlertCircle } from "lucide-react";
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
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2070')",
          filter: "brightness(0.4)"
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="w-full max-w-md p-4 sm:p-6 bg-amber-900/60 rounded-xl shadow-xl space-y-3 relative z-10 my-4">
        {/* Header */}
        <div className="text-center">
          <Compass className="mx-auto text-amber-400" size={36} />
          <h1 className="text-amber-100 text-xl mt-1">Join the Hunt</h1>
          <p className="text-amber-200/70 text-xs mt-1">
            Begin your adventure into the world of mysteries!
          </p>
        </div>

        {/* Info Message */}
        {showMessage && (
          <div className="p-2 bg-blue-500/20 rounded text-blue-200 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={14} />
            <span>No account found. Create one to continue!</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-2 bg-red-500/20 rounded text-red-200 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-2.5">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-2.5 text-sm rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
            className="w-full p-2.5 text-sm rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="text"
            name="classRollNo"
            placeholder="Class Roll Number"
            value={form.classRollNo}
            onChange={handleChange}
            required
            className="w-full p-2.5 text-sm rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number (Optional)"
            value={form.phoneNumber}
            onChange={handleChange}
            className="w-full p-2.5 text-sm rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            required
            className="w-full p-2.5 text-sm rounded bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="" disabled>Select Department</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept} className="bg-stone-900">
                {dept}
              </option>
            ))}
          </select>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-2.5 text-sm rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className="w-full p-2.5 text-sm rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm bg-amber-600 rounded text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {loading ? "Joining the Hunt..." : "Join the Hunt"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-2 text-center text-amber-200/60 text-xs">
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

