import { SettlementTier, TIER_COLORS } from "@/lib/types";

export default function SettlementBadge({ tier }: { tier: SettlementTier }) {
  const color = TIER_COLORS[tier];
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
    >
      {tier}
    </span>
  );
}
