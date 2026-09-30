import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type { Choice } from '../types/scene'
import { springTransition } from '../motion'

export function ChoiceSheet({
  choices,
  disabled,
  onChoose,
}: {
  choices: Choice[]
  disabled: boolean
  onChoose: (choice: Choice) => void
}) {
  const reduce = useReducedMotion()
  const firstRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    firstRef.current?.focus()
  }, [choices])

  useEffect(() => {
    if (disabled) return

    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const index = Number(event.key) - 1
      if (index >= 0 && index < choices.length) {
        event.preventDefault()
        const choice = choices[index]
        if (choice) onChoose(choice)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [choices, disabled, onChoose])

  return (
    <AnimatePresence>
      {choices.length > 0 && (
        <motion.div
          initial={reduce ? false : { y: 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? undefined : { y: 20, opacity: 0 }}
          transition={springTransition(reduce)}
          className="border-t border-white/8 bg-[var(--bg-sheet)] px-3 pb-3 pt-3 shadow-[var(--shadow-sheet)]"
        >
          <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-[0.16em] text-soft">
            Your reply · 1–3
          </p>
          <div className="flex flex-col gap-2" role="listbox" aria-label="Reply options">
            {choices.map((choice, index) => (
              <button
                key={choice.id}
                ref={index === 0 ? firstRef : undefined}
                type="button"
                role="option"
                disabled={disabled}
                onClick={() => onChoose(choice)}
                className="choice-card rounded-[20px] border border-white/8 bg-[var(--bg-card)] px-3 py-3 text-left transition-colors hover:bg-[var(--bg-card-hover)] disabled:opacity-60"
              >
                <span className="mb-1 block text-[10px] font-semibold tabular-nums text-accent">
                  {index + 1}
                </span>
                <span className="text-[15px] leading-relaxed text-ink">{choice.text}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
