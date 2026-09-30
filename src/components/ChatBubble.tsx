import { motion, useReducedMotion } from 'framer-motion'
import { springTransition } from '../motion'

export function ChatBubble({
  role,
  name,
  text,
}: {
  role: 'partner' | 'user' | 'reaction'
  name?: string
  text: string
}) {
  const reduce = useReducedMotion()
  const isUser = role === 'user'
  const initial = name?.charAt(0).toUpperCase() ?? '?'

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition(reduce)}
      className={`flex max-w-[92%] items-end gap-2 ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
    >
      {!isUser && (
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[12px] font-semibold text-accent"
          aria-hidden="true"
        >
          {initial}
        </div>
      )}
      <div
        className={`rounded-[22px] px-3.5 py-2.5 text-[15px] leading-relaxed shadow-[var(--shadow-card)] ${
          isUser
            ? 'rounded-br-[8px] bg-accent text-[var(--bezel)]'
            : 'rounded-bl-[8px] bg-[var(--bg-elevated)] text-ink'
        }`}
      >
        {text}
      </div>
    </motion.div>
  )
}
