import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { Intro } from './components/Intro'
import { CreatorCard } from './components/CreatorCard'
import { LivePanel } from './components/LivePanel'
import { PhoneFrame } from './components/PhoneFrame'
import { springTransition } from './motion'
import { findVariant, getScene } from './data/scenes'
import {
  emptyLive,
  loadStats,
  recordSession,
  type LiveSnapshot,
  type SessionResult,
  type Stats,
} from './engine'
import { Conversation } from './screens/Conversation'
import { Feedback } from './screens/Feedback'
import { Home } from './screens/Home'
import { SceneBrief } from './screens/SceneBrief'

type Route =
  | { name: 'home' }
  | { name: 'brief'; sceneId: string }
  | { name: 'conversation'; sceneId: string }
  | { name: 'feedback'; sceneId: string; result: SessionResult }

function App() {
  const reduce = useReducedMotion()
  const [route, setRoute] = useState<Route>({ name: 'home' })
  const [stats, setStats] = useState<Stats>(() => loadStats())
  const [playId, setPlayId] = useState(0)
  const [live, setLive] = useState<LiveSnapshot | null>(null)

  const onLiveChange = useCallback((snapshot: LiveSnapshot) => {
    setLive(snapshot)
  }, [])

  function startConversation(sceneId: string) {
    const next = getScene(sceneId)
    setPlayId((current) => current + 1)
    setLive(next ? { ...emptyLive(next), status: 'playing' } : null)
    setRoute({ name: 'conversation', sceneId })
  }

  const scene = route.name === 'home' ? undefined : getScene(route.sceneId)
  const hardVersion = scene ? findVariant(scene, 'hard') : undefined
  const panelScene = scene ?? (live ? getScene(live.sceneId) : undefined)
  const panelMode = route.name === 'home' ? 'idle' : route.name === 'feedback' ? 'summary' : 'live'
  const panelSnapshot =
    route.name === 'feedback'
      ? {
          sceneId: route.result.sceneId,
          mood: route.result.finalMood,
          turnIndex: Math.max(route.result.turns.length - 1, 0),
          totalTurns: scene?.turns.length ?? route.result.turns.length,
          xp: route.result.xp,
          transcript: route.result.turns,
          lastTrigger: route.result.turns.at(-1)?.trigger ?? null,
          status: 'complete' as const,
        }
      : live

  function goHome() {
    setLive(null)
    setRoute({ name: 'home' })
  }

  function openBrief(sceneId: string) {
    const next = getScene(sceneId)
    setLive(next ? emptyLive(next) : null)
    setRoute({ name: 'brief', sceneId })
  }

  function completeSession(result: SessionResult) {
    setStats(recordSession(result.xp))
    setRoute({ name: 'feedback', sceneId: result.sceneId, result })
  }

  const screen = (() => {
    if (route.name === 'home') {
      return <Home stats={stats} onSelectScene={openBrief} />
    }
    if (!scene) {
      return <Home stats={stats} onSelectScene={openBrief} />
    }
    if (route.name === 'brief') {
      return <SceneBrief scene={scene} onBack={goHome} onBegin={() => startConversation(scene.id)} />
    }
    if (route.name === 'conversation') {
      return <Conversation key={playId} scene={scene} onComplete={completeSession} onLiveChange={onLiveChange} />
    }
    return (
      <Feedback
        scene={scene}
        result={route.result}
        hardAvailable={Boolean(hardVersion)}
        onTryAgain={() => startConversation(scene.id)}
        onTryHard={hardVersion ? () => startConversation(hardVersion.id) : undefined}
        onHome={goHome}
      />
    )
  })()

  return (
    <div className="page-glows min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1400px] flex-col items-center gap-8 px-0 sm:px-6 sm:py-6 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:gap-10">
        <aside className="hidden min-h-0 lg:flex lg:col-start-1 lg:row-start-1 lg:max-h-[calc(100dvh-4.5rem)] lg:justify-end lg:overflow-y-auto xl:max-h-none xl:overflow-visible soft-scroll">
          <div className="flex w-full max-w-sm flex-col justify-center gap-8 py-1">
            <Intro />
            <CreatorCard />
            <div className="xl:hidden">
              <LivePanel scene={panelScene} snapshot={panelSnapshot} mode={panelMode} />
            </div>
          </div>
        </aside>

        <div className="flex justify-center lg:col-start-2 lg:row-start-1">
          <PhoneFrame>
            <AnimatePresence mode="wait">
              <motion.div
                key={
                  route.name === 'conversation'
                    ? `talk-${playId}`
                    : route.name === 'brief'
                      ? `brief-${route.sceneId}`
                      : route.name
                }
                className="h-full min-h-0"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={springTransition(reduce)}
              >
                {screen}
              </motion.div>
            </AnimatePresence>
          </PhoneFrame>
        </div>

        <aside className="hidden w-full sm:flex sm:justify-center lg:hidden xl:flex xl:col-start-3 xl:row-start-1 xl:max-h-[calc(100dvh-4.5rem)] xl:justify-start xl:overflow-y-auto soft-scroll">
          <div className="w-full max-w-[22.5rem] pb-2 lg:pb-0">
            <LivePanel scene={panelScene} snapshot={panelSnapshot} mode={panelMode} />
          </div>
        </aside>

        <div className="hidden w-full sm:flex sm:justify-center lg:hidden">
          <div className="w-full max-w-sm px-1 pb-6">
            <CreatorCard />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
