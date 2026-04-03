import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { usePhotos } from '../../hooks/usePhotos'
import { useReviews } from '../../hooks/useReviews'
import { RatingStars } from './RatingStars'
import { PhotoUploader } from './PhotoUploader'
import { ReviewSection } from './ReviewSection'
import type { Property } from '../../types'

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
      <div className="px-5 pt-4 space-y-4">
        <div className="h-6 w-24 skeleton" />
        <div className="h-8 w-48 skeleton" />
        <div className="h-5 w-64 skeleton" />
        <div className="h-7 w-40 skeleton" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center px-5 min-h-[60vh] animate-fade-in">
        <p className="text-[40px] mb-4">😢</p>
        <p className="text-[15px] text-text-secondary">매물을 찾을 수 없습니다.</p>
      </div>
    )
  }

  const priceDisplay = () => {
    if (property.price_type === '월세') return `${property.deposit ?? 0}/${property.monthly_rent ?? 0}만원`
    if (property.price_type === '전세') return `${property.deposit ?? property.price ?? 0}만원`
    return `${property.price ?? 0}만원`
  }

  return (
    <div className="animate-fade-in">
      {/* Top nav */}
      <div className="flex items-center justify-between px-2 py-1">
        <button onClick={() => navigate(-1)} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text active:text-text-secondary transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div className="flex">
          <button onClick={() => navigate(`/property/${id}/edit`)} className="min-h-[44px] px-3 text-[14px] text-primary font-semibold active:opacity-60 transition-opacity">
            수정
          </button>
          <button onClick={handleDelete} disabled={deleting} className="min-h-[44px] px-3 text-[14px] text-danger font-semibold active:opacity-60 transition-opacity">
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>

      {/* Main info */}
      <div className="px-5 pb-5">
        <h2 className="text-[22px] font-bold text-text mb-1 leading-tight">{property.name}</h2>
        <p className="text-[14px] text-text-secondary mb-4">{property.address}</p>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-[13px] font-semibold text-primary">{property.price_type}</span>
          <span className="text-[24px] font-bold text-text tracking-tight">{priceDisplay()}</span>
        </div>

        <RatingStars value={property.rating} size="md" />

        {property.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {property.tags.map((tag) => (
              <span key={tag} className="text-[12px] px-2.5 py-1 bg-primary-light text-primary font-medium rounded-md">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-2 bg-[#f2f4f6]" />

      {/* Detail info */}
      <div className="px-5 py-5">
        <h3 className="text-[16px] font-bold text-text mb-4">상세 정보</h3>
        <div className="space-y-0">
          {property.size_pyeong && <InfoRow label="평수" value={`${property.size_pyeong}평`} />}
          {property.floor && <InfoRow label="층수" value={`${property.floor}층`} />}
          {property.rooms && <InfoRow label="방" value={`${property.rooms}개`} />}
          {property.bathrooms && <InfoRow label="화장실" value={`${property.bathrooms}개`} />}
          <InfoRow label="주차" value={property.parking ? '가능' : '불가'} highlight={property.parking} />
          {property.maintenance_fee && <InfoRow label="관리비" value={`${property.maintenance_fee}만원`} />}
          {property.direction && <InfoRow label="방향" value={property.direction} />}
          {property.move_in_date && <InfoRow label="입주 가능일" value={property.move_in_date} />}
        </div>
      </div>

      {/* Memo */}
      {property.memo && (
        <>
          <div className="h-2 bg-[#f2f4f6]" />
          <div className="px-5 py-5">
            <h3 className="text-[16px] font-bold text-text mb-3">메모</h3>
            <p className="text-[14px] text-text-secondary leading-relaxed whitespace-pre-wrap">{property.memo}</p>
          </div>
        </>
      )}

      {/* Photos */}
      <div className="h-2 bg-[#f2f4f6]" />
      <div className="px-5 py-5">
        <PhotoUploader photos={photos} uploading={uploading} onUpload={uploadPhoto} onDelete={deletePhoto} />
      </div>

      {/* Reviews */}
      <div className="h-2 bg-[#f2f4f6]" />
      <div className="px-5 py-5">
        <ReviewSection reviews={reviews} onSubmit={upsertReview} />
      </div>
    </div>
  )
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-[#f2f4f6] last:border-0">
      <span className="text-[14px] text-text-secondary">{label}</span>
      <span className={`text-[14px] font-medium ${highlight ? 'text-primary' : 'text-text'}`}>{value}</span>
    </div>
  )
}
