"use client";

import { useState, useCallback } from "react";
import { Game, Team, SearchParams, ScoreStreamResponse } from "@/lib/types";
import { toApiDateTime, buildTeamMap } from "@/lib/scorestream";
import SearchForm from "@/components/SearchForm";
import GamesTable from "@/components/GamesTable";
import ConfidenceStats from "@/components/ConfidenceStats";
import GameDetailModal from "@/components/GameDetailModal";

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [teamMap, setTeamMap] = useState<Map<number, Team>>(new Map());
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);

  const handleSearch = useCallback(async (params: SearchParams) => {
    setLoading(true);
    setGames([]);
    setTotal(0);

    const allGames: Game[] = [];
    const allTeams: Team[] = [];
    let offset = 0;
    let totalCount = 0;
    const count = 30;

    try {
      do {
        setProgress(`Fetching games ${offset + 1}–${offset + count}…`);

        const searchParams = new URLSearchParams({
          state: params.state,
          afterDateTime: toApiDateTime(params.afterDateTime),
          beforeDateTime: toApiDateTime(params.beforeDateTime, true),
          sportNames: JSON.stringify([params.sportName]),
          squadIds: JSON.stringify([params.squadId]),
          count: String(count),
          offset: String(offset),
        });

        const res = await fetch(`/api/games?${searchParams}`);
        const data: ScoreStreamResponse = await res.json();

        if (!data.result) break;

        totalCount = data.result.total;
        allGames.push(...data.result.collections.gameCollection.list);
        allTeams.push(...data.result.collections.teamCollection.list);
        offset += count;
      } while (offset < totalCount);

      setGames(allGames);
      setTeamMap(buildTeamMap(allTeams));
      setTotal(totalCount);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
      setProgress("");
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-2 h-8 bg-emerald-500 rounded-sm" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">ScoreStream Settlement Layer</h1>
            <p className="text-xs text-zinc-500">Amateur Sports Score Verification Dashboard</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <SearchForm onSearch={handleSearch} loading={loading} />

        {loading && (
          <div className="text-center text-zinc-500 py-4 text-sm font-mono">{progress}</div>
        )}

        {!loading && games.length > 0 && (
          <>
            <ConfidenceStats games={games} total={total} />
            <GamesTable games={games} teamMap={teamMap} onSelectGame={setSelectedGameId} />
          </>
        )}

        {selectedGameId !== null && (
          <GameDetailModal gameId={selectedGameId} onClose={() => setSelectedGameId(null)} />
        )}
      </main>
    </div>
  );
}
