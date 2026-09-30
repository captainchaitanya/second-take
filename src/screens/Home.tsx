import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Em } from '../components/Press'
import { springTransition } from '../motion'
import { SceneCard } from '../components/SceneCard'
import { StatBar } from '../components/StatBar'
import { categories, scenes } from '../data/scenes'
import type { Stats } from '../engine'

const MOMENTS = [
  'asked for a pause instead of a better argument.',
  'left the joke out of the hard sentence.',
  'named the constraint before the request.',
  'let the last word be theirs.',
]

export function Home({
  stats,
  onSelectScene,
}: {
  stats: Stats
  onSelectScene: (id: string) => void
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto px-5 pb-8 pt-5">
      <StatBar stats={stats} />

      <h1 className="mt-7 text-[28px] font-semibold leading-tight tracking-tight text-ink">
        Your next <Em>practice</Em> is ready.
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        Pick a difficult conversation. Say it out loud in your head. See how it lands.
      </p>

      <div className="mt-7 flex flex-col gap-7">
        {categories.map((category) => {
          const playable = scenes.filter((scene) => scene.category === category)
          if (playable.length === 0) return null

          return (
            <section key={category}>
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-soft">
                {category}
              </h2>
              <div className="flex flex-col gap-3">
                {playable.map((scene) => (
                  <SceneCard key={scene.id} scene={scene} onSelect={onSelectScene} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <MomentsCarousel />

      <p className="mt-auto pt-8 text-center text-[13px] leading-relaxed text-soft sm:hidden">
        <a
          href="https://chaitanya-raj.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent hover:text-[var(--accent-strong)]"
        >
          Built by Chaitanya Raj
        </a>
      </p>
    </div>
  )
}

function MomentsCarousel() {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % MOMENTS.length)
    }, 4200)
    return () => window.clearInterval(id)
  }, [reduce])

  return (
    <section className="mt-8" aria-label="Small moments">
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-soft">
        moments
      </h2>
      {reduce ? (
        <ul className="flex flex-col gap-2">
          {MOMENTS.map((moment) => (
            <li
              key={moment}
              className="rounded-[22px] bg-[var(--bg-card)] px-4 py-3 text-[15px] leading-relaxed text-muted lowercase"
            >
              {moment}
            </li>
          ))}
        </ul>
      ) : (
        <>
          <div className="relative min-h-[72px] overflow-hidden rounded-[22px] bg-[var(--bg-card)] px-4 py-4">
            <AnimatePresence mode="wait">
              <motion.p
                key={MOMENTS[index]}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={springTransition(reduce)}
                className="text-[15px] leading-relaxed text-muted lowercase"
              >
                {MOMENTS[index]}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
            {MOMENTS.map((moment, momentIndex) => (
              <span
                key={moment}
                className={`h-1.5 w-1.5 rounded-full ${momentIndex === index ? 'bg-accent' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
