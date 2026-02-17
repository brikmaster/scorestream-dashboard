import { TIER_COLORS, getSettlementTier, SettlementTier } from "@/lib/types";

export default function ConfidenceBar({ grade }: { grade: number | null }) {
  const tier = getSettlementTier(grade);
  const color = TIER_COLORS[tier];
  const width = grade === null || grade === 2 ? 0 : grade;

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="relative flex-1 h-5 bg-zinc-800 rounded overflow-hidden">
        <div
          className="h-full rounded transition-all"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-white mix-blend-difference">
          {grade === null || grade === 2 ? "—" : grade}
        </span>
      </div>
    </div>
  );
}
