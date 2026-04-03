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

function priceTypeBadgeColor(type: string) {
  if (type === '월세') return 'bg-warning-light text-warning'
  if (type === '전세') return 'bg-success-light text-success'
  return 'bg-primary-light text-primary'
}

export function PropertyCard({ property }: { property: Property }) {
  const navigate = useNavigate()

  const stars = property.rating > 0
    ? Array.from({ length: 5 }, (_, i) => i < Math.round(property.rating))
    : null

  return (
    <button
      onClick={() => navigate(`/property/${property.id}`)}
      className="w-full bg-card rounded-2xl p-4 text-left shadow-[var(--shadow-card)] active:shadow-[var(--shadow-card-hover)] active:scale-[0.99] transition-all duration-150 border border-border/50"
    >
      <div className="flex justify-between items-start gap-3 mb-2.5">
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-text truncate leading-snug">{property.name}</h3>
          <p className="text-xs text-text-tertiary mt-0.5 truncate flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {property.address}
          </p>
        </div>
        {stars && (
          <div className="flex gap-px shrink-0 mt-0.5">
            {stars.map((filled, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#ffc233' : 'none'} stroke="#ffc233" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${priceTypeBadgeColor(property.price_type)}`}>
          {property.price_type}
        </span>
        <span className="text-base font-bold text-text">{formatPrice(property)}</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {property.size_pyeong && (
          <span className="text-[11px] text-text-secondary bg-bg px-2 py-1 rounded-lg">{property.size_pyeong}평</span>
        )}
        {property.rooms && (
          <span className="text-[11px] text-text-secondary bg-bg px-2 py-1 rounded-lg">방 {property.rooms}</span>
        )}
        {property.floor && (
          <span className="text-[11px] text-text-secondary bg-bg px-2 py-1 rounded-lg">{property.floor}층</span>
        )}
        {property.parking && (
          <span className="text-[11px] text-text-secondary bg-bg px-2 py-1 rounded-lg">주차</span>
        )}
        {property.tags.map((tag) => (
          <span key={tag} className="text-[11px] px-2 py-1 bg-primary-light text-primary font-medium rounded-lg">
            {tag}
          </span>
        ))}
      </div>
    </button>
  )
}
