import type { ReactNode } from 'react'
import { BottomTabBar } from './BottomTabBar'
import { useAuth } from '../../hooks/useAuth'

export function MobileLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-[56px] glass border-b border-white/60 shadow-soft">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4f6cff] to-[#9f7afa] flex items-center justify-center shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-base font-bold text-gradient">우리집 찾기</h1>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-text-secondary truncate max-w-[100px]">
            {user?.user_metadata?.['full_name'] ?? user?.email?.split('@')[0]}
          </span>
          <button
            onClick={signOut}
            className="text-xs text-text-tertiary px-2 py-1 rounded-lg active:bg-gray-100 min-h-[44px] flex items-center transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </header>
      <main className="flex-1 pb-[72px] overflow-y-auto">
        {children}
      </main>
      <BottomTabBar />
    </div>
  )
}
