"use client";

import { SearchParams } from "@/lib/types";
import { US_STATES, SPORTS, SQUADS, getCurrentWeekRange } from "@/lib/scorestream";
import { useState, useEffect } from "react";

interface Props {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
}

export default function SearchForm({ onSearch, loading }: Props) {
  const week = getCurrentWeekRange();
  const [state, setState] = useState("OH");
  const [startDate, setStartDate] = useState(week.start);
  const [endDate, setEndDate] = useState(week.end);
  const [sport, setSport] = useState("basketball");
  const [squadId, setSquadId] = useState(1010);

  useEffect(() => {
    onSearch({ state, afterDateTime: startDate, beforeDateTime: endDate, sportName: sport, squadId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ state, afterDateTime: startDate, beforeDateTime: endDate, sportName: sport, squadId });
  };

  const inputClass = "bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition";

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-zinc-400 uppercase tracking-wider">
        State
        <select value={state} onChange={e => setState(e.target.value)} className={inputClass}>
          {US_STATES.map(s => <option key={s.code} value={s.code}>{s.code} — {s.name}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-400 uppercase tracking-wider">
        From
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-400 uppercase tracking-wider">
        To
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-400 uppercase tracking-wider">
        Sport
        <select value={sport} onChange={e => setSport(e.target.value)} className={inputClass}>
          {SPORTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-400 uppercase tracking-wider">
        Squad
        <select value={squadId} onChange={e => setSquadId(Number(e.target.value))} className={inputClass}>
          {SQUADS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white text-sm font-semibold rounded transition"
      >
        {loading ? "Loading…" : "Search"}
      </button>
    </form>
  );
}
