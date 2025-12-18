"use client";

import { useState, useEffect } from "react";
import { Compass } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyOtp() {
  const router = useRouter();
  const BACKEND_URL = 'https://8a23269b-e703-40f1-b9b1-fb7c6cc19541-00-enj9bfg3qvg.pike.replit.dev';
  const searchParams = useSearchParams();
  const emailQuery = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailQuery);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (emailQuery) {
      setEmail(emailQuery);
    }
  }, [emailQuery]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    try {
      setLoading(true);
      console.log("Verifying OTP to:", `${BACKEND_URL}/auth/verify-otp`);

      const res = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }

      setSuccess(data.message || "Email verified successfully!");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      console.error("Verification error:", err);
      setError(err.message || "Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${BACKEND_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      setSuccess("OTP resent successfully! Check your email.");
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(err.message || "Error resending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/80">
      <div className="w-full max-w-md p-8 bg-amber-900/60 rounded-xl shadow-xl">
        <div className="text-center mb-6">
          <Compass className="mx-auto text-amber-400" size={48} />
          <h1 className="text-amber-100 text-2xl mt-2">Verify Your Email</h1>
          <p className="text-amber-200/70 text-sm mt-2">
            Enter the 6-digit OTP sent to your email
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded text-green-200 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={!!emailQuery}
            className="w-full p-3 rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
          />
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 6) {
                setOtp(value);
              }
            }}
            maxLength={6}
            required
            className="w-full p-3 rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center text-2xl tracking-widest"
          />

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-amber-600 py-3 rounded text-white hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleResendOtp}
            disabled={loading}
            className="text-amber-400 hover:underline text-sm disabled:opacity-50"
          >
            Didn't receive OTP? Resend
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-4">
          <a href="/register" className="text-amber-400 hover:underline">
            Back to Registration
          </a>
        </p>
      </div>
    </div>
  );
}