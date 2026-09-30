import type { Quality } from '../types/scene'
import { STARTING_MOOD } from '../engine'
import type { TranscriptTurn } from '../engine'

const QUALITY_COLOR: Record<Quality, string> = {
  strong: 'var(--mint)',
  subtle: 'var(--amber)',
  backfire: 'var(--rose)',
}

export function MoodChart({
  turns,
  className,
}: {
  turns: TranscriptTurn[]
  className?: string
}) {
  const values = [STARTING_MOOD, ...turns.map((turn) => turn.moodAfter)]
  const colors = [null, ...turns.map((turn) => turn.quality)] as Array<Quality | null>
  const width = 280
  const height = 88
  const padX = 14
  const padY = 14
  const min = -3
  const max = 3
  const innerW = width - padX * 2
  const innerH = height - padY * 2
  const step = values.length > 1 ? innerW / (values.length - 1) : 0

  const points = values.map((mood, index) => {
    const x = padX + index * step
    const y = padY + ((max - mood) / (max - min)) * innerH
    return { x, y, mood, quality: colors[index] ?? null }
  })

  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ')
  const zeroY = padY + ((max - 0) / (max - min)) * innerH

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className ?? 'h-20 w-full'}
      role="img"
      aria-label="Mood across turns"
    >
      <line x1={padX} y1={zeroY} x2={width - padX} y2={zeroY} stroke="rgba(255,247,236,0.12)" strokeDasharray="3 5" />
      {path && (
        <path d={path} fill="none" stroke="rgba(243,160,131,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {points.map((point, index) => (
        <circle
          key={`${point.x}-${index}`}
          cx={point.x}
          cy={point.y}
          r={index === 0 ? 3.2 : 4.2}
          fill={point.quality ? QUALITY_COLOR[point.quality] : 'var(--ink-soft)'}
        />
      ))}
    </svg>
  )
}
