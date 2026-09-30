import { motion, useReducedMotion } from 'framer-motion'
import { moodBand } from '../engine'
import { springTransition } from '../motion'

const BANDS = ['guarded', 'neutral', 'open'] as const

export function MoodMeter({ mood }: { mood: number }) {
  const reduce = useReducedMotion()
  const band = moodBand(mood)
  const index = BANDS.indexOf(band)

  return (
    <div className="flex items-center gap-3" aria-live="polite" aria-label={`Mood: ${band}`}>
      <div className="relative flex h-7 w-[92px] items-center rounded-full bg-[var(--bg-card)] px-1">
        <motion.span
          className="absolute h-5 w-7 rounded-full bg-accent/90"
          animate={{ x: index * 28 }}
          transition={springTransition(reduce)}
        />
        {BANDS.map((item) => (
          <span
            key={item}
            className={`relative z-10 flex h-5 w-7 items-center justify-center text-[9px] font-bold uppercase ${
              item === band ? 'text-[var(--bezel)]' : 'text-soft'
            }`}
            aria-hidden="true"
          >
            {item === 'guarded' ? 'G' : item === 'neutral' ? 'N' : 'O'}
          </span>
        ))}
      </div>
      <p className="text-[12px] font-semibold capitalize text-ink">{band}</p>
    </div>
  )
}
