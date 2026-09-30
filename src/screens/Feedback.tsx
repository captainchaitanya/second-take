import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { Em, PressButton } from '../components/Press'
import { Replay } from '../components/Replay'
import {
  moodBand,
  nextTimeTips,
  patternSentence,
  sceneScore,
  skillProgress,
  verdictForScore,
  weakestChoice,
  type SessionResult,
} from '../engine'
import type { Scene } from '../types/scene'

export function Feedback({
  scene,
  result,
  hardAvailable,
  onTryAgain,
  onTryHard,
  onHome,
}: {
  scene: Scene
  result: SessionResult
  hardAvailable: boolean
  onTryAgain: () => void
  onTryHard?: () => void
  onHome: () => void
}) {
  const band = moodBand(result.finalMood)
  const score = sceneScore(result.turns)
  const progress = skillProgress(scene, result.turns)
  const tips = nextTimeTips(progress)
  const rehearse = weakestChoice(result.turns)
  const pattern = patternSentence(scene, result.turns)

  return (
    <div className="flex h-full flex-col overflow-y-auto px-5 pb-6 pt-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-soft">How that landed</p>
      <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight text-ink">
        {scene.partner.name} ended <Em>{band}</Em>.
      </h1>
      <blockquote className="mt-4 rounded-[22px] bg-[var(--bg-card)] px-4 py-4 text-[15px] leading-relaxed text-ink">
        “{result.ending}”
      </blockquote>

      <div className="mt-5 rounded-[22px] bg-[var(--bg-elevated)] px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-soft">XP earned</p>
        <p className="mt-1 text-[32px] font-semibold tabular-nums text-accent">
          <CountUp value={result.xp} />
        </p>
      </div>

      <section className="mt-5 rounded-[22px] bg-[var(--bg-card)] px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-soft">Your scorecard</p>
        <p className="mt-2 text-[40px] font-semibold tabular-nums leading-none text-ink">
          {score}
          <span className="ml-1 text-[16px] font-medium text-soft">/ 100</span>
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{verdictForScore(score)}</p>
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-soft">Skill breakdown</h2>
        <ul className="flex flex-col gap-3">
          {progress.map((item) => (
            <li key={item.skill.id} className="rounded-[20px] bg-[var(--bg-card)] px-3.5 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-medium text-ink">{item.skill.name}</p>
                <span
                  className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${
                    item.label === 'Strong' ? 'text-mint' : item.label === 'Getting there' ? 'text-amber' : 'text-rose'
                  }`}
                >
                  {item.label}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(8, item.fill * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-5 rounded-[22px] bg-[var(--bg-card)] px-4 py-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-soft">What to try next time</h2>
        <ol className="mt-3 flex flex-col gap-2">
          {tips.map((tip) => (
            <li key={tip} className="text-[15px] leading-relaxed text-ink">
              {tip}
            </li>
          ))}
        </ol>
        {rehearse?.betterLine ? (
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            <span className="font-semibold text-ink">Your line to rehearse: </span>
            {rehearse.betterLine}
          </p>
        ) : null}
      </section>

      <section className="mt-5 rounded-[22px] bg-[var(--bg-elevated)] px-4 py-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-soft">Your pattern</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink">{pattern}</p>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-soft">Replay</h2>
        <Replay partnerName={scene.partner.name} turns={result.turns} ending={result.ending} />
      </section>

      <div className="mt-8 flex flex-col gap-2.5">
        <PressButton
          onClick={onTryAgain}
          className="w-full rounded-[22px] bg-accent px-4 py-3.5 text-[15px] font-semibold text-[var(--bezel)]"
        >
          Replay this scene
        </PressButton>
        <PressButton
          onClick={hardAvailable ? onTryHard : undefined}
          disabled={!hardAvailable}
          className="w-full rounded-[22px] bg-[var(--bg-card)] px-4 py-3.5 text-[15px] font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {hardAvailable ? 'Try it on hard' : 'Try it on hard · Coming soon'}
        </PressButton>
        <PressButton
          onClick={onHome}
          className="w-full rounded-[22px] bg-[var(--bg-card)] px-4 py-3.5 text-[15px] font-semibold text-ink"
        >
          Pick another scene
        </PressButton>
      </div>
    </div>
  )
}

function CountUp({ value }: { value: number }) {
  const reduce = useReducedMotion()
  const count = useMotionValue(0)
  const display = useTransform(count, (latest) => String(Math.round(latest)))

  useEffect(() => {
    if (reduce) {
      count.set(value)
      return
    }
    const controls = animate(count, value, { duration: 0.7, ease: 'easeOut' })
    return () => controls.stop()
  }, [count, reduce, value])

  return <motion.span>{display}</motion.span>
}
