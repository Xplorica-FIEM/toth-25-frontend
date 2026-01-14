import { useCallback, useEffect, useMemo, useState, Fragment } from "react";
import { Award, ChevronDown, ChevronUp, Loader2, RefreshCw, Timer } from "lucide-react";
import { getUserUniqueRiddleStats } from "@/utils/api";

const ROW_LIMIT = 10;

const formatScanWindow = (firstScanAt, lastScanAt) => {
  if (!firstScanAt || !lastScanAt) {
    return "Not enough scans";
  }

  const start = new Date(firstScanAt);
  const end = new Date(lastScanAt);

  const startLabel = start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const endLabel = end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return `${startLabel} → ${endLabel}`;
};

const TopUniqueScanners = ({ className = "", refreshInterval = 120000 }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (userId) => {
    const next = new Set(expandedRows);
    if (next.has(userId)) {
      next.delete(userId);
    } else {
      next.add(userId);
    }
    setExpandedRows(next);
  };

  const fetchStats = useCallback(async () => {
    try {
      setError("");
      const response = await getUserUniqueRiddleStats(ROW_LIMIT);

      if (!response.ok) {
        throw new Error(response.data?.error || "Unable to fetch leaderboard");
      }

      const payload = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setPlayers(payload);
    } catch (err) {
      setError(err.message || "Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const intervalId = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(intervalId);
  }, [fetchStats, refreshInterval]);

  const maxUnique = useMemo(() => {
    if (!players.length) {
      return 1;
    }
    return Math.max(...players.map((player) => player.uniqueRiddles || 0));
  }, [players]);

  return (
    <section
      className={`bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col ${className}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-amber-500 font-semibold">
            Unique explorers
          </p>
          <h2 className="text-xl font-bold text-amber-50">Top Scan Marathon</h2>
          <p className="text-amber-200/70 text-sm">
            Sorted by most unique riddles, showing top 10 players
          </p>
        </div>
        <button
          type="button"
          onClick={fetchStats}
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
      ) : players.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-700 bg-stone-900/60 p-6 text-center text-amber-200/60">
          No scans tracked yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-amber-400">
                <th className="px-4 py-3 font-semibold">Rank</th>
                <th className="px-4 py-3 font-semibold">Player</th>
                <th className="px-4 py-3 font-semibold">Unique Riddles</th>
                <th className="px-4 py-3 font-semibold">Play Time</th>
                <th className="px-4 py-3 font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {players.map((player, index) => {
                const rank = player.rank || index + 1;
                const uniqueCount = player.uniqueRiddles || 0;
                const percentage = Math.max(5, Math.round((uniqueCount / maxUnique) * 100));
                const name = player.user?.fullName || "Unknown Player";
                const email = player.user?.email || "";
                const isExpanded = expandedRows.has(player.userId);
                
                return (
                  <Fragment key={`${player.userId}-${rank}`}>
                    <tr 
                      className={`cursor-pointer transition-colors ${
                        isExpanded ? "bg-stone-800/60" : "bg-stone-900/40 hover:bg-stone-800/40"
                      }`}
                      onClick={() => toggleRow(player.userId)}
                    >
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex size-10 items-center justify-center rounded-full font-bold text-sm text-stone-950 ${
                            rank === 1
                              ? "bg-yellow-400"
                              : rank === 2
                              ? "bg-gray-200"
                              : rank === 3
                              ? "bg-amber-500"
                              : "bg-stone-800 text-amber-200"
                          }`}
                        >
                          {rank}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-amber-50">{name}</p>
                        <p className="text-xs text-amber-200/70">{email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-amber-100">
                            <Award className="size-4 text-amber-400" />
                            {uniqueCount} riddles
                          </div>
                          <div className="h-2 rounded-full bg-stone-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 font-semibold text-emerald-300">
                            <Timer className="size-4" />
                            {player.durationFormatted || "—"}
                          </div>
                          <p className="text-xs text-amber-200/60">
                            {formatScanWindow(player.firstScanAt, player.lastScanAt)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-amber-400">
                        {isExpanded ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-stone-900/40">
                        <td colSpan={5} className="px-4 pb-4 pt-0">
                          <div className="ml-14 mt-2 rounded-xl border border-stone-700 bg-stone-950/50 p-4">
                            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-500">
                              Scan Sequence (In Order)
                            </h4>
                            {player.sequence && player.sequence.length > 0 ? (
                              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                                {player.sequence.map((item, idx) => (
                                  <div 
                                    key={`${item.id}-${idx}`}
                                    className="flex items-center gap-3 rounded-lg border border-stone-800 bg-stone-900 p-2 text-sm"
                                  >
                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-stone-800 text-xs font-bold text-amber-500">
                                      {idx + 1}
                                    </span>
                                    <span className="truncate font-medium text-amber-100" title={item.name}>
                                      {item.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-stone-500 italic">No sequence data available.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default TopUniqueScanners;
