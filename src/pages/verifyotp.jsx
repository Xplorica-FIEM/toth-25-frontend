// pages/verifyotp.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Compass, AlertCircle } from "lucide-react";

export default function VerifyOtp() {
  const router = useRouter();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const { email: emailQuery } = router.query;

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Prefer email from query, fallback to localStorage
    if (emailQuery) {
      setEmail(emailQuery);
      localStorage.setItem("email", emailQuery); // store email for complete profile
    } else {
      const storedEmail = localStorage.getItem("email");
      if (storedEmail) setEmail(storedEmail);
    }
  }, [emailQuery]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== 4) {
      setError("OTP must be 4 digits");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "OTP verification failed");
      }

      setSuccess(data.message || "Email verified successfully!");

      // Save email in localStorage (in case user refreshes page)
      localStorage.setItem("email", email);

      // Move to complete profile page after 1.5s
      setTimeout(() => {
        router.push("/completeprofile");
      }, 1500);
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
          <h1 className="text-amber-100 text-2xl mt-2">Verify Your Email</h1>
          <p className="text-amber-200/70 text-sm mt-2">
            Enter the 4-digit OTP sent to your email
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-500/20 rounded text-red-200 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="p-3 bg-green-500/20 rounded text-green-200 text-sm">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="email"
            value={email}
            disabled
            className="w-full p-3 rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 rounded text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
