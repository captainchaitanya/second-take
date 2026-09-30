import { motion, useReducedMotion } from 'framer-motion'
import { springTransition } from '../motion'
import { Em } from './Press'

export function Intro() {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition(reduce)}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent xl:text-[12px]">
        Concept
      </p>
      <h1 className="mt-2 text-[1.85rem] font-semibold tracking-tight text-ink xl:mt-3 xl:text-5xl">
        Second <Em>Take</Em>
      </h1>
      <p className="mt-3 text-[14px] leading-relaxed text-muted xl:mt-4 xl:text-[16px]">
        A night-time practice room for the conversations you keep rewriting in your head.
      </p>
      <p className="mt-4 text-[12px] leading-relaxed text-soft xl:mt-6 xl:text-[13px]">
        A concept project by Chaitanya Raj. Not affiliated with any company.
      </p>
    </motion.div>
  )
}
