import { useNavigate } from 'react-router-dom'
import { useProperties } from '../../hooks/useProperties'
import { PropertyCard } from '../property/PropertyCard'

export function ListView() {
  const { properties, loading } = useProperties()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="px-5 pt-6">
        <div className="h-7 w-28 skeleton mb-6" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2.5">
              <div className="h-5 w-40 skeleton" />
              <div className="h-4 w-56 skeleton" />
              <div className="h-7 w-32 skeleton" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-5 text-center min-h-[65vh] animate-fade-in">
        <div className="text-[48px] mb-5">🏠</div>
        <p className="text-[20px] font-bold text-white mb-2 leading-snug">
          아직 등록된 매물이 없어요
        </p>
        <p className="text-[14px] text-[#8b95a1] mb-10 leading-relaxed">
          집을 보러 다니면서<br />매물 정보를 기록해보세요
        </p>
        <button
          onClick={() => navigate('/property/new')}
          className="h-[52px] px-8 bg-[#3182f6] text-white rounded-2xl text-[15px] font-semibold active:scale-[0.97] active:opacity-85 transition-all"
        >
          첫 매물 등록하기
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="px-5 pt-2 pb-1">
        <p className="text-[22px] font-bold text-white">{properties.length}개의 매물</p>
      </div>

      <div>
        {properties.map((property) => (
          <div key={property.id} className="animate-fade-in border-b border-[#222] last:border-0">
            <PropertyCard property={property} />
          </div>
        ))}
      </div>
    </div>
  )
}
