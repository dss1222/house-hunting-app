import type { ReactNode } from 'react'
import { BottomTabBar } from './BottomTabBar'
import { useAuth } from '../../hooks/useAuth'

export function MobileLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-[52px] bg-card border-b border-border">
        <h1 className="text-lg font-bold text-primary">우리집 찾기</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary truncate max-w-[120px]">
            {user?.user_metadata?.['full_name'] ?? user?.email}
          </span>
          <button
            onClick={signOut}
            className="text-xs text-text-secondary px-2 py-1 rounded-md hover:bg-gray-100 min-h-[44px] flex items-center"
          >
            로그아웃
          </button>
        </div>
      </header>
      <main className="flex-1 pb-[68px] overflow-y-auto">
        {children}
      </main>
      <BottomTabBar />
    </div>
  )
}
