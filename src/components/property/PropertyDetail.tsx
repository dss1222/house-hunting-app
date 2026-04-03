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
        <p className="text-[15px] text-text-secondary">매물을 찾을 수 없습니다</p>
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
    if (property.price_type === '월세') return `${property.deposit ?? 0}/${property.monthly_rent ?? 0}`
    if (property.price_type === '전세') return `${property.deposit ?? property.price ?? 0}`
    return `${property.price ?? 0}`
  }

  const infoRows: { label: string; value: string }[] = []
  if (property.size_pyeong) infoRows.push({ label: '평수', value: `${property.size_pyeong}평` })
  if (property.floor) infoRows.push({ label: '층수', value: `${property.floor}층` })
  if (property.rooms) infoRows.push({ label: '방 수', value: `${property.rooms}개` })
  if (property.bathrooms) infoRows.push({ label: '화장실', value: `${property.bathrooms}개` })
  infoRows.push({ label: '주차', value: property.parking ? '가능' : '불가' })
  if (property.maintenance_fee) infoRows.push({ label: '관리비', value: `월 ${property.maintenance_fee}만원` })
  if (property.direction) infoRows.push({ label: '방향', value: property.direction })
  if (property.move_in_date) infoRows.push({ label: '입주 가능일', value: property.move_in_date })

  return (
    <div className="animate-fade-in bg-white">
      {/* Nav */}
      <div className="flex items-center justify-between px-2 h-[48px]">
        <button onClick={() => navigate(-1)} className="w-[44px] h-[44px] flex items-center justify-center active:opacity-50 transition-opacity">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#191f28" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="flex">
          <button onClick={() => navigate(`/property/${id}/edit`)} className="h-[44px] px-4 text-[14px] text-[#3182f6] font-semibold active:opacity-50 transition-opacity">수정</button>
          <button onClick={handleDelete} disabled={deleting} className="h-[44px] px-4 text-[14px] text-[#f04452] font-semibold active:opacity-50 transition-opacity">
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>

      {/* Hero section - name, address, price */}
      <div className="px-5 pt-2 pb-7">
        <h2 className="text-[24px] font-bold text-text leading-tight mb-1">{property.name}</h2>
        <p className={`text-[14px] text-text-secondary ${property.latitude && property.longitude ? '' : 'mb-6'}`}>{property.address}</p>

        {property.latitude && property.longitude && (
          <div className="flex gap-2 mt-3 mb-6">
            {COMMUTE_DESTINATIONS.map((dest) => (
              <button
                key={dest.name}
                onClick={() => openDirections(dest)}
                className="text-[13px] text-[#3182f6] bg-[#e8f3ff] px-3 py-1.5 rounded-lg font-medium active:opacity-50 transition-opacity"
              >
                🚌 {dest.name} 길찾기
              </button>
            ))}
          </div>
        )}

        {/* Price - hero sized */}
        <div className="mb-1">
          <span className="text-[13px] font-semibold text-[#3182f6]">{property.price_type}</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-[32px] font-bold text-text tracking-tight leading-none">{priceDisplay()}</span>
          <span className="text-[16px] text-text-secondary font-medium">만원</span>
        </div>

        {/* Rating */}
        <div className="mt-5">
          <RatingStars value={property.rating} size="md" />
        </div>

        {/* Tags */}
        {property.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5">
            {property.tags.map((tag) => (
              <span key={tag} className="text-[13px] text-[#3182f6] bg-[#e8f3ff] px-3 py-1.5 rounded-lg font-medium">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="toss-section-divider" />

      {/* Detail info */}
      <div className="px-5 py-6">
        <h3 className="text-[18px] font-bold text-text mb-2">상세 정보</h3>
        <div>
          {infoRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-[14px] border-b border-[#f2f4f6] last:border-0">
              <span className="text-[15px] text-text-secondary">{row.label}</span>
              <span className={`text-[15px] font-medium ${row.label === '주차' && row.value === '가능' ? 'text-[#3182f6]' : 'text-text'}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Memo */}
      {property.memo && (
        <>
          <div className="toss-section-divider" />
          <div className="px-5 py-6">
            <h3 className="text-[18px] font-bold text-text mb-3">메모</h3>
            <p className="text-[15px] text-text-secondary leading-[1.65] whitespace-pre-wrap">{property.memo}</p>
          </div>
        </>
      )}

      {/* Photos */}
      <div className="toss-section-divider" />
      <div className="px-5 py-6">
        <PhotoUploader photos={photos} uploading={uploading} onUpload={uploadPhoto} onDelete={deletePhoto} />
      </div>

      {/* Reviews */}
      <div className="toss-section-divider" />
      <div className="px-5 py-6">
        <ReviewSection reviews={reviews} onSubmit={upsertReview} />
      </div>
    </div>
  )
}
