import { useLocation, useNavigate } from 'react-router-dom'

const ListIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
  </svg>
)
const CompareIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10M12 20V4M6 20v-6"/>
  </svg>
)
const MapIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zM8 2v16M16 6v16"/>
  </svg>
)

const tabs = [
  { path: '/', label: '리스트', Icon: ListIcon },
  { path: '/compare', label: '비교', Icon: CompareIcon },
  { path: '/map', label: '지도', Icon: MapIcon },
] as const

export function BottomTabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/60 flex justify-around items-center h-[64px] z-50 safe-bottom shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      {tabs.map((tab) => {
        const active = isActive(tab.path)
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`relative flex flex-col items-center justify-center flex-1 h-full min-h-[44px] gap-1 transition-colors ${
              active ? 'text-primary' : 'text-text-tertiary'
            }`}
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[3px] rounded-full bg-gradient-to-r from-[#4f6cff] to-[#9f7afa]" />
            )}
            <tab.Icon active={active} />
            <span className={`text-[10px] leading-none ${active ? 'font-semibold' : 'font-normal'}`}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
