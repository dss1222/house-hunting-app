import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  {
    path: '/',
    label: '홈',
    icon: (a: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={a ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        {a
          ? <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z"/>
          : <><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z"/><path d="M9 22V12h6v10"/></>
        }
      </svg>
    ),
  },
  {
    path: '/compare',
    label: '비교',
    icon: (a: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
  },
  {
    path: '/map',
    label: '지도',
    icon: (a: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
] as const

export function BottomTabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-[#f2f4f6] flex justify-around items-end h-[72px] z-50 pb-[env(safe-area-inset-bottom)]">
      {tabs.map((tab) => {
        const active = isActive(tab.path)
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center justify-center flex-1 pt-2 pb-1.5 gap-0.5 transition-colors ${
              active ? 'text-text' : 'text-text-tertiary'
            }`}
          >
            {tab.icon(active)}
            <span className={`text-[10px] ${active ? 'font-bold' : 'font-normal'}`}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
