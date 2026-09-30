import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import type { Quality } from '../types/scene'
import { springTransition } from '../motion'

export function CoachCard({
  note,
  betterLine,
  quality,
}: {
  note: string
  betterLine?: string
  quality: Quality
}) {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(true)
  const tone =
    quality === 'strong' ? 'text-mint bg-[var(--mint-soft)]' : quality === 'subtle' ? 'text-amber bg-[var(--amber-soft)]' : 'text-rose bg-[var(--rose-soft)]'

  return (
    <div className="ml-auto w-[min(100%,20rem)]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full items-center justify-between rounded-[16px] px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.12em] ${tone}`}
      >
        <span>Coach note · {quality}</span>
        <span aria-hidden="true">{open ? '–' : '+'}</span>
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
            <div className="mt-1 rounded-[16px] bg-[var(--bg-card)] px-3 py-2.5 text-[14px] leading-relaxed text-muted">
              <p>{note}</p>
              {betterLine ? (
                <p className="mt-2 text-ink">
                  <span className="text-soft">Try instead: </span>
                  {betterLine}
                </p>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
