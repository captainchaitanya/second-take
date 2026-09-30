export type Category = 'Work' | 'Social' | 'Family'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type MoodBand = 'guarded' | 'neutral' | 'open'
export type Quality = 'strong' | 'subtle' | 'backfire'
export type MoodDelta = -2 | -1 | 0 | 1 | 2
export type SkillScore = -1 | 0 | 1
export type TriggerType = 'soften' | 'digIn'

export type MoodedLines = {
  guarded: string
  neutral: string
  open: string
}

export type Skill = {
  id: string
  name: string
  description: string
  tip: string
}

export type ChoiceTrigger = {
  type: TriggerType
  label: string
}

export type Partner = {
  name: string
  age: number
  role: string
  oneLine: string
  hiddenWant: string
  softensWhen: string[]
  digsInWhen: string[]
}

export type Choice = {
  id: string
  text: string
  quality: Quality
  moodDelta: MoodDelta
  reaction: string
  coachNote: string
  betterLine?: string
  skills: Record<string, SkillScore>
  trigger?: ChoiceTrigger
}

export type Turn = {
  partnerLine: MoodedLines
  choices: Choice[]
}

export type Scene = {
  id: string
  title: string
  category: Category
  situation: string
  goal: string
  durationMin: number
  partner: Partner
  difficulty: Difficulty
  rubric: Skill[]
  turns: Turn[]
  endings: MoodedLines
  _placeholder?: boolean
}

export type ComingSoonScene = {
  id: string
  title: string
  category: Category
  situation: string
  durationMin: number
  difficulty: Difficulty
  comingSoon: true
}
