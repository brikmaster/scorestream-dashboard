"use client";

import { useState, useMemo } from "react";
import { Game, Team, getSettlementTier } from "@/lib/types";
import ConfidenceBar from "./ConfidenceBar";
import SettlementBadge from "./SettlementBadge";

interface Props {
  games: Game[];
  teamMap: Map<number, Team>;
  onSelectGame: (gameId: number) => void;
}

type SortKey = "date" | "home" | "away" | "score" | "margin" | "confidence" | "period";
type SortDir = "asc" | "desc";

export default function GamesTable({ games, teamMap, onSelectGame }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sorted = useMemo(() => {
    const arr = [...games];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortKey) {
        case "date": return dir * (new Date(a.startDateTime.replace(" ", "T")).getTime() - new Date(b.startDateTime.replace(" ", "T")).getTime());
        case "home": return dir * ((teamMap.get(a.homeTeamId)?.teamName || "").localeCompare(teamMap.get(b.homeTeamId)?.teamName || ""));
        case "away": return dir * ((teamMap.get(a.awayTeamId)?.teamName || "").localeCompare(teamMap.get(b.awayTeamId)?.teamName || ""));
        case "score": {
          const sa = a.lastScore ? a.lastScore.homeTeamScore + a.lastScore.awayTeamScore : -1;
          const sb = b.lastScore ? b.lastScore.homeTeamScore + b.lastScore.awayTeamScore : -1;
          return dir * (sa - sb);
        }
        case "margin": {
          const ma = a.lastScore ? Math.abs(a.lastScore.homeTeamScore - a.lastScore.awayTeamScore) : -1;
          const mb = b.lastScore ? Math.abs(b.lastScore.homeTeamScore - b.lastScore.awayTeamScore) : -1;
          return dir * (ma - mb);
        }
        case "confidence": {
          const ca = a.lastScore?.confidenceGrade ?? -1;
          const cb = b.lastScore?.confidenceGrade ?? -1;
          return dir * (ca - cb);
        }
        case "period": {
          const pa = a.lastScore?.gameSegmentId ?? 0;
          const pb = b.lastScore?.gameSegmentId ?? 0;
          return dir * (pa - pb);
        }
        default: return 0;
      }
    });
    return arr;
  }, [games, teamMap, sortKey, sortDir]);

  const SortHeader = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <th
      className="px-3 py-2 text-left text-xs uppercase tracking-wider text-zinc-500 cursor-pointer hover:text-zinc-300 select-none whitespace-nowrap"
      onClick={() => toggleSort(k)}
    >
      {children} {sortKey === k && (sortDir === "asc" ? "↑" : "↓")}
    </th>
  );

  if (games.length === 0) {
    return <div className="text-center text-zinc-600 py-12">No games found</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-900/80 border-b border-zinc-800">
          <tr>
            <SortHeader k="date">Date</SortHeader>
            <SortHeader k="home">Home</SortHeader>
            <SortHeader k="away">Away</SortHeader>
            <SortHeader k="score">Score</SortHeader>
            <SortHeader k="period">Period</SortHeader>
            <SortHeader k="margin">Margin</SortHeader>
            <SortHeader k="confidence">Confidence</SortHeader>
            <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-zinc-500">Status</th>
            <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-zinc-500">Link</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(g => {
            const home = teamMap.get(g.homeTeamId);
            const away = teamMap.get(g.awayTeamId);
            const grade = g.lastScore?.confidenceGrade ?? null;
            const tier = getSettlementTier(grade);
            const isFinal = g.lastScore?.gameSegmentId === 19999;
            const hasScore = g.lastScore && grade !== null && grade > 2;

            return (
              <tr
                key={g.gameId}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30 cursor-pointer transition"
                onClick={() => onSelectGame(g.gameId)}
              >
                <td className="px-3 py-2 text-zinc-300 font-mono text-xs whitespace-nowrap">
                  {new Date(g.startDateTime.replace(" ", "T")).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </td>
                <td className="px-3 py-2 text-zinc-200">
                  {home ? `${home.teamName}` : `#${g.homeTeamId}`}
                  {home?.mascot && <span className="text-zinc-500 text-xs ml-1">{home.mascot}</span>}
                </td>
                <td className="px-3 py-2 text-zinc-200">
                  {away ? `${away.teamName}` : `#${g.awayTeamId}`}
                  {away?.mascot && <span className="text-zinc-500 text-xs ml-1">{away.mascot}</span>}
                </td>
                <td className="px-3 py-2 font-mono text-zinc-100">
                  {hasScore
                    ? `${g.lastScore!.homeTeamScore} - ${g.lastScore!.awayTeamScore}`
                    : <span className="text-zinc-600">Upcoming</span>}
                </td>
                <td className="px-3 py-2 text-xs whitespace-nowrap">
                  {isFinal
                    ? <span className="text-emerald-400 font-semibold">Final</span>
                    : hasScore
                      ? <span className="text-amber-400">In Progress</span>
                      : <span className="text-zinc-600">Scheduled</span>}
                </td>
                <td className="px-3 py-2 font-mono text-zinc-400">
                  {hasScore ? Math.abs(g.lastScore!.homeTeamScore - g.lastScore!.awayTeamScore) : "—"}
                </td>
                <td className="px-3 py-2"><ConfidenceBar grade={grade} /></td>
                <td className="px-3 py-2"><SettlementBadge tier={tier} /></td>
                <td className="px-3 py-2">
                  {g.url && (
                    <a
                      href={g.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-500 hover:text-emerald-400 text-xs"
                      onClick={e => e.stopPropagation()}
                    >
                      View
                    </a>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
