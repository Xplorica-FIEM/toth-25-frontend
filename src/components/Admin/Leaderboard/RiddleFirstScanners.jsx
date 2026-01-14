import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, QrCode, RefreshCw } from "lucide-react";
import { getRiddleFirstScans } from "@/utils/api";

const formatTimestamp = (dateValue) => {
  if (!dateValue) {
    return "Awaiting first scan";
  }

  const date = new Date(dateValue);
  return date.toLocaleString();
};

const RiddleFirstScanners = ({ className = "", refreshInterval = 120000 }) => {
  const [riddles, setRiddles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFirstScanners = useCallback(async () => {
    try {
      setError("");
      const response = await getRiddleFirstScans();

      if (!response.ok) {
        throw new Error(response.data?.error || "Unable to fetch riddle scans");
      }

      const payload = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setRiddles(payload);
    } catch (err) {
      setError(err.message || "Failed to fetch first scanners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFirstScanners();
    const intervalId = setInterval(fetchFirstScanners, refreshInterval);
    return () => clearInterval(intervalId);
  }, [fetchFirstScanners, refreshInterval]);

  const claimedCount = useMemo(
    () => riddles.filter((riddle) => Boolean(riddle.firstScanner)).length,
    [riddles]
  );

  return (
    <section
      className={`bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col ${className}`}
    >
      <header className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-amber-500 font-semibold">
            Riddle wise
          </p>
          <h2 className="text-xl font-bold text-amber-50">First QR Scanners</h2>
          <p className="text-amber-200/70 text-sm">
            {claimedCount}/{riddles.length || "–"} riddles already claimed
          </p>
        </div>
        <button
          type="button"
          onClick={fetchFirstScanners}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-stone-700 px-3 py-1 text-xs font-semibold text-amber-200 hover:border-amber-500 disabled:opacity-60"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-amber-400" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-red-200">
          {error}
        </div>
      ) : riddles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-700 bg-stone-900/60 p-6 text-center text-amber-200/60">
          No riddles found yet.
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: "32rem" }}>
          {riddles.map((riddle) => {
            const hasScanner = Boolean(riddle.firstScanner);
            return (
              <article
                key={riddle.riddleId}
                className="rounded-2xl border border-stone-800 bg-stone-900/60 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                    <QrCode className="size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-amber-100">
                        {riddle.riddleName || "Untitled Riddle"}
                      </h3>
                      {hasScanner && (
                        <span className="text-xs font-semibold text-emerald-300">
                          Claimed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-200/60">
                      {formatTimestamp(riddle.firstScannedAt)}
                    </p>
                    <div className="mt-3 rounded-xl border border-stone-800 bg-stone-950/60 p-3">
                      {hasScanner ? (
                        <div>
                          <p className="text-sm font-semibold text-amber-50">
                            {riddle.firstScanner.fullName}
                          </p>
                          <p className="text-xs text-amber-200/70">
                            {riddle.firstScanner.email}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-amber-200/60">
                          Waiting for the first explorer...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default RiddleFirstScanners;
