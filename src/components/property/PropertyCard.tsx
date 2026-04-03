import { useNavigate } from 'react-router-dom'
import type { Property } from '../../types'
import { RatingStars } from './RatingStars'

function formatPrice(property: Property): string {
  if (property.price_type === '월세') {
    const dep = property.deposit ? `${property.deposit}` : '0'
    const rent = property.monthly_rent ? `/${property.monthly_rent}` : ''
    return `월세 ${dep}${rent}만원`
  }
  if (property.price_type === '전세') {
    return `전세 ${property.deposit ?? property.price ?? 0}만원`
  }
  return `매매 ${property.price ?? 0}만원`
}

export function PropertyCard({ property }: { property: Property }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/property/${property.id}`)}
      className="w-full bg-card rounded-xl border border-border p-4 text-left active:bg-gray-50 transition-colors"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-base font-semibold text-text truncate flex-1">{property.name}</h3>
        <RatingStars value={property.rating} size="sm" />
      </div>
      <p className="text-sm text-text-secondary mb-1 truncate">{property.address}</p>
      <p className="text-base font-bold text-primary mb-2">{formatPrice(property)}</p>
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        {property.size_pyeong && <span>{property.size_pyeong}평</span>}
        {property.rooms && <span>방{property.rooms}</span>}
        {property.floor && <span>{property.floor}층</span>}
      </div>
      {property.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {property.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 bg-primary-light text-primary rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
