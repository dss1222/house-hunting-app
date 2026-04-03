import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { path: '/', label: '리스트', icon: '📋' },
  { path: '/compare', label: '비교', icon: '📊' },
  { path: '/map', label: '지도', icon: '🗺️' },
] as const

export function BottomTabBar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around items-center h-[60px] z-50 safe-bottom">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] gap-0.5 ${
              isActive ? 'text-primary' : 'text-text-secondary'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
