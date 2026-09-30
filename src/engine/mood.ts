import type { MoodBand, MoodDelta } from '../types/scene'

export const MOOD_MIN = -3
export const MOOD_MAX = 3
export const STARTING_MOOD = 0

export function clampMood(mood: number): number {
  return Math.max(MOOD_MIN, Math.min(MOOD_MAX, mood))
}

export function applyMoodDelta(mood: number, delta: MoodDelta): number {
  return clampMood(mood + delta)
}

export function moodBand(mood: number): MoodBand {
  if (mood <= -1) return 'guarded'
  if (mood >= 1) return 'open'
  return 'neutral'
}

export function moodLabel(band: MoodBand): string {
  return band
}
