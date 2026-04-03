import { useNavigate } from 'react-router-dom'
import { useProperties } from '../../hooks/useProperties'
import { PropertyCard } from '../property/PropertyCard'

export function ListView() {
  const { properties, loading } = useProperties()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[120px] rounded-2xl skeleton" />
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh] animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-primary-light flex items-center justify-center mb-5">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-primary"/>
            <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-primary"/>
          </svg>
        </div>
        <p className="text-lg font-bold text-text mb-1">아직 등록된 매물이 없어요</p>
        <p className="text-sm text-text-secondary mb-8">첫 매물을 등록해 보세요!</p>
        <button
          onClick={() => navigate('/property/new')}
          className="px-8 py-3.5 bg-gradient-to-r from-[#4f6cff] to-[#7c5cfc] text-white rounded-2xl font-semibold min-h-[48px] shadow-[0_4px_16px_rgba(79,108,255,0.3)] active:scale-[0.98] transition-transform"
        >
          매물 등록하기
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-text-tertiary font-medium">{properties.length}개 매물</p>
      </div>
      {properties.map((property, index) => (
        <div key={property.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.04}s` }}>
          <PropertyCard property={property} />
        </div>
      ))}
      <button
        onClick={() => navigate('/property/new')}
        className="fixed right-4 bottom-[80px] w-14 h-14 bg-gradient-to-br from-[#4f6cff] to-[#9f7afa] text-white rounded-2xl shadow-[var(--shadow-float)] text-2xl flex items-center justify-center z-30 active:scale-95 transition-transform"
        aria-label="매물 추가"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    </div>
  )
}
