import type { ComingSoonScene, Difficulty, Scene } from '../types/scene'
import { PressButton } from './Press'

type CardScene = Pick<Scene, 'id' | 'title' | 'situation' | 'durationMin' | 'difficulty'> | ComingSoonScene

export function SceneCard({
  scene,
  comingSoon = false,
  onSelect,
}: {
  scene: CardScene
  comingSoon?: boolean
  onSelect?: (id: string) => void
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[16px] font-semibold leading-snug text-ink">{scene.title}</h3>
        <DifficultyChip difficulty={scene.difficulty} comingSoon={comingSoon} />
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{oneLine(scene.situation)}</p>
      <p className="mt-3 text-[12px] font-medium text-soft">{scene.durationMin} min</p>
    </>
  )

  if (comingSoon) {
    return (
      <div
        className="rounded-[24px] border border-white/5 bg-[var(--bg-card)] px-4 py-4 opacity-70"
        aria-disabled="true"
        aria-label={`${scene.title}, coming soon`}
      >
        {body}
      </div>
    )
  }

  return (
    <PressButton
      onClick={() => onSelect?.(scene.id)}
      className="w-full rounded-[24px] border border-white/8 bg-[var(--bg-card)] px-4 py-4 text-left shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--bg-card-hover)]"
    >
      {body}
    </PressButton>
  )
}

function oneLine(situation: string) {
  const first = situation.split(/[.!?]/)[0]?.trim()
  return first ? `${first}.` : situation
}

function DifficultyChip({
  difficulty,
  comingSoon,
}: {
  difficulty: Difficulty
  comingSoon: boolean
}) {
  if (comingSoon) {
    return (
      <span className="shrink-0 rounded-full bg-white/6 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
        Coming soon
      </span>
    )
  }

  return (
    <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
      {difficulty}
    </span>
  )
}
