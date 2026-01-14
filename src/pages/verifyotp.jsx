import { useEffect } from "react";
import { useRouter } from "next/router";

export default function VerifyOtp() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-stone-900 via-amber-950 to-stone-900 px-6">
      <p className="text-amber-100 text-center text-lg">
        OTP verification is no longer required. Redirecting you to the dashboard...
      </p>
    </div>
  );
}
