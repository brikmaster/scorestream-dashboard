import { Game, SettlementTier, getSettlementTier } from "@/lib/types";

interface Props {
  games: Game[];
  total: number;
}

export default function ConfidenceStats({ games, total }: Props) {
  const scored = games.filter(g => g.lastScore && g.lastScore.confidenceGrade > 2);
  const upcoming = games.filter(g => !g.lastScore || g.lastScore.confidenceGrade === 2);
  const verified = scored.filter(g => g.lastScore && g.lastScore.confidenceGrade >= 80);
  const readiness = scored.length > 0 ? Math.round((verified.length / scored.length) * 100) : 0;

  const tiers: { tier: SettlementTier; count: number; color: string }[] = [
    { tier: SettlementTier.Verified, count: games.filter(g => getSettlementTier(g.lastScore?.confidenceGrade ?? null) === SettlementTier.Verified).length, color: "#10B981" },
    { tier: SettlementTier.Provisional, count: games.filter(g => getSettlementTier(g.lastScore?.confidenceGrade ?? null) === SettlementTier.Provisional).length, color: "#F59E0B" },
    { tier: SettlementTier.Unverified, count: games.filter(g => getSettlementTier(g.lastScore?.confidenceGrade ?? null) === SettlementTier.Unverified).length, color: "#EF4444" },
    { tier: SettlementTier.NoData, count: games.filter(g => getSettlementTier(g.lastScore?.confidenceGrade ?? null) === SettlementTier.NoData).length, color: "#6B7280" },
  ];
  const maxCount = Math.max(...tiers.map(t => t.count), 1);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Stat label="Total Games" value={total} />
      <Stat label="Scored" value={scored.length} sub={`${upcoming.length} upcoming`} />
      <Stat label="Settlement Ready" value={`${readiness}%`} sub={`${verified.length} of ${scored.length} scored`} />

      <div className="col-span-2 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Confidence Distribution</div>
        <div className="flex items-end gap-1 h-12">
          {tiers.map(t => (
            <div key={t.tier} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-sm transition-all"
                style={{ height: `${(t.count / maxCount) * 48}px`, backgroundColor: t.color, minHeight: t.count > 0 ? 4 : 0 }}
              />
              <span className="text-[10px] text-zinc-500">{t.count}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-1 mt-1">
          {tiers.map(t => (
            <span key={t.tier} className="flex-1 text-center text-[9px] text-zinc-600">{t.tier}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
      <div className="text-xs text-zinc-500 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-mono font-bold text-zinc-100 mt-1">{value}</div>
      {sub && <div className="text-xs text-zinc-500 mt-0.5">{sub}</div>}
    </div>
  );
}
