import type { ReactNode } from 'react'
import { BottomTabBar } from './BottomTabBar'
import { useAuth } from '../../hooks/useAuth'

export function MobileLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()

  return (
    <div className="flex flex-col min-h-dvh bg-card">
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 h-[56px] bg-card">
        <h1 className="text-[18px] font-bold text-text">우리집 찾기</h1>
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-text-secondary truncate max-w-[100px]">
            {user?.user_metadata?.['full_name'] ?? user?.email?.split('@')[0]}
          </span>
          <button
            onClick={signOut}
            className="text-[13px] text-text-tertiary min-h-[44px] flex items-center active:text-text-secondary transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>
      <main className="flex-1 pb-[80px]">
        {children}
      </main>
      <BottomTabBar />
    </div>
  )
}
