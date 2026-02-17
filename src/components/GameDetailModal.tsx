"use client";

import { useEffect, useState } from "react";
import { GameScore } from "@/lib/types";

interface Props {
  gameId: number;
  onClose: () => void;
}

interface ScoreUser {
  userId: number;
  firstName: string;
  lastName: string;
  gameScoreTrustLevelId: number;
  userRankId: number;
}

export default function GameDetailModal({ gameId, onClose }: Props) {
  const [scores, setScores] = useState<GameScore[]>([]);
  const [users, setUsers] = useState<Map<number, ScoreUser>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScores() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          gameIds: JSON.stringify([gameId]),
          count: "50",
          offset: "0",
        });
        const res = await fetch(`/api/games?${params}`);
        const data = await res.json();
        const result = data.result;
        if (result?.collections?.gameScoreCollection?.list) {
          setScores(result.collections.gameScoreCollection.list);
        }
        if (result?.collections?.userCollection?.list) {
          const map = new Map<number, ScoreUser>();
          for (const u of result.collections.userCollection.list) {
            map.set(u.userId, u);
          }
          setUsers(map);
        }
      } catch (err) {
        console.error("Failed to fetch score details", err);
      } finally {
        setLoading(false);
      }
    }
    fetchScores();
  }, [gameId]);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-zinc-100">
            Score Submissions — Game #{gameId}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xl">&times;</button>
        </div>

        {loading ? (
          <div className="text-center text-zinc-500 py-8">Loading score details…</div>
        ) : scores.length === 0 ? (
          <div className="text-center text-zinc-600 py-8">No score submissions found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-700">
              <tr>
                <th className="px-3 py-2 text-left text-xs text-zinc-500 uppercase">Score</th>
                <th className="px-3 py-2 text-left text-xs text-zinc-500 uppercase">Confidence</th>
                <th className="px-3 py-2 text-left text-xs text-zinc-500 uppercase">Influence</th>
                <th className="px-3 py-2 text-left text-xs text-zinc-500 uppercase">Branch</th>
                <th className="px-3 py-2 text-left text-xs text-zinc-500 uppercase">Submitter</th>
              </tr>
            </thead>
            <tbody>
              {scores.map(s => {
                const user = users.get(s.creatorUserId);
                return (
                  <tr key={s.gameScoreId} className="border-b border-zinc-800/50">
                    <td className="px-3 py-2 font-mono text-zinc-100">
                      {s.homeTeamScore} - {s.awayTeamScore}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="font-mono font-bold"
                        style={{ color: s.confidenceGrade >= 80 ? "#10B981" : s.confidenceGrade >= 50 ? "#F59E0B" : "#EF4444" }}
                      >
                        {s.confidenceGrade}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-zinc-400 font-mono">{s.influencerScore}</td>
                    <td className="px-3 py-2">
                      <span className={s.branchName === "master" ? "text-emerald-400" : "text-zinc-500"}>
                        {s.branchName}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-zinc-400 text-xs">
                      {user ? `${user.firstName} ${user.lastName}` : `User #${s.creatorUserId}`}
                      {user && (
                        <span className="ml-1 text-zinc-600">
                          (Trust: {user.gameScoreTrustLevelId}, Rank: {user.userRankId})
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
