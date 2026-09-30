import type { Scene } from '../types/scene'
import { Em, PressButton } from '../components/Press'

export function SceneBrief({
  scene,
  onBack,
  onBegin,
}: {
  scene: Scene
  onBack: () => void
  onBegin: () => void
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto px-5 pb-6 pt-4">
      <PressButton
        onClick={onBack}
        className="self-start text-[13px] font-medium text-muted hover:text-ink"
      >
        Back
      </PressButton>

      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-soft">
        {scene.category} · {scene.difficulty} · {scene.durationMin} min
      </p>
      <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-tight text-ink">
        {titleWithEmphasis(scene.title)}
      </h1>

      <section className="mt-6 rounded-[24px] bg-[var(--bg-card)] px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-soft">
          You&apos;re talking to
        </p>
        <p className="mt-2 text-[18px] font-semibold text-ink">
          {scene.partner.name}, {scene.partner.age}
        </p>
        <p className="text-[15px] text-muted">{scene.partner.role}</p>
        <p className="mt-2 text-[16px] leading-relaxed text-ink">{scene.partner.oneLine}</p>
      </section>

      <section className="mt-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-soft">
          What&apos;s at <Em>stake</Em>
        </h2>
        <p className="mt-2 text-[16px] leading-relaxed text-muted">{scene.situation}</p>
      </section>

      <section className="mt-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-soft">Your goal</h2>
        <p className="mt-2 text-[16px] leading-relaxed text-ink">{scene.goal}</p>
      </section>

      <div className="mt-auto pt-8">
        <PressButton
          onClick={onBegin}
          className="w-full rounded-[22px] bg-accent px-4 py-3.5 text-[15px] font-semibold text-[var(--bezel)] shadow-[var(--shadow-card)]"
        >
          Begin conversation
        </PressButton>
      </div>
    </div>
  )
}

function titleWithEmphasis(title: string) {
  const parts = title.split(' ')
  const pivot = parts.length > 1 ? Math.max(1, parts.length - 1) : 0
  return (
    <>
      {parts.map((word, index) => (
        <span key={`${word}-${index}`}>
          {index === pivot ? <Em>{word}</Em> : word}
          {index < parts.length - 1 ? ' ' : null}
        </span>
      ))}
    </>
  )
}
