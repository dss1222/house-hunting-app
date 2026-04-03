import { useNavigate } from 'react-router-dom'
import { useProperties } from '../../hooks/useProperties'
import { PropertyCard } from '../property/PropertyCard'

export function ListView() {
  const { properties, loading } = useProperties()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="px-5 pt-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-5 w-32 skeleton" />
            <div className="h-4 w-48 skeleton" />
            <div className="h-6 w-36 skeleton" />
          </div>
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-5 text-center min-h-[60vh] animate-fade-in">
        <p className="text-[40px] mb-4">🏠</p>
        <p className="text-[18px] font-bold text-text mb-2">아직 등록된 매물이 없어요</p>
        <p className="text-[14px] text-text-secondary mb-8">첫 매물을 등록해 보세요!</p>
        <button
          onClick={() => navigate('/property/new')}
          className="w-full max-w-[280px] py-3.5 bg-primary text-white rounded-2xl font-semibold text-[15px] min-h-[50px] active:bg-primary-dark transition-colors"
        >
          매물 등록하기
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Section header */}
      <div className="px-5 pt-4 pb-2">
        <p className="text-[13px] text-text-secondary">{properties.length}개의 매물</p>
      </div>

      {/* Property list */}
      <div className="divide-y divide-[#f2f4f6]">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/property/new')}
        className="fixed right-5 bottom-[88px] w-14 h-14 bg-primary text-white rounded-full shadow-[0_4px_12px_rgba(49,130,246,0.4)] flex items-center justify-center z-30 active:bg-primary-dark transition-colors"
        aria-label="매물 추가"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    </div>
  )
}
