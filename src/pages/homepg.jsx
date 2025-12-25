import { Compass, Scroll, ScanLine } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const Scan = dynamic(() => import("../components/scan"), {
  ssr: false,
});

export default function HomePage() {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="min-h-screen relative">
      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1618385418700-35dc948cdeec')",
        }}
      />

      {/* ⬇️ IMPORTANT: hide this overlay when scanner is open */}
      {!showScanner && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm" />
      )}

      <div className="relative z-10 min-h-screen px-6 py-12">
        <div className="max-w-6xl mx-auto text-center">
          <header className="mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <Compass className="size-14 text-amber-400 animate-pulse" />
              <h1 className="text-amber-100 text-4xl font-bold">
                Treasure Hunt Portal
              </h1>
            </div>
            <p className="text-amber-100/80 max-w-2xl mx-auto">
              Scan QR codes to uncover hidden truths.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Scanner */}
            <div className="bg-gradient-to-br from-amber-900/60 to-stone-900/60 rounded-2xl border border-amber-700/50 p-8 shadow-2xl">
              <ScanLine className="size-12 text-amber-100 mb-6" />
              <h2 className="text-amber-100 text-2xl mb-4">
                Open Scanner
              </h2>
              <button
                onClick={() => setShowScanner(true)}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl"
              >
                Launch Scanner
              </button>
            </div>

            {/* Riddles */}
            <div className="bg-gradient-to-br from-amber-900/60 to-stone-900/60 rounded-2xl border border-amber-700/50 p-8 shadow-2xl">
              <Scroll className="size-12 text-amber-100 mb-6" />
              <h2 className="text-amber-100 text-2xl mb-4">
                Riddles
              </h2>
              <button
                onClick={() => router.push("/admin/riddles-list")}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl"
              >
                Open Riddles
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner modal */}
      {showScanner && <Scan onClose={() => setShowScanner(false)} />}
    </div>
  );
}
