// pages/index.js - Landing page
import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Compass, LogIn, UserPlus, Sparkles } from "lucide-react";
import { isAuthenticated, isAdmin } from "@/utils/auth";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to appropriate dashboard if already authenticated
    if (isAuthenticated()) {
      if (isAdmin()) {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen relative">
      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1598177183267-28a7765536de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwdGVtcGxlJTIwcnVpbnMlMjBzdG9uZXxlbnwxfHx8fDE3NjYyNTk3MDN8MA&ixlib=rb-4.1.0&q=80&w=1080')`,
        }}
      />
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full text-center space-y-12">
          {/* Header */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-center">
              <Compass className="size-24 text-amber-400 animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-amber-100 tracking-wider font-serif">
              Treasure Hunt
            </h1>
            <p className="text-xl md:text-2xl text-amber-200/90 max-w-2xl mx-auto leading-relaxed">
              TOTH 2025
            </p>
            <p className="text-lg text-amber-200/80 max-w-2xl mx-auto">
              Embark on an epic quest across campus. Scan QR codes, solve ancient riddles,
              and claim your place among the legends.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-linear-to-br from-amber-900/60 to-stone-900/60 rounded-xl p-6 border border-amber-700/50 backdrop-blur-md">
              <Sparkles className="size-8 text-amber-400 mx-auto mb-3" />
              <h3 className="text-amber-100 font-semibold mb-2">Scan QR Codes</h3>
              <p className="text-amber-200/70 text-sm">
                Discover hidden QR codes placed around campus
              </p>
            </div>

            <div className="bg-linear-to-br from-amber-900/60 to-stone-900/60 rounded-xl p-6 border border-amber-700/50 backdrop-blur-md">
              <Compass className="size-8 text-amber-400 mx-auto mb-3" />
              <h3 className="text-amber-100 font-semibold mb-2">Solve Riddles</h3>
              <p className="text-amber-200/70 text-sm">
                Decrypt mysterious puzzles and earn points
              </p>
            </div>

            <div className="bg-linear-to-br from-amber-900/60 to-stone-900/60 rounded-xl p-6 border border-amber-700/50 backdrop-blur-md">
              <LogIn className="size-8 text-amber-400 mx-auto mb-3" />
              <h3 className="text-amber-100 font-semibold mb-2">Compete</h3>
              <p className="text-amber-200/70 text-sm">
                Race against time and climb the leaderboard
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <UserPlus className="size-5" />
              Start Your Quest
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-linear-to-r from-stone-700 to-stone-800 hover:from-stone-800 hover:to-stone-900 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <LogIn className="size-5" />
              Login
            </Link>
          </div>

          {/* Footer */}
          <div className="text-amber-200/60 text-sm">
            <p>Join the adventure and prove your worth</p>
          </div>
        </div>
      </div>
    </div>
  );
}

