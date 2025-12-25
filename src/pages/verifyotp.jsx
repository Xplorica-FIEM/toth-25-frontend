// pages/verifyotp.jsx
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Compass, AlertCircle, CheckCircle } from "lucide-react";

export default function VerifyOtp() {
  const router = useRouter();
  const { email: emailQuery } = router.query;

  const [email, setEmail] = useState(emailQuery || "");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputsRef = useRef([]);

  useEffect(() => {
    if (emailQuery) setEmail(emailQuery);
  }, [emailQuery]);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, ""); // only digits
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value[0]; // only first digit
    setOtp(newOtp);

    // Focus next input
    if (index < 3 && value) inputsRef.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      setError("Please enter the 4-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "OTP verification failed");

      setSuccess("✅ OTP verified successfully!");
      setTimeout(() => router.push("/complete-profile"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    try {
      setLoading(true);
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
      setSuccess("✅ OTP resent! Check your email.");
      setOtp(["", "", "", ""]);
      inputsRef.current[0].focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black/80 px-6">
      <div className="w-full max-w-md p-8 bg-amber-900/60 rounded-xl shadow-xl space-y-6">
        <div className="text-center">
          <Compass className="mx-auto text-amber-400" size={48} />
          <h1 className="text-amber-100 text-2xl mt-2">Verify Your Email</h1>
          <p className="text-amber-200/70 text-sm mt-2">
            Enter the 4-digit OTP sent to {email}
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-3 bg-red-500/20 rounded text-red-200 text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-500/20 rounded text-green-200 text-sm flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* OTP Inputs */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="flex justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                ref={(el) => (inputsRef.current[idx] = el)}
                className="w-16 h-16 text-center text-2xl bg-black/40 text-white rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 rounded text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="text-center mt-2">
          <button
            onClick={handleResend}
            disabled={loading}
            className="text-amber-400 hover:text-amber-300 underline text-sm"
          >
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
}
