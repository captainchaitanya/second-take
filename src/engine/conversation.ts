import type { Choice, Scene } from '../types/scene'
import { moodBand } from './mood'
import { xpForQuality } from './scoring'

export function partnerLineFor(scene: Scene, turnIndex: number, mood: number): string {
  const turn = scene.turns[turnIndex]
  if (!turn) return ''
  return turn.partnerLine[moodBand(mood)]
}

export function endingFor(scene: Scene, mood: number): string {
  return scene.endings[moodBand(mood)]
}

export function typingDelayMs(text: string, reduceMotion: boolean): number {
  if (reduceMotion) return 0
  const scaled = 700 + Math.round((Math.min(text.length, 160) / 160) * 500)
  return Math.min(1200, Math.max(700, scaled))
}

export function shuffledChoices(choices: Choice[]): Choice[] {
  const copy = [...choices]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const current = copy[i]
    const swap = copy[j]
    if (current === undefined || swap === undefined) continue
    copy[i] = swap
    copy[j] = current
  }
  return copy
}

export function totalXp(qualities: Choice['quality'][]): number {
  return qualities.reduce((sum, quality) => sum + xpForQuality(quality), 0)
}
