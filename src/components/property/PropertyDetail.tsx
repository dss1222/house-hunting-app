import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { usePhotos } from '../../hooks/usePhotos'
import { useReviews } from '../../hooks/useReviews'
import { RatingStars } from './RatingStars'
import { PhotoUploader } from './PhotoUploader'
import { ReviewSection } from './ReviewSection'
import type { Property } from '../../types'

function priceTypeBadgeColor(type: string) {
  if (type === '월세') return 'bg-warning-light text-warning'
  if (type === '전세') return 'bg-success-light text-success'
  return 'bg-primary-light text-primary'
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
      <div className="p-4 space-y-4">
        <div className="h-8 w-32 skeleton rounded-lg" />
        <div className="h-6 w-48 skeleton rounded-lg" />
        <div className="h-10 w-40 skeleton rounded-lg" />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-12 skeleton rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[60vh] animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-danger-light flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-danger"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
        </div>
        <p className="text-text-secondary">매물을 찾을 수 없습니다.</p>
      </div>
    )
  }

  const priceDisplay = () => {
    if (property.price_type === '월세') return `${property.deposit ?? 0}/${property.monthly_rent ?? 0}만원`
    if (property.price_type === '전세') return `${property.deposit ?? property.price ?? 0}만원`
    return `${property.price ?? 0}만원`
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Navigation bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-text-secondary min-h-[44px] px-1 active:text-text transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          <span className="text-sm">뒤로</span>
        </button>
        <div className="flex gap-1">
          <button onClick={() => navigate(`/property/${id}/edit`)} className="flex items-center gap-1 text-primary text-sm font-medium min-h-[44px] px-3 rounded-xl active:bg-primary-light transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            수정
          </button>
          <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1 text-danger text-sm font-medium min-h-[44px] px-3 rounded-xl active:bg-danger-light transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            {deleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-card rounded-2xl p-5 shadow-[var(--shadow-card)] border border-border/50">
        <h2 className="text-xl font-bold text-text mb-1 leading-snug">{property.name}</h2>
        <p className="text-sm text-text-secondary mb-3 flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {property.address}
        </p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${priceTypeBadgeColor(property.price_type)}`}>
            {property.price_type}
          </span>
          <span className="text-xl font-bold text-text">{priceDisplay()}</span>
        </div>
        <RatingStars value={property.rating} size="md" />

        {property.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/50">
            {property.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 bg-primary-light text-primary font-medium rounded-lg">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Info grid */}
      <div className="bg-card rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border/50">
        <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">상세 정보</h3>
        <div className="grid grid-cols-2 gap-2">
          {property.size_pyeong && <InfoRow icon="area" label="평수" value={`${property.size_pyeong}평`} />}
          {property.floor && <InfoRow icon="floor" label="층수" value={`${property.floor}층`} />}
          {property.rooms && <InfoRow icon="room" label="방" value={`${property.rooms}개`} />}
          {property.bathrooms && <InfoRow icon="bath" label="화장실" value={`${property.bathrooms}개`} />}
          <InfoRow icon="car" label="주차" value={property.parking ? '가능' : '불가'} highlight={property.parking} />
          {property.maintenance_fee && <InfoRow icon="fee" label="관리비" value={`${property.maintenance_fee}만원`} />}
          {property.direction && <InfoRow icon="compass" label="방향" value={property.direction} />}
          {property.move_in_date && <InfoRow icon="calendar" label="입주일" value={property.move_in_date} />}
        </div>
      </div>

      {/* Memo */}
      {property.memo && (
        <div className="bg-card rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border/50">
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">메모</h3>
          <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">{property.memo}</p>
        </div>
      )}

      {/* Photos */}
      <div className="bg-card rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border/50">
        <PhotoUploader photos={photos} uploading={uploading} onUpload={uploadPhoto} onDelete={deletePhoto} />
      </div>

      {/* Reviews */}
      <div className="bg-card rounded-2xl p-4 shadow-[var(--shadow-card)] border border-border/50">
        <ReviewSection reviews={reviews} onSubmit={upsertReview} />
      </div>
    </div>
  )
}

const iconMap: Record<string, React.ReactNode> = {
  area: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>,
  floor: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 20h20M6 16v4M10 12v8M14 8v12M18 4v16"/></svg>,
  room: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
  bath: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1zM6 12V5a2 2 0 012-2h0a2 2 0 012 2v1"/></svg>,
  car: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-1M7 16h.01M7 19a2 2 0 100-4 2 2 0 000 4z"/></svg>,
  fee: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  compass: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></svg>,
  calendar: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
}

function InfoRow({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${highlight ? 'bg-success-light' : 'bg-bg'}`}>
      <span className={highlight ? 'text-success' : 'text-text-tertiary'}>{iconMap[icon]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-text-tertiary leading-none mb-0.5">{label}</p>
        <p className={`text-sm font-medium leading-snug ${highlight ? 'text-success' : 'text-text'}`}>{value}</p>
      </div>
    </div>
  )
}
