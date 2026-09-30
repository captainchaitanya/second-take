import type { Transition } from 'framer-motion'

export function springTransition(reduce: boolean | null): Transition {
  if (reduce) return { duration: 0 }
  return { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }
}
