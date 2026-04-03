import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BottomTabBar } from './BottomTabBar'
import { useAuth } from '../../hooks/useAuth'

export function MobileLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const displayName = user?.user_metadata?.['full_name'] ?? user?.email?.split('@')[0] ?? ''

  return (
    <div className="flex flex-col min-h-dvh bg-[#000000]">
      <header className="sticky top-0 z-40 bg-[#000000] px-5">
        <div className="flex items-center justify-between h-[56px]">
          <h1 className="text-[20px] font-bold text-white tracking-tight">우리집 찾기</h1>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#4e5968]">{displayName}</span>
            <button
              onClick={signOut}
              className="w-8 h-8 rounded-full bg-[#1f1f1f] flex items-center justify-center active:bg-[#2a2a2a] transition-colors"
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

      {/* FAB - 홈 화면에서만 표시 */}
      {location.pathname === '/' && (
        <button
          onClick={() => navigate('/property/new')}
          aria-label="새 매물 등록"
          style={{
            position: 'fixed',
            right: 20,
            bottom: 76,
            zIndex: 9999,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: '#3182f6',
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(49,130,246,0.45)',
            cursor: 'pointer',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      )}
    </div>
  )
}
