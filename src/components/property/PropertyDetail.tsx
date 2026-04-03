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
    return <div className="flex items-center justify-center p-8"><p className="text-text-secondary">로딩 중...</p></div>
  }

  if (!property) {
    return <div className="flex items-center justify-center p-8"><p className="text-text-secondary">매물을 찾을 수 없습니다.</p></div>
  }

  const priceDisplay = () => {
    if (property.price_type === '월세') return `월세 ${property.deposit ?? 0}/${property.monthly_rent ?? 0}만원`
    if (property.price_type === '전세') return `전세 ${property.deposit ?? property.price ?? 0}만원`
    return `매매 ${property.price ?? 0}만원`
  }

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-text-secondary min-h-[44px] px-2">← 뒤로</button>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/property/${id}/edit`)} className="text-primary text-sm font-medium min-h-[44px] px-2">수정</button>
          <button onClick={handleDelete} disabled={deleting} className="text-danger text-sm font-medium min-h-[44px] px-2">
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-text mb-1">{property.name}</h2>
        <p className="text-sm text-text-secondary mb-2">{property.address}</p>
        <p className="text-lg font-bold text-primary mb-2">{priceDisplay()}</p>
        <RatingStars value={property.rating} size="md" />
      </div>

      {property.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {property.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 bg-primary-light text-primary rounded-full">{tag}</span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        {property.size_pyeong && <InfoRow label="평수" value={`${property.size_pyeong}평`} />}
        {property.floor && <InfoRow label="층수" value={`${property.floor}층`} />}
        {property.rooms && <InfoRow label="방" value={`${property.rooms}개`} />}
        {property.bathrooms && <InfoRow label="화장실" value={`${property.bathrooms}개`} />}
        <InfoRow label="주차" value={property.parking ? '가능' : '불가'} />
        {property.maintenance_fee && <InfoRow label="관리비" value={`${property.maintenance_fee}만원`} />}
        {property.direction && <InfoRow label="방향" value={property.direction} />}
        {property.move_in_date && <InfoRow label="입주일" value={property.move_in_date} />}
      </div>

      {property.memo && (
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-1">메모</h3>
          <p className="text-sm text-text bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{property.memo}</p>
        </div>
      )}

      <PhotoUploader photos={photos} uploading={uploading} onUpload={uploadPhoto} onDelete={deletePhoto} />
      <ReviewSection reviews={reviews} onSubmit={upsertReview} />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium text-text">{value}</span>
    </div>
  )
}
