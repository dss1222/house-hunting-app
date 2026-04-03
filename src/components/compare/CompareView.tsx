import { useNavigate } from 'react-router-dom'
import { useProperties } from '../../hooks/useProperties'
import type { Property } from '../../types'

const fields: { key: keyof Property | 'priceDisplay'; label: string; icon: string; render?: (p: Property) => string }[] = [
  { key: 'priceDisplay', label: '가격', icon: '₩', render: (p) => {
    if (p.price_type === '월세') return `${p.deposit ?? 0}/${p.monthly_rent ?? 0}`
    if (p.price_type === '전세') return `${p.deposit ?? p.price ?? 0}`
    return `${p.price ?? 0}`
  }},
  { key: 'price_type', label: '유형', icon: '분' },
  { key: 'size_pyeong', label: '평수', icon: '평', render: (p) => p.size_pyeong ? `${p.size_pyeong}평` : '-' },
  { key: 'floor', label: '층수', icon: '층', render: (p) => p.floor ? `${p.floor}층` : '-' },
  { key: 'rooms', label: '방', icon: '방', render: (p) => p.rooms ? `${p.rooms}개` : '-' },
  { key: 'bathrooms', label: '화장실', icon: '욕', render: (p) => p.bathrooms ? `${p.bathrooms}개` : '-' },
  { key: 'parking', label: '주차', icon: 'P', render: (p) => p.parking ? '가능' : '불가' },
  { key: 'maintenance_fee', label: '관리비', icon: '비', render: (p) => p.maintenance_fee ? `${p.maintenance_fee}만` : '-' },
  { key: 'direction', label: '방향', icon: '향', render: (p) => p.direction ?? '-' },
  { key: 'rating', label: '별점', icon: '★', render: (p) => p.rating ? '★'.repeat(Math.round(p.rating)) : '-' },
  { key: 'tags', label: '태그', icon: '#', render: (p) => p.tags.length > 0 ? p.tags.join(', ') : '-' },
]

function getPriceValue(p: Property): number {
  if (p.price_type === '월세') return p.deposit ?? 0
  if (p.price_type === '전세') return p.deposit ?? p.price ?? 0
  return p.price ?? 0
}

export function CompareView() {
  const { properties, loading } = useProperties()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-12 skeleton rounded-xl" />)}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh] animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-primary-light flex items-center justify-center mb-5">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="text-primary"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
        </div>
        <p className="text-lg font-bold text-text">비교할 매물이 없어요</p>
        <p className="text-sm text-text-secondary mt-1">먼저 매물을 등록해 주세요.</p>
      </div>
    )
  }

  const prices = properties.map(getPriceValue)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  return (
    <div className="overflow-x-auto animate-fade-in">
      <table className="w-max min-w-full text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 glass px-3 py-3 text-left text-[10px] font-semibold text-text-tertiary uppercase tracking-wider border-b border-r border-border/50 min-w-[80px]">
              항목
            </th>
            {properties.map((p) => (
              <th key={p.id} className="px-3 py-2 text-center border-b border-border/50 min-w-[140px] bg-card">
                <button
                  onClick={() => navigate(`/property/${p.id}`)}
                  className="text-primary font-bold text-sm truncate max-w-[130px] block mx-auto min-h-[44px] flex items-center justify-center active:opacity-70 transition-opacity"
                >
                  {p.name}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fields.map((field, rowIdx) => (
            <tr key={field.key} className={rowIdx % 2 === 0 ? 'bg-card' : 'bg-bg/50'}>
              <td className="sticky left-0 z-10 glass px-3 py-3 text-xs font-medium text-text-secondary border-b border-r border-border/50">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-primary-light text-primary text-[10px] font-bold flex items-center justify-center shrink-0">{field.icon}</span>
                  {field.label}
                </span>
              </td>
              {properties.map((p) => {
                const value = field.render ? field.render(p) : String(p[field.key as keyof Property] ?? '-')
                const isPriceRow = field.key === 'priceDisplay'
                const isParkingRow = field.key === 'parking'
                const pv = getPriceValue(p)
                let cellClass = ''
                if (isPriceRow && properties.length > 1) {
                  if (pv === minPrice) cellClass = 'text-success font-bold'
                  else if (pv === maxPrice) cellClass = 'text-danger font-bold'
                }
                if (isParkingRow) {
                  cellClass = p.parking ? 'text-success font-medium' : 'text-text-tertiary'
                }
                return (
                  <td key={p.id} className={`px-3 py-3 text-center text-sm border-b border-border/50 ${cellClass}`}>
                    {field.key === 'rating' && p.rating ? (
                      <span className="text-star">{value}</span>
                    ) : value}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
