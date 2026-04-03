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
  { key: 'rating', label: '별점', render: (p) => p.rating ? `${p.rating}점` : '-' },
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
        <div className="h-7 w-32 skeleton" />
        {[1, 2, 3].map(i => <div key={i} className="h-12 skeleton" />)}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-5 text-center min-h-[65vh] animate-fade-in">
        <div className="text-[48px] mb-5">📊</div>
        <p className="text-[20px] font-bold text-text mb-2">비교할 매물이 없어요</p>
        <p className="text-[14px] text-text-secondary">먼저 매물을 등록해 주세요</p>
      </div>
    )
  }

  const prices = properties.map(getPriceValue)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  return (
    <div className="animate-fade-in">
      <div className="px-5 pt-4 pb-4">
        <p className="text-[22px] font-bold text-text">{properties.length}개 비교</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-max min-w-full">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white px-5 py-3 text-left text-[13px] font-semibold text-text-secondary border-b-2 border-[#f2f4f6] min-w-[72px]">
                항목
              </th>
              {properties.map((p) => (
                <th key={p.id} className="px-4 py-3 text-center border-b-2 border-[#f2f4f6] min-w-[120px] bg-white">
                  <button
                    onClick={() => navigate(`/property/${p.id}`)}
                    className="text-[14px] text-[#3182f6] font-bold truncate max-w-[110px] mx-auto block min-h-[40px] leading-[40px] active:opacity-50 transition-opacity"
                  >
                    {p.name}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((field, idx) => (
              <tr key={field.key} className={idx % 2 === 1 ? 'bg-[#fafbfc]' : 'bg-white'}>
                <td className={`sticky left-0 z-10 ${idx % 2 === 1 ? 'bg-[#fafbfc]' : 'bg-white'} px-5 py-3.5 text-[13px] font-medium text-text-secondary border-b border-[#f2f4f6]`}>
                  {field.label}
                </td>
                {properties.map((p) => {
                  const value = field.render ? field.render(p) : String(p[field.key as keyof Property] ?? '-')
                  const isPriceRow = field.key === 'priceDisplay'
                  const pv = getPriceValue(p)
                  let cls = 'text-text'
                  if (isPriceRow && properties.length > 1) {
                    if (pv === minPrice) cls = 'text-[#3182f6] font-bold'
                    else if (pv === maxPrice) cls = 'text-[#f04452] font-bold'
                    else cls = 'text-text font-bold'
                  }
                  if (field.key === 'parking') {
                    cls = p.parking ? 'text-[#3182f6] font-semibold' : 'text-text-tertiary'
                  }
                  return (
                    <td key={p.id} className={`px-4 py-3.5 text-center text-[14px] border-b border-[#f2f4f6] ${cls}`}>
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
