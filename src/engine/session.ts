import type { ChoiceTrigger, Quality, Scene, SkillScore } from '../types/scene'

export type TranscriptTurn = {
  turnIndex: number
  partnerLine: string
  choiceId: string
  userText: string
  quality: Quality
  coachNote: string
  betterLine?: string
  reaction: string
  moodAfter: number
  skills: Record<string, SkillScore>
  trigger?: ChoiceTrigger
}

export type SessionResult = {
  sceneId: string
  turns: TranscriptTurn[]
  ending: string
  finalMood: number
  xp: number
}

export type LiveSnapshot = {
  sceneId: string
  mood: number
  turnIndex: number
  totalTurns: number
  xp: number
  transcript: TranscriptTurn[]
  lastTrigger: ChoiceTrigger | null
  status: 'idle' | 'ready' | 'playing' | 'complete'
}

export function emptyLive(scene: Scene): LiveSnapshot {
  return {
    sceneId: scene.id,
    mood: 0,
    turnIndex: 0,
    totalTurns: scene.turns.length,
    xp: 0,
    transcript: [],
    lastTrigger: null,
    status: 'ready',
  }
}
