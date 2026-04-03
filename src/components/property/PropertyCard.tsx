import { useNavigate } from 'react-router-dom'
import type { Property } from '../../types'

function formatPriceKorean(property: Property): string {
  const toKorean = (manwon: number): string => {
    if (manwon <= 0) return '0'
    const eok = Math.floor(manwon / 10000)
    const remainder = manwon % 10000
    if (eok > 0 && remainder > 0) {
      return `${eok}억 ${remainder.toLocaleString()}만원`
    }
    if (eok > 0) {
      return `${eok}억`
    }
    return `${remainder.toLocaleString()}만원`
  }

  if (property.price_type === '월세') {
    const dep = property.deposit ? toKorean(property.deposit) : '0'
    const rent = property.monthly_rent ? `/${property.monthly_rent.toLocaleString()}만원` : ''
    return `${dep}${rent}`
  }
  if (property.price_type === '전세') {
    const amount = property.deposit ?? property.price ?? 0
    return toKorean(amount)
  }
  return toKorean(property.price ?? 0)
}

export function PropertyCard({ property }: { property: Property }) {
  const navigate = useNavigate()

  const details: string[] = []
  if (property.size_pyeong) details.push(`${property.size_pyeong}평`)
  if (property.floor) details.push(`${property.floor}층`)
  if (property.rooms) details.push(`방${property.rooms}개`)
  if (property.direction) details.push(property.direction)

  const isFullOption = property.tags.includes('풀옵션')
  const otherTags = property.tags.filter((t) => t !== '풀옵션')

  return (
    <button
      onClick={() => navigate(`/property/${property.id}`)}
      className="toss-press w-full text-left px-5 py-5"
    >
      {/* 거래 유형 + 별점 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold text-[#3182f6]">{property.price_type}</span>
        {property.rating > 0 && (
          <div className="flex gap-0.5 shrink-0">
            {[1,2,3,4,5].map(i => (
              <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.round(property.rating) ? '#ffb800' : 'none'} stroke={i <= Math.round(property.rating) ? '#ffb800' : '#4e5968'} strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
        )}
      </div>

      {/* 가격 크게 */}
      <p className="text-[22px] font-bold text-white tracking-tight leading-tight mb-1">
        {formatPriceKorean(property)}
      </p>

      {/* 매물명 */}
      <p className="text-[14px] font-semibold text-[#cccccc] mb-1 truncate">{property.name}</p>

      {/* 주소 */}
      <p className="text-[13px] text-[#666] mb-3 truncate">{property.address}</p>

      {/* 서브 정보 한 줄 */}
      {details.length > 0 && (
        <p className="text-[13px] text-[#8b95a1] mb-3">
          {details.join(' · ')}
        </p>
      )}

      {/* 태그 - pill 스타일 */}
      {(property.tags.length > 0) && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {isFullOption && (
            <span className="text-[12px] text-[#00b76a] border border-[#00b76a]/40 px-2.5 py-1 rounded-full font-semibold">풀옵션</span>
          )}
          {otherTags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[12px] text-[#999] border border-[#333] px-2.5 py-1 rounded-full font-medium">{tag}</span>
          ))}
        </div>
      )}
    </button>
  )
}
