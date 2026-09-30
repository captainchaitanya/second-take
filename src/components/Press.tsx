import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { springTransition } from '../motion'

export function Em({ children }: { children: ReactNode }) {
  return <em className="font-serif italic font-normal tracking-tight">{children}</em>
}

export function PressButton({
  children,
  className,
  onClick,
  type = 'button',
  disabled,
  ariaLabel,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  ariaLabel?: string
}) {
  const reduce = useReducedMotion()

  return (
    <motion.button
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      whileTap={reduce || disabled ? undefined : { scale: 0.97, y: 1 }}
      transition={springTransition(reduce)}
      className={className}
    >
      {children}
    </motion.button>
  )
}
