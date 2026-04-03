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
          <div key={i} className="h-28 bg-card rounded-xl border border-border animate-pulse" />
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <p className="text-4xl mb-4">🏠</p>
        <p className="text-lg font-semibold text-text mb-1">아직 등록된 매물이 없어요</p>
        <p className="text-sm text-text-secondary mb-6">첫 매물을 등록해 보세요!</p>
        <button
          onClick={() => navigate('/property/new')}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold min-h-[44px]"
        >
          매물 등록하기
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
      <button
        onClick={() => navigate('/property/new')}
        className="fixed right-4 bottom-[76px] w-14 h-14 bg-primary text-white rounded-full shadow-lg text-2xl flex items-center justify-center z-30"
        aria-label="매물 추가"
      >
        +
      </button>
    </div>
  )
}
