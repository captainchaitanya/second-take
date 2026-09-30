import type { Quality, Scene, Skill } from '../types/scene'
import type { TranscriptTurn } from './session'

export const SCORE_BY_QUALITY: Record<Quality, number> = {
  strong: 100,
  subtle: 60,
  backfire: 20,
}

export type SkillLabel = 'Strong' | 'Getting there' | 'Work on this'

export type SkillProgress = {
  skill: Skill
  raw: number
  average: number
  fill: number
  label: SkillLabel
}

const PATTERN_BY_SKILL: Record<string, string> = {
  acknowledge: "You tend to skip acknowledging the other person's pressure before stating your need.",
  clarity: 'You tend to hedge the ask until they can still hear a yes.',
  options: 'You tend to absorb the cost instead of putting a real choice on the table.',
  calm: 'You tend to let the temperature rise when you feel the timeline slipping.',
}

export function sceneScore(turns: TranscriptTurn[]): number {
  if (turns.length === 0) return 0
  const total = turns.reduce((sum, turn) => sum + SCORE_BY_QUALITY[turn.quality], 0)
  return Math.round(total / turns.length)
}

export function verdictForScore(score: number): string {
  if (score >= 85) return 'That landed.'
  if (score >= 60) return 'Close. A couple of lines leaked.'
  return "Rough one. That's what practice is for."
}

export function skillProgress(scene: Scene, turns: TranscriptTurn[]): SkillProgress[] {
  const played = Math.max(turns.length, 1)

  return (scene.rubric ?? []).map((skill) => {
    const raw = turns.reduce((sum, turn) => sum + (turn.skills?.[skill.id] ?? 0), 0)
    const average = turns.length === 0 ? 0 : raw / played
    const fill = turns.length === 0 ? 0 : (average + 1) / 2
    const label: SkillLabel = average >= 0.5 ? 'Strong' : average >= 0 ? 'Getting there' : 'Work on this'
    return { skill, raw, average, fill, label }
  })
}

export function weakestSkills(progress: SkillProgress[], count: number): SkillProgress[] {
  return [...progress].sort((a, b) => a.average - b.average || a.skill.name.localeCompare(b.skill.name)).slice(0, count)
}

export function weakestChoice(turns: TranscriptTurn[]): TranscriptTurn | undefined {
  const rank: Record<Quality, number> = { backfire: 0, subtle: 1, strong: 2 }
  return [...turns].sort((a, b) => {
    const qualityGap = rank[a.quality] - rank[b.quality]
    if (qualityGap !== 0) return qualityGap
    const aSum = Object.values(a.skills ?? {}).reduce((sum: number, value) => sum + value, 0)
    const bSum = Object.values(b.skills ?? {}).reduce((sum: number, value) => sum + value, 0)
    return aSum - bSum
  })[0]
}

export function nextTimeTips(progress: SkillProgress[]): string[] {
  return weakestSkills(progress, 2).map((item) => item.skill.tip)
}

export function patternSentence(scene: Scene, turns: TranscriptTurn[]): string {
  const weak = turns.filter((turn) => turn.quality !== 'strong')

  if (weak.length === 0) {
    const best = [...skillProgress(scene, turns)].sort((a, b) => b.average - a.average)[0]
    if (best) {
      return `You stayed with ${best.skill.name.toLowerCase()} the whole way. That's the version to keep.`
    }
    return 'Clean run. Keep the lines that named the pressure and offered a trade.'
  }

  const counts = new Map<string, number>()
  for (const turn of weak) {
      for (const [skillId, score] of Object.entries(turn.skills ?? {})) {
      if (score === -1) counts.set(skillId, (counts.get(skillId) ?? 0) + 1)
    }
  }

  let topId: string | undefined
  let topCount = 0
  for (const [skillId, count] of counts) {
    if (count > topCount) {
      topId = skillId
      topCount = count
    }
  }

  if (topId && topCount > weak.length / 2) {
    return PATTERN_BY_SKILL[topId] ?? `You tend to drop ${scene.rubric.find((skill) => skill.id === topId)?.name.toLowerCase() ?? 'that skill'} when the heat comes on.`
  }

  const best = [...skillProgress(scene, turns)].sort((a, b) => b.average - a.average)[0]
  if (best && best.average > 0) {
    return `The miss was mixed, but ${best.skill.name.toLowerCase()} was your strongest muscle. Lead with that next time.`
  }

  return 'The misses did not share one habit — slow down before the next line and pick the warmer option.'
}

export function formatMoodScore(mood: number): string {
  if (mood > 0) return `+${mood}`
  return String(mood)
}

export function qualityTally(turns: TranscriptTurn[]): Record<Quality, number> {
  return turns.reduce(
    (tally, turn) => {
      tally[turn.quality] += 1
      return tally
    },
    { strong: 0, subtle: 0, backfire: 0 } as Record<Quality, number>,
  )
}
