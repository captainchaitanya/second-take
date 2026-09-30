import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const scenesDir = path.resolve(__dirname, '../src/data/scenes')

const CATEGORIES = new Set(['Work', 'Social', 'Family'])
const DIFFICULTIES = new Set(['easy', 'medium', 'hard'])
const QUALITIES = new Set(['strong', 'subtle', 'backfire'])
const MOODS = ['guarded', 'neutral', 'open'] as const
const DELTAS = new Set([-2, -1, 0, 1, 2])
const SKILL_SCORES = new Set([-1, 0, 1])
const TRIGGER_TYPES = new Set(['soften', 'digIn'])

type Issue = { file: string; message: string }

const issues: Issue[] = []

function fail(file: string, message: string) {
  issues.push({ file, message })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function stringList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0 || !value.every(isNonEmptyString)) return null
  return value
}

function hasMoodedLines(value: unknown, label: string, file: string) {
  if (!isRecord(value)) {
    fail(file, `${label} must be an object with guarded, neutral, and open`)
    return
  }
  for (const mood of MOODS) {
    if (!isNonEmptyString(value[mood])) {
      fail(file, `${label}.${mood} must be a non-empty string`)
    }
  }
}

function readRubric(file: string, data: Record<string, unknown>): Set<string> {
  const ids = new Set<string>()
  if (!Array.isArray(data.rubric)) {
    fail(file, 'rubric must be an array of 3–4 skills')
    return ids
  }
  if (data.rubric.length < 3 || data.rubric.length > 4) {
    fail(file, `rubric must have 3 or 4 skills (found ${data.rubric.length})`)
  }

  data.rubric.forEach((skill, index) => {
    if (!isRecord(skill)) {
      fail(file, `rubric[${index}] must be an object`)
      return
    }
    if (!isNonEmptyString(skill.id)) {
      fail(file, `rubric[${index}].id is required`)
      return
    }
    if (ids.has(skill.id)) fail(file, `Duplicate skill id "${skill.id}"`)
    ids.add(skill.id)
    if (!isNonEmptyString(skill.name)) fail(file, `Skill ${skill.id}: name is required`)
    if (!isNonEmptyString(skill.description)) fail(file, `Skill ${skill.id}: description is required`)
    if (!isNonEmptyString(skill.tip)) fail(file, `Skill ${skill.id}: tip is required`)
  })

  return ids
}

function validateChoice(
  choice: unknown,
  file: string,
  turnIndex: number,
  seenIds: Set<string>,
  skillIds: Set<string>,
  softens: Set<string>,
  digsIn: Set<string>,
): { quality: string | null; hasPlusOne: boolean } {
  if (!isRecord(choice)) {
    fail(file, `Turn ${turnIndex + 1}: choice must be an object`)
    return { quality: null, hasPlusOne: false }
  }

  if (!isNonEmptyString(choice.id)) {
    fail(file, `Turn ${turnIndex + 1}: choice is missing an id`)
    return { quality: null, hasPlusOne: false }
  }

  if (seenIds.has(choice.id)) {
    fail(file, `Duplicate choice id "${choice.id}"`)
  }
  seenIds.add(choice.id)

  if (!isNonEmptyString(choice.text)) {
    fail(file, `Choice ${choice.id}: text must be a non-empty string`)
  }

  if (typeof choice.quality !== 'string' || !QUALITIES.has(choice.quality)) {
    fail(file, `Choice ${choice.id}: quality must be strong, subtle, or backfire`)
  }

  if (typeof choice.moodDelta !== 'number' || !DELTAS.has(choice.moodDelta)) {
    fail(file, `Choice ${choice.id}: moodDelta must be -2, -1, 0, 1, or 2`)
  }

  if (!isNonEmptyString(choice.reaction)) {
    fail(file, `Choice ${choice.id}: reaction must be a non-empty string`)
  }

  if (!isNonEmptyString(choice.coachNote)) {
    fail(file, `Choice ${choice.id}: coachNote must be a non-empty string`)
  }

  if (choice.quality !== 'strong' && !isNonEmptyString(choice.betterLine)) {
    fail(file, `Choice ${choice.id}: betterLine is required unless quality is strong`)
  }

  if (!isRecord(choice.skills)) {
    fail(file, `Choice ${choice.id}: skills must be an object`)
    return {
      quality: typeof choice.quality === 'string' ? choice.quality : null,
      hasPlusOne: false,
    }
  }

  for (const key of Object.keys(choice.skills)) {
    if (!skillIds.has(key)) {
      fail(file, `Choice ${choice.id}: unknown skill "${key}"`)
    }
    const score = choice.skills[key]
    if (typeof score !== 'number' || !SKILL_SCORES.has(score)) {
      fail(file, `Choice ${choice.id}: skills.${key} must be -1, 0, or 1`)
    }
  }

  for (const skillId of skillIds) {
    if (!(skillId in choice.skills)) {
      fail(file, `Choice ${choice.id}: missing skills.${skillId}`)
    }
  }

  if (choice.trigger !== undefined) {
    if (!isRecord(choice.trigger)) {
      fail(file, `Choice ${choice.id}: trigger must be an object`)
    } else {
      if (choice.trigger.type !== 'soften' && choice.trigger.type !== 'digIn') {
        fail(file, `Choice ${choice.id}: trigger.type must be soften or digIn`)
      }
      if (!isNonEmptyString(choice.trigger.label)) {
        fail(file, `Choice ${choice.id}: trigger.label is required`)
      } else if (choice.trigger.type === 'soften' && !softens.has(choice.trigger.label)) {
        fail(file, `Choice ${choice.id}: trigger.label must match partner.softensWhen`)
      } else if (choice.trigger.type === 'digIn' && !digsIn.has(choice.trigger.label)) {
        fail(file, `Choice ${choice.id}: trigger.label must match partner.digsInWhen`)
      }
      if (typeof choice.trigger.type === 'string' && !TRIGGER_TYPES.has(choice.trigger.type)) {
        fail(file, `Choice ${choice.id}: unknown trigger type`)
      }
    }
  }

  const hasPlusOne = Object.values(choice.skills).some((score) => score === 1)

  return {
    quality: typeof choice.quality === 'string' ? choice.quality : null,
    hasPlusOne,
  }
}

function validateScene(file: string, data: unknown) {
  if (!isRecord(data)) {
    fail(file, 'Root must be an object')
    return
  }

  if (!isNonEmptyString(data.id)) fail(file, 'id is required')
  if (!isNonEmptyString(data.title)) fail(file, 'title is required')
  if (typeof data.category !== 'string' || !CATEGORIES.has(data.category)) {
    fail(file, 'category must be Work, Social, or Family')
  }
  if (!isNonEmptyString(data.situation)) fail(file, 'situation is required')
  if (!isNonEmptyString(data.goal)) fail(file, 'goal is required')
  if (typeof data.durationMin !== 'number' || data.durationMin <= 0) {
    fail(file, 'durationMin must be a positive number')
  }
  if (typeof data.difficulty !== 'string' || !DIFFICULTIES.has(data.difficulty)) {
    fail(file, 'difficulty must be easy, medium, or hard')
  }

  const skillIds = readRubric(file, data)
  let softens = new Set<string>()
  let digsIn = new Set<string>()

  if (!isRecord(data.partner)) {
    fail(file, 'partner is required')
  } else {
    if (!isNonEmptyString(data.partner.name)) fail(file, 'partner.name is required')
    if (typeof data.partner.age !== 'number') fail(file, 'partner.age must be a number')
    if (!isNonEmptyString(data.partner.role)) fail(file, 'partner.role is required')
    if (!isNonEmptyString(data.partner.oneLine)) fail(file, 'partner.oneLine is required')
    if (!isNonEmptyString(data.partner.hiddenWant)) fail(file, 'partner.hiddenWant is required')
    const softenList = stringList(data.partner.softensWhen)
    const digList = stringList(data.partner.digsInWhen)
    if (!softenList) fail(file, 'partner.softensWhen must be a non-empty string array')
    else softens = new Set(softenList)
    if (!digList) fail(file, 'partner.digsInWhen must be a non-empty string array')
    else digsIn = new Set(digList)
  }

  hasMoodedLines(data.endings, 'endings', file)

  if (!Array.isArray(data.turns)) {
    fail(file, 'turns must be an array')
    return
  }

  if (data.turns.length < 4 || data.turns.length > 5) {
    fail(file, `turns must have 4 or 5 items (found ${data.turns.length})`)
  }

  const seenIds = new Set<string>()

  data.turns.forEach((turn, turnIndex) => {
    if (!isRecord(turn)) {
      fail(file, `Turn ${turnIndex + 1} must be an object`)
      return
    }

    hasMoodedLines(turn.partnerLine, `turns[${turnIndex}].partnerLine`, file)

    if (!Array.isArray(turn.choices) || turn.choices.length !== 3) {
      fail(file, `Turn ${turnIndex + 1} must have exactly 3 choices`)
      return
    }

    const results = turn.choices.map((choice) =>
      validateChoice(choice, file, turnIndex, seenIds, skillIds, softens, digsIn),
    )
    const qualities = results.map((result) => result.quality).filter((quality): quality is string => quality !== null)

    const unique = new Set(qualities)
    if (unique.size !== 3 || [...QUALITIES].some((quality) => !unique.has(quality))) {
      fail(
        file,
        `Turn ${turnIndex + 1} must include one strong, one subtle, and one backfire choice`,
      )
    }

    const strong = results.find((result) => result.quality === 'strong')
    if (strong && !strong.hasPlusOne) {
      fail(file, `Turn ${turnIndex + 1}: the strong choice must score at least one +1`)
    }
  })
}

function main() {
  const files = readdirSync(scenesDir).filter((name) => name.endsWith('.json'))
  const sceneIds = new Set<string>()

  if (files.length === 0) {
    fail('(scenes)', 'No scene JSON files found')
  }

  for (const fileName of files) {
    const fullPath = path.join(scenesDir, fileName)
    const relative = path.relative(process.cwd(), fullPath)

    let parsed: unknown
    try {
      parsed = JSON.parse(readFileSync(fullPath, 'utf8'))
    } catch (error) {
      fail(relative, `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`)
      continue
    }

    validateScene(relative, parsed)

    if (isRecord(parsed) && isNonEmptyString(parsed.id)) {
      if (sceneIds.has(parsed.id)) {
        fail(relative, `Duplicate scene id "${parsed.id}"`)
      }
      sceneIds.add(parsed.id)
    }
  }

  if (issues.length > 0) {
    console.error(`Scene validation failed (${issues.length} issue${issues.length === 1 ? '' : 's'}):`)
    for (const issue of issues) {
      console.error(`  - ${issue.file}: ${issue.message}`)
    }
    process.exit(1)
  }

  console.log(`Validated ${files.length} scene${files.length === 1 ? '' : 's'}. All good.`)
}

main()
