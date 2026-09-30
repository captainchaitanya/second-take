import { motion, useReducedMotion } from 'framer-motion'

export function TypingIndicator({ name }: { name: string }) {
  const reduce = useReducedMotion()
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="flex max-w-[92%] items-end gap-2" aria-live="polite" aria-label={`${name} is typing`}>
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[12px] font-semibold text-accent"
        aria-hidden="true"
      >
        {initial}
      </div>
      <div className="flex items-center gap-1 rounded-[22px] rounded-bl-[8px] bg-[var(--bg-elevated)] px-3.5 py-3">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="h-1.5 w-1.5 rounded-full bg-muted"
            animate={reduce ? undefined : { y: [0, -3, 0], opacity: [0.45, 1, 0.45] }}
            transition={
              reduce
                ? undefined
                : { duration: 0.7, repeat: Infinity, delay: index * 0.12, ease: 'easeInOut' }
            }
          />
        ))}
      </div>
    </div>
  )
}
