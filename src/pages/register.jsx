import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Compass, AlertCircle } from "lucide-react";
import { register, verifyOTP, resendOTP } from "@/utils/api";
import { isAuthenticated, isAdmin, saveToken, saveUser } from "@/utils/auth";
import { DEPARTMENTS } from "@/constants/departments";

export default function RegisterPage() {
  const router = useRouter();
  const { email: emailParam } = router.query;

  // Step state: 1 = Register, 2 = Verify OTP
  const [step, setStep] = useState(1);

  // Common State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Register State (Consolidated)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    classRollNo: "",
    phoneNumber: "",
    department: "",
  });

  // OTP State
  const [otp, setOtp] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated()) {
      if (isAdmin()) {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }

    // Pre-fill email if provided via URL or localStorage
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }));
    } else {
      const storedEmail = localStorage.getItem("email");
      if (storedEmail) setFormData(prev => ({ ...prev, email: storedEmail }));
    }
  }, [router, emailParam]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (
      !formData.email || 
      !formData.password || 
      !formData.confirmPassword ||
      !formData.fullName ||
      !formData.classRollNo ||
      !formData.department
    ) {
      setError("All fields are required (except which are marked optional)");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const trimmedEmail = formData.email.trim();
      const response = await register(
        trimmedEmail,
        formData.password,
        formData.confirmPassword,
        formData.fullName,
        formData.classRollNo,
        formData.phoneNumber,
        formData.department
      );

      if (!response.ok) {
        throw new Error(response.data.error || "Registration failed");
      }

      // Update state with trimmed email to ensure consistency for OTP step
      setFormData(prev => ({ ...prev, email: trimmedEmail }));
      
      // Store email and move to OTP step
      localStorage.setItem("email", trimmedEmail);
      setSuccess("Account created! Please verify your email.");
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== 4) {
      setError("OTP must be 4 digits");
      return;
    }

    setLoading(true);

    try {
      // Use trimmed email for verification
      const response = await verifyOTP(formData.email.trim(), otp);

      if (!response.ok) {
        throw new Error(response.data.error || "OTP verification failed");
      }

      setSuccess(response.data.message || "Email verified successfully!");
      
      // Auto Login logic similar to login page
      const { token, user } = response.data;
      
      if (token && user) {
        saveToken(token);
        saveUser(user);
        localStorage.removeItem("email");

        // Small delay to show success message
        setTimeout(() => {
          if (user.isAdmin) {
            router.push("/admin/dashboard");
          } else {
            router.push("/dashboard");
          }
        }, 1500);
      } else {
        // Fallback if no token returned (should not happen)
        setTimeout(() => router.push("/login"), 1500);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const response = await resendOTP(formData.email.trim());

      if (!response.ok) {
        throw new Error(response.data.error || "Failed to resend OTP");
      }

      setSuccess("OTP resent successfully! Check your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6 relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2070')",
          filter: "brightness(0.4)",
        }}
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="w-full max-w-md p-8 bg-amber-900/60 rounded-xl shadow-xl space-y-6 relative z-10 backdrop-blur-sm">
        <div className="text-center">
          <Compass className="mx-auto text-amber-400" size={48} />
          <h1 className="text-amber-100 text-2xl mt-2">
            {step === 1
              ? "Create an Account"
              : "Verify Email"}
          </h1>
          <p className="text-amber-200/70 text-sm mt-2">
            {step === 1
              ? "Sign up to step into the world of mysteries!"
              : "Enter the 4-digit OTP sent to your email"}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 rounded text-red-200 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/20 rounded text-green-200 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full p-3 rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
             <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="classRollNo"
                  placeholder="Class/Roll No"
                  value={formData.classRollNo}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone (Optional)"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value.replace(/\D/g, "").slice(0, 10)})}
                  className="w-full p-3 rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
            </div>
            
             <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full p-3 rounded bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 appearance-none"
            >
              <option value="" disabled className="bg-black text-gray-400">
                Select Department
              </option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} className="bg-black">
                  {dept}
                </option>
              ))}
            </select>

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-3 rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 rounded text-white hover:bg-amber-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <div className="mt-4 text-center text-amber-200/60 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-amber-400 hover:text-amber-300 underline underline-offset-4"
              >
                Login
              </Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full p-3 rounded bg-black/40 text-gray-400 cursor-not-allowed"
            />
            <input
              type="text"
              placeholder="Enter 4-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              maxLength={4}
              required
              className="w-full p-3 rounded bg-black/40 text-white placeholder-gray-400 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500"
            />

            <button
              onClick={handleVerifyOTP}
              disabled={loading}
              className="w-full py-3 bg-amber-600 rounded text-white hover:bg-amber-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="text-center">
              <button
                onClick={handleResendOTP}
                disabled={resending}
                className="text-amber-300 hover:text-amber-100 text-sm disabled:text-amber-700 underline underline-offset-2"
              >
                {resending ? "Sending..." : "Resend OTP"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
