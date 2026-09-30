import type { Stats } from '../engine'

export function StatBar({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-3 gap-2" aria-label="Practice stats">
      <StatChip label="streak" value={`${stats.streak}d`} />
      <StatChip label="xp" value={String(stats.totalXp)} />
      <StatChip label="sessions" value={String(stats.sessions)} />
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-[var(--bg-card)] px-3 py-2.5 text-center shadow-[var(--shadow-card)]">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-soft">{label}</p>
      <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-ink">{value}</p>
    </div>
  )
}
