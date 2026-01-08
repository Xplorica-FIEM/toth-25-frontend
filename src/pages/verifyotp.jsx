import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Compass, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { verifyOTP, resendOTP, prefetchRiddles } from "@/utils/api";
import { saveToken, saveUser } from "@/utils/auth";
import { cacheRiddles, isIndexedDBSupported } from "@/utils/cache";

export default function VerifyOtp() {
  const router = useRouter();

  const { email: emailQuery } = router.query;

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verified, setVerified] = useState(false);
  const [prefetching, setPrefetching] = useState(false);
  const [prefetchMessage, setPrefetchMessage] = useState("");

  useEffect(() => {
    // Prefer email from query, fallback to localStorage
    if (emailQuery) {
      setEmail(emailQuery);
      localStorage.setItem("email", emailQuery);
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
      const response = await verifyOTP(email, otp);

      if (!response.ok) {
        throw new Error(response.data.error || "OTP verification failed");
      }

      setSuccess(response.data.message || "Email verified successfully!");
      setVerified(true);

      // Save token and user data for auto-login
      if (response.data.token) {
        saveToken(response.data.token);
      }
      
      if (response.data.user) {
        saveUser(response.data.user);
      }

      // Clear email from localStorage (no longer needed)
      localStorage.removeItem("email");

      // Don't auto-redirect - show "Start the Hunt" button instead
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartHunt = async () => {
    setPrefetching(true);
    setPrefetchMessage("🗺️ Preparing your adventure...");
    
    try {
      // Check if IndexedDB is supported
      if (!isIndexedDBSupported()) {
        console.warn("⚠️ IndexedDB not supported - skipping cache");
        setPrefetchMessage("🎯 Loading game...");
        setTimeout(() => router.push("/dashboard"), 1000);
        return;
      }

      // Step 1: Fetch encrypted riddles from backend
      setPrefetchMessage("📦 Downloading riddles...");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await prefetchRiddles();
      
      if (!response.ok || !response.data?.riddles) {
        console.warn("⚠️ Prefetch failed - continuing without cache");
        setPrefetchMessage("🎯 Loading game...");
        setTimeout(() => router.push("/dashboard"), 1000);
        return;
      }

      // Step 2: Cache riddles in IndexedDB
      setPrefetchMessage("💾 Caching riddles for offline use...");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const cacheResult = await cacheRiddles(response.data.riddles);
      
      if (cacheResult.success) {
        console.log(`✅ Cached ${cacheResult.count} riddles`);
      }

      // Step 3: Redirect to dashboard
      setPrefetchMessage("🎉 Ready! Let the hunt begin...");
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      router.push("/dashboard");
      
    } catch (error) {
      console.error("❌ Prefetch error:", error);
      // Continue to dashboard even if prefetch fails
      setPrefetchMessage("🎯 Loading game...");
      setTimeout(() => router.push("/dashboard"), 1000);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const response = await resendOTP(email);

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
    <div className="min-h-screen flex items-center justify-center bg-black/80 px-6">
      <div className="w-full max-w-md p-8 bg-amber-900/60 rounded-xl shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <Compass className="mx-auto text-amber-400" size={48} />
          <h1 className="text-amber-100 text-2xl mt-2">
            {verified ? "✅ Email Verified!" : "Verify Your Email"}
          </h1>
          <p className="text-amber-200/70 text-sm mt-2">
            {verified 
              ? "Your account is ready for the adventure"
              : "Enter the 4-digit OTP sent to your email"
            }
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

        {/* Prefetching Loader */}
        {prefetching && (
          <div className="p-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-400/30">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-amber-400" size={40} />
              <p className="text-amber-100 text-center font-medium">
                {prefetchMessage}
              </p>
            </div>
          </div>
        )}

        {/* Show Start Hunt Button after verification */}
        {verified && !prefetching ? (
          <div className="space-y-4">
            <button
              onClick={handleStartHunt}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg text-white font-bold text-lg hover:from-amber-500 hover:to-orange-500 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <Sparkles size={20} />
              Start the Hunt!
              <Sparkles size={20} />
            </button>
            <p className="text-amber-300/70 text-xs text-center">
              Loading riddles for offline access...
            </p>
          </div>
        ) : !verified && !prefetching ? (
          <>
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

            {/* Resend OTP */}
            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-amber-300 hover:text-amber-100 text-sm disabled:text-amber-700"
              >
                {resending ? "Sending..." : "Resend OTP"}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

