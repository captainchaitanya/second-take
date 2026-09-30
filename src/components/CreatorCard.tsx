import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { springTransition } from '../motion'
import { Em } from './Press'

const TAGS = ['Conversation design', 'Scene writing', 'Product'] as const

export function CreatorCard({ delay = 0.16 }: { delay?: number }) {
  const reduce = useReducedMotion()

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springTransition(reduce), delay: reduce ? 0 : delay }}
      className="rounded-[24px] border border-white/8 bg-[var(--bg-card)] px-5 py-5 shadow-[var(--shadow-card)]"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">Built by</p>
      <h2 className="mt-2 text-[1.65rem] font-semibold tracking-tight text-ink">
        Chaitanya <Em>Raj</Em>
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">
        Writer and builder. I design conversations that feel human, and ship them.
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {TAGS.map((tag) => (
          <li
            key={tag}
            className="rounded-full bg-white/6 px-2.5 py-1 text-[11px] font-medium text-muted"
          >
            {tag}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <PressLink
          href="https://chaitanya-raj.vercel.app"
          external
          className="rounded-[16px] bg-accent px-3.5 py-2.5 text-[13px] font-semibold text-[var(--bezel)]"
        >
          See my portfolio →
        </PressLink>
        <PressLink
          href="https://linkedin.com/in/chaitanya-raj-5c51"
          external
          className="rounded-[16px] border border-white/18 px-3.5 py-2.5 text-[13px] font-semibold text-ink hover:bg-white/5"
        >
          LinkedIn
        </PressLink>
        <PressLink
          href="#"
          className="rounded-[16px] border border-white/18 px-3.5 py-2.5 text-[13px] font-semibold text-ink hover:bg-white/5"
        >
          Scene notes
        </PressLink>
      </div>
    </motion.article>
  )
}

function PressLink({
  href,
  children,
  className,
  external,
}: {
  href: string
  children: ReactNode
  className?: string
  external?: boolean
}) {
  const reduce = useReducedMotion()

  return (
    <motion.a
      href={href}
      className={className}
      whileTap={reduce ? undefined : { scale: 0.97, y: 1 }}
      transition={springTransition(reduce)}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </motion.a>
  )
}
