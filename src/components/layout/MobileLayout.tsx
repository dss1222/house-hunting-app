import type { ReactNode } from 'react'
import { BottomTabBar } from './BottomTabBar'
import { useAuth } from '../../hooks/useAuth'

export function MobileLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()

  const displayName = user?.user_metadata?.['full_name'] ?? user?.email?.split('@')[0] ?? ''

  return (
    <div className="flex flex-col min-h-dvh bg-white">
      {/* Toss-style header - clean, bold, lots of space */}
      <header className="sticky top-0 z-40 bg-white px-5">
        <div className="flex items-center justify-between h-[56px]">
          <h1 className="text-[20px] font-bold text-text tracking-tight">우리집 찾기</h1>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-text-tertiary">{displayName}</span>
            <button
              onClick={signOut}
              className="w-8 h-8 rounded-full bg-[#f2f4f6] flex items-center justify-center active:bg-[#e5e8eb] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b95a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-[88px]">
        {children}
      </main>

      <BottomTabBar />
    </div>
  )
}
