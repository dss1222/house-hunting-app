import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useProperties } from '../../hooks/useProperties'
import { PRICE_TYPES, DIRECTIONS, EMPTY_PROPERTY_FORM } from '../../lib/constants'
import { RatingStars } from './RatingStars'
import type { PropertyFormData } from '../../types'
import { supabase } from '../../lib/supabase'
import { geocodeAddress } from '../../hooks/useKakaoMap'

// 전용면적(㎡) → 평수 변환
function sqmToPyeong(sqm: number): number {
  return Math.round((sqm / 3.3058) * 10) / 10
}

// "공급/전용" 형태 파싱 → 전용면적 평수 반환
function parseSizeInput(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const parts = trimmed.split('/')
  const targetStr = parts.length >= 2 ? parts[1]! : parts[0]!
  const n = parseFloat(targetStr)
  if (isNaN(n)) return null
  // 숫자가 크면 ㎡으로 간주 (30 이상이면 ㎡)
  return n >= 30 ? sqmToPyeong(n) : n
}

// "현재층/총층" 형태 파싱 → 현재층 반환
function parseFloorInput(input: string): number | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  const parts = trimmed.split('/')
  const n = parseInt(parts[0]!, 10)
  return isNaN(n) ? null : n
}

export function PropertyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createProperty, updateProperty } = useProperties()
  const [form, setForm] = useState(EMPTY_PROPERTY_FORM)
  const [saving, setSaving] = useState(false)
  const [geocoding, setGeocoding] = useState(false)

  // UI 전용 입력값 (저장 전 텍스트 형태)
  const [sizeInput, setSizeInput] = useState('')
  const [floorInput, setFloorInput] = useState('')
  const [linkInput, setLinkInput] = useState('')
  const [fullOption, setFullOption] = useState(false)

  const isEdit = !!id

  useEffect(() => {
    if (id) {
      supabase.from('properties').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          setForm({
            name: data.name,
            address: data.address,
            price_type: data.price_type,
            price: data.price,
            monthly_rent: data.monthly_rent,
            deposit: data.deposit,
            size_pyeong: data.size_pyeong,
            floor: data.floor,
            rooms: data.rooms,
            bathrooms: data.bathrooms,
            parking: data.parking,
            maintenance_fee: data.maintenance_fee,
            direction: data.direction ?? '',
            move_in_date: data.move_in_date ?? '',
            rating: data.rating ?? 0,
            memo: data.memo ?? '',
            latitude: data.latitude,
            longitude: data.longitude,
            tags: data.tags ?? [],
          })
          if (data.size_pyeong) setSizeInput(String(data.size_pyeong))
          if (data.floor) setFloorInput(String(data.floor))

          const tags: string[] = data.tags ?? []
          setFullOption(tags.includes('풀옵션'))

          // 메모에서 링크 분리 (http로 시작하는 첫 줄)
          const memo: string = data.memo ?? ''
          const lines = memo.split('\n')
          const linkLine = lines.find((l) => l.startsWith('http'))
          if (linkLine) {
            setLinkInput(linkLine)
            const remaining = lines.filter((l) => l !== linkLine).join('\n').trim()
            setForm((prev) => ({ ...prev, memo: remaining }))
          }
        }
      })
    }
  }, [id])

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const numOrNull = (v: string): number | null => {
    const n = Number(v)
    return v === '' || isNaN(n) ? null : n
  }

  const handleGeocode = async () => {
    if (!form.address.trim()) return
    setGeocoding(true)
    try {
      const result = await geocodeAddress(form.address)
      if (result) {
        setForm((prev) => ({ ...prev, latitude: result.lat, longitude: result.lng }))
      } else {
        alert('주소를 찾을 수 없습니다. 더 자세한 주소를 입력해 주세요.')
      }
    } catch {
      // geocoding 실패는 무시
    } finally {
      setGeocoding(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      // 태그 처리
      const tags = form.tags.filter((t) => t !== '풀옵션')
      if (fullOption) tags.push('풀옵션')

      // 메모 + 링크 합치기
      const memoParts: string[] = []
      if (linkInput.trim()) memoParts.push(linkInput.trim())
      if (form.memo.trim()) memoParts.push(form.memo.trim())
      const combinedMemo = memoParts.join('\n') || null

      const data: PropertyFormData = {
        ...form,
        tags,
        direction: form.direction || null,
        move_in_date: form.move_in_date || null,
        memo: combinedMemo,
      }
      if (isEdit) {
        await updateProperty(id, data)
      } else {
        await createProperty(data, user.id)
      }
      navigate(-1)
    } catch (err) {
      alert('저장에 실패했습니다. 다시 시도해주세요.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[56px] border-b border-gray-100 sticky top-0 bg-white z-10">
        <button type="button" onClick={() => navigate(-1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <h2 className="text-[17px] font-bold text-gray-900">{isEdit ? '매물 수정' : '새 매물 등록'}</h2>
        <div className="min-w-[44px]" />
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5 pb-24">
        {/* 매물명 */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-500">매물명 *</label>
          <input
            required
            placeholder="예: 논현 래미안 101동 1201호"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] min-h-[48px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* 가격 유형 + 가격 */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-500">가격</label>
          <div className="flex gap-2 mb-2">
            {PRICE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set('price_type', t)}
                className={`flex-1 py-2.5 rounded-xl text-[14px] font-semibold border transition-colors min-h-[44px] ${
                  form.price_type === t
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {form.price_type === '매매' && (
            <input
              type="number"
              placeholder="매매가 (만원)"
              value={form.price ?? ''}
              onChange={(e) => set('price', numOrNull(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] min-h-[48px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          )}
          {form.price_type === '전세' && (
            <input
              type="number"
              placeholder="전세금 (만원)"
              value={form.deposit ?? ''}
              onChange={(e) => set('deposit', numOrNull(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] min-h-[48px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          )}
          {form.price_type === '월세' && (
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="보증금 (만원)"
                value={form.deposit ?? ''}
                onChange={(e) => set('deposit', numOrNull(e.target.value))}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-[15px] min-h-[48px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="월세 (만원)"
                value={form.monthly_rent ?? ''}
                onChange={(e) => set('monthly_rent', numOrNull(e.target.value))}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-[15px] min-h-[48px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* 전용면적 + 층수 */}
        <div className="flex gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-500">전용면적</label>
            <input
              placeholder="예: 84/59"
              value={sizeInput}
              onChange={(e) => {
                setSizeInput(e.target.value)
                const parsed = parseSizeInput(e.target.value)
                set('size_pyeong', parsed)
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] min-h-[48px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {form.size_pyeong != null && (
              <p className="text-[12px] text-blue-500 font-medium">{form.size_pyeong}평</p>
            )}
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-500">층수</label>
            <input
              placeholder="예: 5/12"
              value={floorInput}
              onChange={(e) => {
                setFloorInput(e.target.value)
                set('floor', parseFloorInput(e.target.value))
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] min-h-[48px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {form.floor != null && (
              <p className="text-[12px] text-blue-500 font-medium">{form.floor}층</p>
            )}
          </div>
        </div>

        {/* 방향 */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-500">방향</label>
          <div className="flex flex-wrap gap-2">
            {DIRECTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => set('direction', form.direction === d ? '' : d)}
                className={`px-4 py-2 rounded-xl text-[14px] font-medium border transition-colors min-h-[44px] ${
                  form.direction === d
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* 방수 + 욕실수 */}
        <div className="flex gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-500">방 수</label>
            <input
              type="number"
              placeholder="2"
              min="0"
              value={form.rooms ?? ''}
              onChange={(e) => set('rooms', numOrNull(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] min-h-[48px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-[13px] font-semibold text-gray-500">욕실 수</label>
            <input
              type="number"
              placeholder="1"
              min="0"
              value={form.bathrooms ?? ''}
              onChange={(e) => set('bathrooms', numOrNull(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] min-h-[48px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 풀옵션 + 주차 토글 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFullOption(!fullOption)}
            className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border transition-colors min-h-[48px] ${
              fullOption ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200'
            }`}
          >
            <span className={`text-[15px] font-medium ${fullOption ? 'text-blue-600' : 'text-gray-700'}`}>풀옵션</span>
            <div className={`w-11 h-6 rounded-full transition-colors relative ${fullOption ? 'bg-blue-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${fullOption ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </button>
          <button
            type="button"
            onClick={() => set('parking', !form.parking)}
            className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border transition-colors min-h-[48px] ${
              form.parking ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200'
            }`}
          >
            <span className={`text-[15px] font-medium ${form.parking ? 'text-blue-600' : 'text-gray-700'}`}>주차</span>
            <div className={`w-11 h-6 rounded-full transition-colors relative ${form.parking ? 'bg-blue-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.parking ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </button>
        </div>

        {/* 주소 */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-500">주소</label>
          <div className="flex gap-2">
            <input
              placeholder="서울시 강남구 논현동..."
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              onBlur={handleGeocode}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-[15px] min-h-[48px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleGeocode}
              disabled={geocoding || !form.address.trim()}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl text-[14px] font-medium min-h-[48px] disabled:opacity-40 whitespace-nowrap"
            >
              {geocoding ? '검색중...' : '검색'}
            </button>
          </div>
          {form.latitude && form.longitude && (
            <p className="text-[12px] text-green-600 font-medium">위치 확인됨 ({form.latitude.toFixed(4)}, {form.longitude.toFixed(4)})</p>
          )}
        </div>

        {/* 링크 */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-500">링크 (네이버 부동산 등)</label>
          <input
            type="url"
            placeholder="https://..."
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] min-h-[48px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* 메모 */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-500">메모</label>
          <textarea
            placeholder="특이사항, 느낀점 등 자유롭게 작성하세요"
            value={form.memo}
            onChange={(e) => set('memo', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[15px] resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* 별점 */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-500">별점</label>
          <RatingStars value={form.rating} onChange={(v) => set('rating', v)} />
        </div>
      </form>

      {/* 저장 버튼 - 하단 고정 */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-white border-t border-gray-100">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-4 bg-blue-500 text-white rounded-2xl text-[16px] font-bold min-h-[52px] disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {saving ? '저장 중...' : isEdit ? '수정 완료' : '등록하기'}
        </button>
      </div>
    </div>
  )
}
