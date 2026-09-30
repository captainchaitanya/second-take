import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ChatBubble } from '../components/ChatBubble'
import { ChoiceSheet } from '../components/ChoiceSheet'
import { CoachCard } from '../components/CoachCard'
import { LiveDrawer } from '../components/LivePanel'
import { MoodMeter } from '../components/MoodMeter'
import { TypingIndicator } from '../components/TypingIndicator'
import {
  applyMoodDelta,
  endingFor,
  partnerLineFor,
  shuffledChoices,
  STARTING_MOOD,
  typingDelayMs,
  xpForQuality,
  type LiveSnapshot,
  type SessionResult,
  type TranscriptTurn,
} from '../engine'
import type { Choice, Quality, Scene } from '../types/scene'

type ChatItem =
  | { id: string; kind: 'partner' | 'reaction'; text: string }
  | {
      id: string
      kind: 'user'
      text: string
      quality: Quality
      coachNote: string
      betterLine?: string
      showCoach: boolean
    }

type Phase = 'typing-partner' | 'choosing' | 'typing-reaction' | 'post-reaction' | 'typing-ending' | 'complete'

export function Conversation({
  scene,
  onComplete,
  onLiveChange,
}: {
  scene: Scene
  onComplete: (result: SessionResult) => void
  onLiveChange: (snapshot: LiveSnapshot) => void
}) {
  const reduce = useReducedMotion()
  const [mood, setMood] = useState(STARTING_MOOD)
  const [turnIndex, setTurnIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('typing-partner')
  const [items, setItems] = useState<ChatItem[]>([])
  const [visibleChoices, setVisibleChoices] = useState<Choice[]>([])
  const [pending, setPending] = useState<Choice | null>(null)
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([])
  const [ending, setEnding] = useState('')
  const [xp, setXp] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const moodRef = useRef(mood)
  const turnRef = useRef(turnIndex)
  const partnerLineRef = useRef('')

  useEffect(() => {
    moodRef.current = mood
  }, [mood])

  useEffect(() => {
    turnRef.current = turnIndex
  }, [turnIndex])

  const snapshot: LiveSnapshot = {
    sceneId: scene.id,
    mood,
    turnIndex,
    totalTurns: scene.turns.length,
    xp,
    transcript,
    lastTrigger: transcript.at(-1)?.trigger ?? null,
    status: phase === 'complete' ? 'complete' : 'playing',
  }

  useEffect(() => {
    onLiveChange({
      sceneId: scene.id,
      mood,
      turnIndex,
      totalTurns: scene.turns.length,
      xp,
      transcript,
      lastTrigger: transcript.at(-1)?.trigger ?? null,
      status: phase === 'complete' ? 'complete' : 'playing',
    })
  }, [mood, onLiveChange, phase, scene.id, scene.turns.length, transcript, turnIndex, xp])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
  }, [items, phase, reduce])

  useEffect(() => {
    if (phase !== 'typing-partner') return
    const line = partnerLineFor(scene, turnRef.current, moodRef.current)
    const delay = typingDelayMs(line, Boolean(reduce))
    const id = window.setTimeout(() => {
      partnerLineRef.current = line
      setItems((current) => [
        ...current,
        { id: `p-${turnRef.current}`, kind: 'partner', text: line },
      ])
      setVisibleChoices(shuffledChoices(scene.turns[turnRef.current]?.choices ?? []))
      setPhase('choosing')
    }, delay)
    return () => window.clearTimeout(id)
  }, [phase, reduce, scene])

  useEffect(() => {
    if (phase !== 'typing-reaction' || !pending) return
    const delay = typingDelayMs(pending.reaction, Boolean(reduce))
    const choice = pending
    const id = window.setTimeout(() => {
      setItems((current) => [
        ...current.map((item) =>
          item.kind === 'user' && item.id === `u-${turnRef.current}` ? { ...item, showCoach: true } : item,
        ),
        { id: `r-${turnRef.current}`, kind: 'reaction', text: choice.reaction },
      ])
      setPhase('post-reaction')
    }, delay)
    return () => window.clearTimeout(id)
  }, [phase, pending, reduce])

  useEffect(() => {
    if (phase !== 'post-reaction') return
    const id = window.setTimeout(() => {
      const nextTurn = turnRef.current + 1
      if (nextTurn < scene.turns.length) {
        setTurnIndex(nextTurn)
        setPending(null)
        setVisibleChoices([])
        setPhase('typing-partner')
        return
      }
      setPhase('typing-ending')
    }, reduce ? 200 : 900)
    return () => window.clearTimeout(id)
  }, [phase, reduce, scene.turns.length])

  useEffect(() => {
    if (phase !== 'typing-ending') return
    const line = endingFor(scene, moodRef.current)
    const delay = typingDelayMs(line, Boolean(reduce))
    const id = window.setTimeout(() => {
      setEnding(line)
      setItems((current) => [...current, { id: 'ending', kind: 'partner', text: line }])
      setPhase('complete')
    }, delay)
    return () => window.clearTimeout(id)
  }, [phase, reduce, scene])

  const onChoose = useCallback(
    (choice: Choice) => {
      if (phase !== 'choosing') return
      const nextMood = applyMoodDelta(moodRef.current, choice.moodDelta)
      const partnerLine = partnerLineRef.current || partnerLineFor(scene, turnRef.current, moodRef.current)
      const entry: TranscriptTurn = {
        turnIndex: turnRef.current,
        partnerLine,
        choiceId: choice.id,
        userText: choice.text,
        quality: choice.quality,
        coachNote: choice.coachNote,
        betterLine: choice.betterLine,
        reaction: choice.reaction,
        moodAfter: nextMood,
        skills: choice.skills,
        trigger: choice.trigger,
      }

      setMood(nextMood)
      setTranscript((current) => [...current, entry])
      setXp((current) => current + xpForQuality(choice.quality))
      setVisibleChoices([])
      setPending(choice)
      setItems((current) => [
        ...current,
        {
          id: `u-${turnRef.current}`,
          kind: 'user',
          text: choice.text,
          quality: choice.quality,
          coachNote: choice.coachNote,
          betterLine: choice.betterLine,
          showCoach: false,
        },
      ])
      setPhase('typing-reaction')
    },
    [phase, scene],
  )

  function finish() {
    onComplete({
      sceneId: scene.id,
      turns: transcript,
      ending,
      finalMood: mood,
      xp,
    })
  }

  const showTyping = phase === 'typing-partner' || phase === 'typing-reaction' || phase === 'typing-ending'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center justify-between gap-3 px-4 pb-3 pt-3">
        <MoodMeter mood={mood} />
        <ol className="flex gap-1.5" aria-label={`Turn ${turnIndex + 1} of ${scene.turns.length}`}>
          {scene.turns.map((_, index) => (
            <li
              key={index}
              className={`h-1.5 w-1.5 rounded-full ${index <= turnIndex ? 'bg-accent' : 'bg-white/20'}`}
            />
          ))}
        </ol>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3">
          {items.map((item) =>
            item.kind === 'user' ? (
              <div key={item.id} className="flex flex-col items-end gap-2">
                <ChatBubble role="user" text={item.text} />
                {item.showCoach ? (
                  <CoachCard note={item.coachNote} betterLine={item.betterLine} quality={item.quality} />
                ) : null}
              </div>
            ) : (
              <ChatBubble key={item.id} role={item.kind} name={scene.partner.name} text={item.text} />
            ),
          )}
          {showTyping ? <TypingIndicator name={scene.partner.name} /> : null}
          <div ref={bottomRef} />
        </div>
      </div>

      <LiveDrawer scene={scene} snapshot={snapshot} />

      {phase === 'complete' ? (
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={finish}
            className="choice-card w-full rounded-[22px] bg-accent px-4 py-3.5 text-[15px] font-semibold text-[var(--bezel)]"
          >
            See how it went
          </button>
        </div>
      ) : (
        <ChoiceSheet choices={phase === 'choosing' ? visibleChoices : []} disabled={phase !== 'choosing'} onChoose={onChoose} />
      )}
    </div>
  )
}
