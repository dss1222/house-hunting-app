import { useNavigate } from 'react-router-dom'
import { useProperties } from '../../hooks/useProperties'
import type { Property } from '../../types'

const fields: { key: keyof Property | 'priceDisplay' | 'fullOption'; label: string; render?: (p: Property) => string }[] = [
  { key: 'priceDisplay', label: '가격(만원)', render: (p) => {
    if (p.price_type === '월세') return `${p.deposit ?? 0}/${p.monthly_rent ?? 0}`
    if (p.price_type === '전세') return `${p.deposit ?? p.price ?? 0}`
    return `${p.price ?? 0}`
  }},
  { key: 'price_type', label: '유형' },
  { key: 'size_pyeong', label: '전용면적', render: (p) => p.size_pyeong ? `${p.size_pyeong}평` : '-' },
  { key: 'floor', label: '층수', render: (p) => p.floor ? `${p.floor}층` : '-' },
  { key: 'rooms', label: '방', render: (p) => p.rooms ? `${p.rooms}개` : '-' },
  { key: 'bathrooms', label: '화장실', render: (p) => p.bathrooms ? `${p.bathrooms}개` : '-' },
  { key: 'direction', label: '방향', render: (p) => p.direction ?? '-' },
  { key: 'fullOption', label: '풀옵션', render: (p) => p.tags.includes('풀옵션') ? 'O' : '-' },
  { key: 'parking', label: '주차', render: (p) => p.parking ? '가능' : '불가' },
  { key: 'maintenance_fee', label: '관리비', render: (p) => p.maintenance_fee ? `${p.maintenance_fee}만` : '-' },
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
        <p className="text-[20px] font-bold text-white mb-2">비교할 매물이 없어요</p>
        <p className="text-[14px] text-[#8b95a1]">먼저 매물을 등록해 주세요</p>
      </div>
    )
  }

  const prices = properties.map(getPriceValue)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  return (
    <div className="animate-fade-in">
      <div className="px-5 pt-2 pb-4">
        <p className="text-[22px] font-bold text-white">{properties.length}개 비교</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-max min-w-full">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[#17171c] px-5 py-3 text-left text-[13px] font-semibold text-[#8b95a1] border-b-2 border-[#2c2c35] min-w-[72px]">
                항목
              </th>
              {properties.map((p) => (
                <th key={p.id} className="px-4 py-3 text-center border-b-2 border-[#2c2c35] min-w-[120px] bg-[#17171c]">
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
              <tr key={field.key} className={idx % 2 === 1 ? 'bg-[#1c1c22]' : 'bg-[#17171c]'}>
                <td className={`sticky left-0 z-10 ${idx % 2 === 1 ? 'bg-[#1c1c22]' : 'bg-[#17171c]'} px-5 py-3.5 text-[13px] font-medium text-[#8b95a1] border-b border-[#2c2c35]`}>
                  {field.label}
                </td>
                {properties.map((p) => {
                  const value = field.render ? field.render(p) : String(p[field.key as keyof Property] ?? '-')
                  const isPriceRow = field.key === 'priceDisplay'
                  const pv = getPriceValue(p)
                  let cls = 'text-white'
                  if (isPriceRow && properties.length > 1) {
                    if (pv === minPrice) cls = 'text-[#00b76a] font-bold'
                    else if (pv === maxPrice) cls = 'text-[#f04452] font-bold'
                    else cls = 'text-white font-bold'
                  }
                  if (field.key === 'parking') {
                    cls = p.parking ? 'text-[#3182f6] font-semibold' : 'text-[#4e5968]'
                  }
                  if (field.key === 'fullOption') {
                    cls = p.tags.includes('풀옵션') ? 'text-[#00b76a] font-semibold' : 'text-[#4e5968]'
                  }
                  if (field.key === 'rating' && p.rating) {
                    cls = 'text-[#ffb800]'
                  }
                  return (
                    <td key={p.id} className={`px-4 py-3.5 text-center text-[14px] border-b border-[#2c2c35] ${cls}`}>
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
