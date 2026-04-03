import { useNavigate } from 'react-router-dom'
import type { Property } from '../../types'

function formatPrice(property: Property): string {
  if (property.price_type === '월세') {
    const dep = property.deposit ? `${property.deposit}` : '0'
    const rent = property.monthly_rent ? `/${property.monthly_rent}` : ''
    return `${dep}${rent}만원`
  }
  if (property.price_type === '전세') {
    return `${property.deposit ?? property.price ?? 0}만원`
  }
  return `${property.price ?? 0}만원`
}

export function PropertyCard({ property }: { property: Property }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/property/${property.id}`)}
      className="w-full flex items-center gap-4 px-5 py-4 text-left toss-press bg-card"
    >
      {/* Left content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-[16px] font-bold text-text truncate">{property.name}</h3>
          {property.rating > 0 && (
            <span className="text-[13px] text-star shrink-0">
              {'★'.repeat(Math.round(property.rating))}
            </span>
          )}
        </div>
        <p className="text-[13px] text-text-secondary truncate mb-2">{property.address}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[12px] font-semibold text-primary">{property.price_type}</span>
          <span className="text-[17px] font-bold text-text">{formatPrice(property)}</span>
        </div>
        <div className="flex items-center gap-1 mt-2 flex-wrap">
          {property.size_pyeong && (
            <span className="text-[12px] text-text-secondary bg-[#f2f4f6] px-2 py-0.5 rounded-md">{property.size_pyeong}평</span>
          )}
          {property.rooms && (
            <span className="text-[12px] text-text-secondary bg-[#f2f4f6] px-2 py-0.5 rounded-md">방{property.rooms}</span>
          )}
          {property.floor && (
            <span className="text-[12px] text-text-secondary bg-[#f2f4f6] px-2 py-0.5 rounded-md">{property.floor}층</span>
          )}
          {property.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[12px] text-primary bg-primary-light px-2 py-0.5 rounded-md">{tag}</span>
          ))}
        </div>
      </div>
      {/* Right chevron */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  )
}
