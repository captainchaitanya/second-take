import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import {
  formatMoodScore,
  moodBand,
  qualityTally,
  skillProgress,
  MOOD_MAX,
  MOOD_MIN,
  type LiveSnapshot,
  type SkillProgress,
} from '../engine'
import type { Scene } from '../types/scene'
import { MoodChart } from './MoodChart'
import { Em } from './Press'
import { springTransition } from '../motion'

function PanelCard({
  title,
  children,
}: {
  title: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-[24px] border border-white/8 bg-[var(--bg-card)] px-5 py-5 shadow-[var(--shadow-card)]">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-soft">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function MoodBar({ mood }: { mood: number }) {
  const reduce = useReducedMotion()
  const pct = ((mood - MOOD_MIN) / (MOOD_MAX - MOOD_MIN)) * 100

  return (
    <div className="relative mt-4 h-3 rounded-full bg-white/8" aria-hidden="true">
      <span className="absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-white/20" />
      <motion.span
        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_12px_var(--glow-coral)]"
        animate={{ left: `${pct}%` }}
        transition={springTransition(reduce)}
      />
    </div>
  )
}

function SkillRows({ items, showLabel = true }: { items: SkillProgress[]; showLabel?: boolean }) {
  const reduce = useReducedMotion()

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.skill.id}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-medium text-ink">{item.skill.name}</p>
            {showLabel ? (
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-soft">{item.label}</span>
            ) : null}
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/8">
            <motion.span
              className="block h-full rounded-full bg-accent"
              initial={false}
              animate={{ width: `${Math.max(6, item.fill * 100)}%` }}
              transition={springTransition(reduce)}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function LivePanel({
  scene,
  snapshot,
  mode,
}: {
  scene?: Scene
  snapshot: LiveSnapshot | null
  mode: 'idle' | 'live' | 'summary'
}) {
  const reduce = useReducedMotion()

  if (mode === 'idle' || !scene || !snapshot) {
    return (
      <div className="flex flex-col gap-4">
        <PanelCard title="Live panel">
          <p className="text-[15px] leading-relaxed text-muted">
            Pick a scene to watch the other person&apos;s inner world as you talk.
          </p>
        </PanelCard>
      </div>
    )
  }

  const band = moodBand(snapshot.mood)
  const tally = qualityTally(snapshot.transcript)
  const skills = skillProgress(scene, snapshot.transcript)
  const last = snapshot.lastTrigger
  const triggersHit = snapshot.transcript.filter((turn) => turn.trigger)

  if (mode === 'summary') {
    return (
      <div className="flex flex-col gap-4">
        <PanelCard title="Scene summary">
          <p className="text-[28px] font-semibold tracking-tight text-ink">
            {scene.partner.name} ended <Em>{band}</Em>.
            <span className="ml-2 text-[18px] font-semibold text-accent">{formatMoodScore(snapshot.mood)}</span>
          </p>
          <MoodChart turns={snapshot.transcript} className="mt-3 h-24 w-full" />
        </PanelCard>
        <PanelCard title="Skills">
          <SkillRows items={skills} />
        </PanelCard>
        <PanelCard title="Triggers hit">
          {triggersHit.length === 0 ? (
            <p className="text-[14px] leading-relaxed text-muted">You never quite caught a trigger. That&apos;s data too.</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {triggersHit.map((turn, index) => (
                <li
                  key={`${turn.choiceId}-${index}`}
                  className={`rounded-[16px] px-3 py-2 text-[13px] leading-relaxed ${
                    turn.trigger?.type === 'soften'
                      ? 'bg-[var(--mint-soft)] text-mint'
                      : 'bg-[var(--rose-soft)] text-rose'
                  }`}
                >
                  {index + 1}. {turn.trigger?.label}
                </li>
              ))}
            </ol>
          )}
        </PanelCard>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <PanelCard title="How it's going">
        <div className="flex items-end justify-between gap-3">
          <p className="text-[32px] font-semibold capitalize leading-none tracking-tight text-ink">{band}</p>
          <p className="text-[22px] font-semibold tabular-nums text-accent">{formatMoodScore(snapshot.mood)}</p>
        </div>
        <MoodBar mood={snapshot.mood} />
        <MoodChart turns={snapshot.transcript} className="mt-4 h-20 w-full" />
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Turn" value={`${Math.min(snapshot.turnIndex + 1, snapshot.totalTurns)} / ${snapshot.totalTurns}`} />
          <Stat label="XP" value={String(snapshot.xp)} />
          <Stat label="Lines" value={`${tally.strong} / ${tally.subtle} / ${tally.backfire}`} hint="strong / subtle / backfire" />
        </div>
      </PanelCard>

      <PanelCard title="Behind the scene">
        <p className="text-[12px] font-semibold tracking-[0.02em] text-soft">
          {scene.partner.name} secretly wants:
        </p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink">{scene.partner.hiddenWant}</p>

        {snapshot.transcript.length === 0 ? (
          <p className="mt-3 text-[13px] leading-relaxed text-soft">Watch which of these your replies hit.</p>
        ) : last ? (
          <motion.p
            key={`${last.type}-${last.label}-${snapshot.transcript.length}`}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition(reduce)}
            className="mt-3 text-[13px] leading-relaxed text-ink"
          >
            Your last line hit: <span className={last.type === 'soften' ? 'text-mint' : 'text-rose'}>{last.label}</span>
          </motion.p>
        ) : (
          <p className="mt-3 text-[13px] leading-relaxed text-soft">No trigger that time. Keep watching.</p>
        )}

        <TriggerList title="Softens when" items={scene.partner.softensWhen} hit={last?.type === 'soften' ? last.label : null} tone="soften" />
        <TriggerList title="Digs in when" items={scene.partner.digsInWhen} hit={last?.type === 'digIn' ? last.label : null} tone="digIn" />
      </PanelCard>

      <PanelCard title="Skills so far">
        <SkillRows items={skills} showLabel={snapshot.transcript.length > 0} />
      </PanelCard>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[16px] bg-white/5 px-2.5 py-2 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-soft">{label}</p>
      <p className="mt-1 text-[13px] font-semibold tabular-nums text-ink" title={hint}>
        {value}
      </p>
    </div>
  )
}

function TriggerList({
  title,
  items,
  hit,
  tone,
}: {
  title: string
  items: string[]
  hit: string | null
  tone: 'soften' | 'digIn'
}) {
  const reduce = useReducedMotion()
  const glow = tone === 'soften' ? '0 0 0 1px rgba(125,206,184,0.55), 0 0 18px rgba(125,206,184,0.28)' : '0 0 0 1px rgba(201,139,148,0.55), 0 0 18px rgba(201,139,148,0.28)'

  return (
    <div className="mt-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-soft">{title}</p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((item) => {
          const active = hit === item
          return (
            <motion.li
              key={item}
              animate={{
                boxShadow: active && !reduce ? glow : '0 0 0 0 transparent',
                backgroundColor: active ? (tone === 'soften' ? 'rgba(125,206,184,0.16)' : 'rgba(201,139,148,0.16)') : 'rgba(255,255,255,0.03)',
              }}
              transition={springTransition(reduce)}
              className="rounded-[14px] px-3 py-2 text-[13px] leading-relaxed text-muted"
            >
              {item}
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}

export function LiveDrawer({
  scene,
  snapshot,
}: {
  scene: Scene
  snapshot: LiveSnapshot
}) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const hit = snapshot.lastTrigger

  return (
    <div className="border-t border-white/8 bg-[var(--bg-sheet)] px-3 py-2 sm:hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-[16px] px-2 py-2 text-left"
      >
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-soft">
          Behind the scene
        </span>
        <span className="flex items-center gap-2">
          {hit ? (
            <span className={`h-2 w-2 rounded-full ${hit.type === 'soften' ? 'bg-mint' : 'bg-rose'}`} />
          ) : null}
          <span className="text-muted" aria-hidden="true">
            {open ? '–' : '+'}
          </span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={springTransition(reduce)}
            className="overflow-hidden"
          >
            <div className="max-h-[38vh] overflow-y-auto pb-2 pt-1 phone-scroll">
              <LivePanel scene={scene} snapshot={snapshot} mode="live" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
