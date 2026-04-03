import { useNavigate } from 'react-router-dom'
import { useProperties } from '../../hooks/useProperties'
import type { Property } from '../../types'

const fields: { key: keyof Property | 'priceDisplay'; label: string; render?: (p: Property) => string }[] = [
  { key: 'priceDisplay', label: '가격(만원)', render: (p) => {
    if (p.price_type === '월세') return `${p.deposit ?? 0}/${p.monthly_rent ?? 0}`
    if (p.price_type === '전세') return `${p.deposit ?? p.price ?? 0}`
    return `${p.price ?? 0}`
  }},
  { key: 'price_type', label: '유형' },
  { key: 'size_pyeong', label: '평수', render: (p) => p.size_pyeong ? `${p.size_pyeong}평` : '-' },
  { key: 'floor', label: '층수', render: (p) => p.floor ? `${p.floor}층` : '-' },
  { key: 'rooms', label: '방', render: (p) => p.rooms ? `${p.rooms}개` : '-' },
  { key: 'bathrooms', label: '화장실', render: (p) => p.bathrooms ? `${p.bathrooms}개` : '-' },
  { key: 'parking', label: '주차', render: (p) => p.parking ? '가능' : '불가' },
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
    return (
      <div className="px-5 pt-6 space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-10 skeleton" />)}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-5 text-center min-h-[60vh] animate-fade-in">
        <p className="text-[40px] mb-4">📊</p>
        <p className="text-[18px] font-bold text-text mb-2">비교할 매물이 없어요</p>
        <p className="text-[14px] text-text-secondary">먼저 매물을 등록해 주세요.</p>
      </div>
    )
  }

  const prices = properties.map(getPriceValue)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  return (
    <div className="animate-fade-in">
      <div className="px-5 pt-4 pb-3">
        <h2 className="text-[18px] font-bold text-text">매물 비교</h2>
        <p className="text-[13px] text-text-secondary mt-1">{properties.length}개 매물 비교 중</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-max min-w-full text-[14px]">
          <thead>
            <tr className="border-b-2 border-[#f2f4f6]">
              <th className="sticky left-0 z-10 bg-card px-5 py-3 text-left text-[13px] font-semibold text-text-secondary min-w-[80px]">
                항목
              </th>
              {properties.map((p) => (
                <th key={p.id} className="px-4 py-3 text-center min-w-[130px] bg-card">
                  <button
                    onClick={() => navigate(`/property/${p.id}`)}
                    className="text-[14px] text-primary font-bold truncate max-w-[120px] block mx-auto min-h-[44px] flex items-center justify-center active:opacity-60 transition-opacity"
                  >
                    {p.name}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.key} className="border-b border-[#f2f4f6]">
                <td className="sticky left-0 z-10 bg-card px-5 py-3.5 text-[13px] font-medium text-text-secondary">
                  {field.label}
                </td>
                {properties.map((p) => {
                  const value = field.render ? field.render(p) : String(p[field.key as keyof Property] ?? '-')
                  const isPriceRow = field.key === 'priceDisplay'
                  const pv = getPriceValue(p)
                  let cellClass = 'text-text'
                  if (isPriceRow && properties.length > 1) {
                    if (pv === minPrice) cellClass = 'text-primary font-bold'
                    else if (pv === maxPrice) cellClass = 'text-danger font-bold'
                  }
                  if (field.key === 'parking') {
                    cellClass = p.parking ? 'text-primary font-medium' : 'text-text-tertiary'
                  }
                  if (field.key === 'rating' && p.rating) {
                    cellClass = 'text-star'
                  }
                  return (
                    <td key={p.id} className={`px-4 py-3.5 text-center text-[14px] ${cellClass}`}>
                      {value}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
