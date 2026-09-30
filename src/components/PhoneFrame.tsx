import type { ReactNode } from 'react'

function SignalIcon() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" aria-hidden="true" fill="currentColor">
      <rect x="0" y="7" width="3" height="5" rx="0.6" />
      <rect x="4.5" y="5" width="3" height="7" rx="0.6" />
      <rect x="9" y="2.5" width="3" height="9.5" rx="0.6" />
      <rect x="13.5" y="0" width="3" height="12" rx="0.6" opacity="0.35" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="15" height="12" viewBox="0 0 15 12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M1.2 4.2C3.6 2 6.2 1 7.5 1s3.9 1 6.3 3.2" strokeLinecap="round" />
      <path d="M3.4 6.4C4.9 5 6.3 4.3 7.5 4.3s2.6.7 4.1 2.1" strokeLinecap="round" />
      <circle cx="7.5" cy="10" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  )
}

function BatteryIcon() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" aria-hidden="true" fill="none">
      <rect x="0.6" y="0.6" width="21" height="10.8" rx="2.4" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2.3" y="2.4" width="16.2" height="7.2" rx="1.2" fill="currentColor" />
      <rect x="22.6" y="3.6" width="1.8" height="4.8" rx="0.6" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-dvh w-full sm:aspect-[430/900] sm:h-auto sm:w-[min(430px,calc((100dvh-4.5rem)*430/900))] sm:shrink-0">
      <div className="pointer-events-none absolute top-[14%] -left-[3px] hidden flex-col gap-3 sm:flex" aria-hidden="true">
        <span className="h-8 w-[3px] rounded-l-sm bg-[#2a2438]" />
        <span className="h-12 w-[3px] rounded-l-sm bg-[#2a2438]" />
        <span className="h-12 w-[3px] rounded-l-sm bg-[#2a2438]" />
      </div>
      <div className="pointer-events-none absolute top-[20%] -right-[3px] hidden h-16 w-[3px] rounded-r-sm bg-[#2a2438] sm:block" aria-hidden="true" />

      <div
        className="phone-screen flex h-full w-full flex-col overflow-hidden bg-app sm:rounded-[42px] sm:border-[12px] sm:border-[var(--bezel)] phone-bezel"
        style={{
          paddingTop: 'var(--safe-top)',
          paddingBottom: 'var(--safe-bottom)',
        }}
      >
        <div className="relative hidden h-[54px] shrink-0 sm:block">
          <div className="absolute left-1/2 top-[10px] z-20 h-[28px] w-[118px] -translate-x-1/2 rounded-full bg-[var(--island)]" />
          <div className="flex h-full items-end justify-between px-7 pb-1 text-[12px] font-semibold text-ink">
            <span className="tabular-nums">9:41</span>
            <span className="flex items-center gap-1.5 text-ink" aria-hidden="true">
              <SignalIcon />
              <WifiIcon />
              <BatteryIcon />
            </span>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>

        <div className="hidden h-5 shrink-0 items-end justify-center pb-1.5 sm:flex" aria-hidden="true">
          <span className="h-[5px] w-[128px] rounded-full bg-ink/35" />
        </div>
      </div>
    </div>
  )
}
