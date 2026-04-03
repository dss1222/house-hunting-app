import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { usePhotos } from '../../hooks/usePhotos'
import { useReviews } from '../../hooks/useReviews'
import { RatingStars } from './RatingStars'
import { PhotoUploader } from './PhotoUploader'
import { ReviewSection } from './ReviewSection'
import type { Property } from '../../types'
import { COMMUTE_DESTINATIONS } from '../../lib/constants'

function toKoreanPrice(manwon: number): string {
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

export function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const { photos, uploading, fetchPhotos, uploadPhoto, deletePhoto } = usePhotos(id!)
  const { reviews, fetchReviews, upsertReview } = useReviews(id!)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('properties').select('*').eq('id', id).single().then(({ data }) => {
        setProperty(data)
        setLoading(false)
      }),
      fetchPhotos(),
      fetchReviews(),
    ])
  }, [id, fetchPhotos, fetchReviews])

  const handleDelete = async () => {
    if (!confirm('이 매물을 삭제하시겠습니까?')) return
    setDeleting(true)
    await supabase.from('properties').delete().eq('id', id)
    navigate('/', { replace: true })
  }

  if (loading) {
    return (
      <div className="px-5 pt-6 space-y-4">
        <div className="h-8 w-48 skeleton" />
        <div className="h-5 w-64 skeleton" />
        <div className="h-10 w-40 skeleton" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center px-5 min-h-[60vh] animate-fade-in">
        <p className="text-[48px] mb-4">😢</p>
        <p className="text-[15px] text-[#8b95a1]">매물을 찾을 수 없습니다</p>
      </div>
    )
  }

  const openDirections = (dest: typeof COMMUTE_DESTINATIONS[number]) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const webUrl = `https://map.kakao.com/link/to/${encodeURIComponent(dest.name)},${dest.lat},${dest.lng}`

    if (isMobile && property.latitude && property.longitude) {
      window.location.href = `kakaomap://route?sp=${property.latitude},${property.longitude}&ep=${dest.lat},${dest.lng}&by=PUBLICTRANSIT`
      setTimeout(() => {
        window.open(webUrl, '_blank', 'noopener,noreferrer')
      }, 1500)
    } else {
      window.open(webUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const priceDisplay = () => {
    if (property.price_type === '월세') {
      const dep = toKoreanPrice(property.deposit ?? 0)
      const rent = property.monthly_rent ? `/${property.monthly_rent.toLocaleString()}만원` : ''
      return `${dep}${rent}`
    }
    if (property.price_type === '전세') return toKoreanPrice(property.deposit ?? property.price ?? 0)
    return toKoreanPrice(property.price ?? 0)
  }

  const infoRows: { label: string; value: string }[] = []
  if (property.size_pyeong) infoRows.push({ label: '전용면적', value: `${property.size_pyeong}평` })
  if (property.floor) infoRows.push({ label: '층수', value: `${property.floor}층` })
  if (property.rooms) infoRows.push({ label: '방 수', value: `${property.rooms}개` })
  if (property.bathrooms) infoRows.push({ label: '화장실', value: `${property.bathrooms}개` })
  infoRows.push({ label: '주차', value: property.parking ? '가능' : '불가' })
  if (property.maintenance_fee) infoRows.push({ label: '관리비', value: `월 ${property.maintenance_fee}만원` })
  if (property.direction) infoRows.push({ label: '방향', value: property.direction })
  if (property.move_in_date) infoRows.push({ label: '입주 가능일', value: property.move_in_date })

  // 메모에서 링크 분리
  const memoLines = (property.memo ?? '').split('\n')
  const linkUrl = memoLines.find((l) => l.startsWith('http')) ?? null
  const memoText = memoLines.filter((l) => l !== linkUrl).join('\n').trim()

  return (
    <div className="animate-fade-in bg-[#000000]">
      {/* Nav */}
      <div className="flex items-center justify-between px-2 h-[48px]">
        <button onClick={() => navigate(-1)} className="w-[44px] h-[44px] flex items-center justify-center active:opacity-50 transition-opacity">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="flex">
          <button onClick={() => navigate(`/property/${id}/edit`)} className="h-[44px] px-4 text-[14px] text-[#3182f6] font-semibold active:opacity-50 transition-opacity">수정</button>
          <button onClick={handleDelete} disabled={deleting} className="h-[44px] px-4 text-[14px] text-[#f04452] font-semibold active:opacity-50 transition-opacity">
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>

      {/* Hero section */}
      <div className="px-5 pt-2 pb-7">
        {/* 거래 유형 뱃지 */}
        <div className="mb-3">
          <span className="text-[12px] font-bold text-[#3182f6] border border-[#3182f6]/40 px-2.5 py-1 rounded-full">{property.price_type}</span>
        </div>

        {/* 가격 - 매우 크게 */}
        <p className="text-[32px] font-bold text-white tracking-tight leading-tight mb-2">
          {priceDisplay()}
        </p>

        {/* 매물명 */}
        <h2 className="text-[18px] font-bold text-white leading-tight mb-1">{property.name}</h2>

        {/* 주소 */}
        <p className="text-[14px] text-[#666] mb-4">{property.address}</p>

        {/* 길찾기 버튼 */}
        {property.latitude && property.longitude && (
          <div className="flex gap-2 mb-5">
            {COMMUTE_DESTINATIONS.map((dest) => (
              <button
                key={dest.name}
                onClick={() => openDirections(dest)}
                className="text-[13px] text-[#3182f6] border border-[#3182f6]/30 bg-[#0d1f3c] px-3 py-1.5 rounded-full font-medium active:opacity-50 transition-opacity"
              >
                🚌 {dest.name}
              </button>
            ))}
          </div>
        )}

        {/* 별점 */}
        <div className="mb-4">
          <RatingStars value={property.rating} size="md" />
        </div>

        {/* 태그 - pill 스타일 */}
        {property.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {property.tags.map((tag) => (
              <span
                key={tag}
                className={`text-[13px] px-3 py-1.5 rounded-full font-medium border ${
                  tag === '풀옵션'
                    ? 'text-[#00b76a] border-[#00b76a]/40'
                    : 'text-[#999] border-[#333]'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Section divider */}
      <div className="toss-section-divider" />

      {/* 상세 정보 - "라벨 ··· 값" 가로 리스트 */}
      <div className="px-5 py-5">
        <h3 className="text-[16px] font-bold text-white mb-1">상세 정보</h3>
        <div>
          {infoRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-[14px] border-b border-[#1a1a1a] last:border-0">
              <span className="text-[14px] text-[#666]">{row.label}</span>
              <span className={`text-[14px] font-semibold ${row.label === '주차' && row.value === '가능' ? 'text-[#3182f6]' : 'text-white'}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Link */}
      {linkUrl && (
        <>
          <div className="toss-section-divider" />
          <div className="px-5 py-5">
            <h3 className="text-[16px] font-bold text-white mb-3">링크</h3>
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-[#3182f6] underline break-all leading-[1.65]"
            >
              {linkUrl}
            </a>
          </div>
        </>
      )}

      {/* Memo */}
      {memoText && (
        <>
          <div className="toss-section-divider" />
          <div className="px-5 py-5">
            <h3 className="text-[16px] font-bold text-white mb-3">메모</h3>
            <p className="text-[14px] text-[#8b95a1] leading-[1.65] whitespace-pre-wrap">{memoText}</p>
          </div>
        </>
      )}

      {/* Photos */}
      <div className="toss-section-divider" />
      <div className="px-5 py-5">
        <PhotoUploader photos={photos} uploading={uploading} onUpload={uploadPhoto} onDelete={deletePhoto} />
      </div>

      {/* Reviews */}
      <div className="toss-section-divider" />
      <div className="px-5 py-5">
        <ReviewSection reviews={reviews} onSubmit={upsertReview} />
      </div>
    </div>
  )
}
