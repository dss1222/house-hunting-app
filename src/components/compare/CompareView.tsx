import { useNavigate } from 'react-router-dom'
import { useProperties } from '../../hooks/useProperties'
import type { Property } from '../../types'

const fields: { key: keyof Property | 'priceDisplay'; label: string; render?: (p: Property) => string }[] = [
  { key: 'priceDisplay', label: '가격', render: (p) => {
    if (p.price_type === '월세') return `${p.deposit ?? 0}/${p.monthly_rent ?? 0}`
    if (p.price_type === '전세') return `${p.deposit ?? p.price ?? 0}`
    return `${p.price ?? 0}`
  }},
  { key: 'price_type', label: '유형' },
  { key: 'size_pyeong', label: '평수', render: (p) => p.size_pyeong ? `${p.size_pyeong}평` : '-' },
  { key: 'floor', label: '층수', render: (p) => p.floor ? `${p.floor}층` : '-' },
  { key: 'rooms', label: '방', render: (p) => p.rooms ? `${p.rooms}개` : '-' },
  { key: 'bathrooms', label: '화장실', render: (p) => p.bathrooms ? `${p.bathrooms}개` : '-' },
  { key: 'parking', label: '주차', render: (p) => p.parking ? 'O' : 'X' },
  { key: 'maintenance_fee', label: '관리비', render: (p) => p.maintenance_fee ? `${p.maintenance_fee}만` : '-' },
  { key: 'direction', label: '방향', render: (p) => p.direction ?? '-' },
  { key: 'rating', label: '별점', render: (p) => p.rating ? '★'.repeat(Math.round(p.rating)) : '-' },
  { key: 'tags', label: '태그', render: (p) => p.tags.length > 0 ? p.tags.join(', ') : '-' },
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
    return <div className="flex items-center justify-center p-8"><p className="text-text-secondary">로딩 중...</p></div>
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <p className="text-4xl mb-4">📊</p>
        <p className="text-lg font-semibold text-text">비교할 매물이 없어요</p>
        <p className="text-sm text-text-secondary mt-1">먼저 매물을 등록해 주세요.</p>
      </div>
    )
  }

  const prices = properties.map(getPriceValue)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  return (
    <div className="overflow-x-auto">
      <table className="w-max min-w-full text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-card px-3 py-2 text-left text-xs text-text-secondary border-b border-r border-border min-w-[80px]">
              항목
            </th>
            {properties.map((p) => (
              <th key={p.id} className="px-3 py-2 text-center border-b border-border min-w-[140px]">
                <button
                  onClick={() => navigate(`/property/${p.id}`)}
                  className="text-primary font-semibold text-sm truncate max-w-[130px] block mx-auto min-h-[44px] flex items-center justify-center"
                >
                  {p.name}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.key}>
              <td className="sticky left-0 z-10 bg-card px-3 py-2.5 text-xs font-medium text-text-secondary border-b border-r border-border">
                {field.label}
              </td>
              {properties.map((p) => {
                const value = field.render ? field.render(p) : String(p[field.key as keyof Property] ?? '-')
                const isPriceRow = field.key === 'priceDisplay'
                const pv = getPriceValue(p)
                let priceColor = ''
                if (isPriceRow && properties.length > 1) {
                  if (pv === minPrice) priceColor = 'text-success font-bold'
                  else if (pv === maxPrice) priceColor = 'text-danger font-bold'
                }
                return (
                  <td key={p.id} className={`px-3 py-2.5 text-center text-sm border-b border-border ${priceColor}`}>
                    {value}
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
