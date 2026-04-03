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

  return (
    <button
      onClick={() => navigate(`/property/${property.id}`)}
      className="toss-press w-full text-left px-5 py-5"
    >
      {/* Name + Stars */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[16px] font-bold text-white truncate flex-1 mr-3">{property.name}</h3>
        {property.rating > 0 && (
          <div className="flex gap-0.5 shrink-0">
            {[1,2,3,4,5].map(i => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= Math.round(property.rating) ? '#ffb800' : 'none'} stroke={i <= Math.round(property.rating) ? '#ffb800' : '#4e5968'} strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
        )}
      </div>

      {/* Address */}
      <p className="text-[13px] text-[#8b95a1] mb-3">{property.address}</p>

      {/* Price */}
      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-[20px] font-bold text-white tracking-tight">{formatPrice(property)}</span>
        <span className="text-[13px] text-[#8b95a1]">만원</span>
        <span className="text-[12px] text-[#4e5968] ml-1">{property.price_type}</span>
      </div>

      {/* Tags & Details */}
      {(details.length > 0 || property.tags.length > 0) && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {details.map((d) => (
            <span key={d} className="text-[12px] text-[#8b95a1] bg-[#2c2c35] px-2.5 py-1 rounded-md font-medium">{d}</span>
          ))}
          {property.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[12px] text-[#3182f6] bg-[#1a3a5c] px-2.5 py-1 rounded-md font-medium">{tag}</span>
          ))}
        </div>
      )}
    </button>
  )
}
