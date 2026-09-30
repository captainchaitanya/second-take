import type { Scene } from '../../types/scene'
import raiseConversation from './raise-conversation.json' with { type: 'json' }
import smallTalkDies from './small-talk-dies.json' with { type: 'json' }
import safeJob from './safe-job.json' with { type: 'json' }

export const scenes: Scene[] = [
  raiseConversation as Scene,
  smallTalkDies as Scene,
  safeJob as Scene,
]

export const categories = ['Work', 'Social', 'Family'] as const

export function getScene(id: string): Scene | undefined {
  return scenes.find((scene) => scene.id === id)
}

export function findVariant(scene: Scene, difficulty: Scene['difficulty']): Scene | undefined {
  return scenes.find((item) => item.title === scene.title && item.difficulty === difficulty)
}
