import { useNavigate } from 'react-router-dom'
import type { Property } from '../../types'

function formatPrice(property: Property): string {
  if (property.price_type === '월세') {
    const dep = property.deposit ? `${property.deposit}` : '0'
    const rent = property.monthly_rent ? `/${property.monthly_rent}` : ''
    return `${dep}${rent}`
  }
  if (property.price_type === '전세') {
    return `${property.deposit ?? property.price ?? 0}`
  }
  return `${property.price ?? 0}`
}

export function PropertyCard({ property }: { property: Property }) {
  const navigate = useNavigate()

  const details: string[] = []
  if (property.size_pyeong) details.push(`${property.size_pyeong}평`)
  if (property.rooms) details.push(`방 ${property.rooms}개`)
  if (property.floor) details.push(`${property.floor}층`)
  if (property.parking) details.push('주차 가능')

  return (
    <button
      onClick={() => navigate(`/property/${property.id}`)}
      className="toss-press w-full text-left px-5 py-5"
    >
      {/* Name + Rating */}
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-[16px] font-bold text-text truncate">{property.name}</h3>
        {property.rating > 0 && (
          <div className="flex items-center gap-0.5 shrink-0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffb800" stroke="#ffb800" strokeWidth="1">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-[13px] font-semibold text-text">{property.rating}</span>
          </div>
        )}
      </div>

      {/* Address */}
      <p className="text-[13px] text-text-secondary mb-3">{property.address}</p>

      {/* Price - BIG, like Toss shows money */}
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-[13px] font-medium text-[#3182f6]">{property.price_type}</span>
        <span className="text-[22px] font-bold text-text tracking-tight">{formatPrice(property)}</span>
        <span className="text-[14px] text-text-secondary">만원</span>
      </div>

      {/* Details chips */}
      {(details.length > 0 || property.tags.length > 0) && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {details.map((d) => (
            <span key={d} className="text-[12px] text-text-secondary bg-[#f2f4f6] px-2.5 py-1 rounded-md font-medium">{d}</span>
          ))}
          {property.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[12px] text-[#3182f6] bg-[#e8f3ff] px-2.5 py-1 rounded-md font-medium">{tag}</span>
          ))}
        </div>
      )}
    </button>
  )
}
