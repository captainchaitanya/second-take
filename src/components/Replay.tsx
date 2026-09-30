import type { Quality } from '../types/scene'
import type { TranscriptTurn } from '../engine'
import { ChatBubble } from './ChatBubble'

const QUALITY_STYLE: Record<Quality, string> = {
  strong: 'bg-[var(--mint-soft)] text-mint',
  subtle: 'bg-[var(--amber-soft)] text-amber',
  backfire: 'bg-[var(--rose-soft)] text-rose',
}

export function Replay({
  partnerName,
  turns,
  ending,
}: {
  partnerName: string
  turns: TranscriptTurn[]
  ending: string
}) {
  return (
    <div className="flex flex-col gap-5">
      {turns.map((turn) => (
        <article key={turn.turnIndex} className="flex flex-col gap-2">
          <ChatBubble role="partner" name={partnerName} text={turn.partnerLine} />
          <div className="ml-auto flex w-[min(100%,20rem)] flex-col items-end gap-1.5">
            <ChatBubble role="user" text={turn.userText} />
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${QUALITY_STYLE[turn.quality]}`}
            >
              {turn.quality}
            </span>
            <p className="text-[14px] leading-relaxed text-muted">{turn.coachNote}</p>
            {turn.betterLine ? (
              <p className="text-[14px] leading-relaxed text-ink">
                <span className="text-soft">Try instead: </span>
                {turn.betterLine}
              </p>
            ) : null}
          </div>
          <ChatBubble role="reaction" name={partnerName} text={turn.reaction} />
        </article>
      ))}
      <ChatBubble role="partner" name={partnerName} text={ending} />
    </div>
  )
}
