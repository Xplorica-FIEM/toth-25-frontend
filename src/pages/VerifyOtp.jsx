"use client";

import { useState, useEffect } from "react";
import { Compass } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyOtp() {
  const router = useRouter();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const searchParams = useSearchParams();
  const emailQuery = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailQuery);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (emailQuery) setEmail(emailQuery);
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
      const res = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || "Verification failed");
      }

      const data = await res.json();
      setSuccess(data.message || "Email verified successfully!");

      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/80">
      <div className="w-full max-w-md p-8 bg-amber-900/60 rounded-xl shadow-xl space-y-6">
        <div className="text-center">
          <Compass className="mx-auto text-amber-400" size={48} />
          <h1 className="text-amber-100 text-2xl mt-2">Verify Your Email</h1>
          <p className="text-amber-200/70 text-sm mt-2">Enter the 6-digit OTP sent to your email</p>
        </div>

        {error && <div className="p-3 bg-red-500/20 rounded text-red-200 text-sm">{error}</div>}
        {success && <div className="p-3 bg-green-500/20 rounded text-green-200 text-sm">{success}</div>}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="email"
            value={email}
            disabled={!!emailQuery}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded bg-black/40 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
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
