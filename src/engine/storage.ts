export type Stats = {
  streak: number
  totalXp: number
  sessions: number
  lastPracticeDate: string | null
}

const STORAGE_KEY = 'second-take:stats'

const EMPTY_STATS: Stats = {
  streak: 0,
  totalXp: 0,
  sessions: 0,
  lastPracticeDate: null,
}

function todayIso(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function shiftIso(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1)
  date.setDate(date.getDate() + days)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isStats(value: unknown): value is Stats {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.streak === 'number' &&
    typeof record.totalXp === 'number' &&
    typeof record.sessions === 'number' &&
    (record.lastPracticeDate === null || typeof record.lastPracticeDate === 'string')
  )
}

export function loadStats(): Stats {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATS
    const parsed: unknown = JSON.parse(raw)
    if (!isStats(parsed)) return EMPTY_STATS
    return parsed
  } catch {
    return EMPTY_STATS
  }
}

export function recordSession(xp: number): Stats {
  const current = loadStats()
  const today = todayIso()
  const yesterday = shiftIso(today, -1)

  let streak = current.streak
  if (current.lastPracticeDate === today) {
    streak = Math.max(current.streak, 1)
  } else if (current.lastPracticeDate === yesterday) {
    streak = current.streak + 1
  } else {
    streak = 1
  }

  const next: Stats = {
    streak,
    totalXp: current.totalXp + xp,
    sessions: current.sessions + 1,
    lastPracticeDate: today,
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage can fail (private mode, quota). The session still renders.
  }

  return next
}
