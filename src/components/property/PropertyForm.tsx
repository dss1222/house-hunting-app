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

  const inputCls = 'w-full h-[52px] px-4 bg-[#1a1a1a] rounded-2xl text-[15px] text-white placeholder:text-[#4e5968] border-2 border-[#222] focus:border-[#3182f6] transition-all'
  const labelCls = 'text-[13px] font-semibold text-[#8b95a1] block mb-2'

  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Header */}
      <div className="flex items-center justify-between px-2 h-[56px] border-b border-[#222] sticky top-0 bg-[#000000] z-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center active:opacity-50 transition-opacity"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h2 className="text-[18px] font-bold text-white">{isEdit ? '매물 수정' : '새 매물 등록'}</h2>
        <div className="w-[44px]" />
      </div>

      <form onSubmit={handleSubmit} className="px-5 pt-8 pb-[140px]" style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {/* 매물명 */}
        <div>
          <label className={labelCls}>매물명 *</label>
          <input
            required
            placeholder="예: 논현 래미안 101동 1201호"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className={inputCls}
          />
        </div>

        {/* 가격 유형 */}
        <div>
          <label className={labelCls}>거래 유형</label>
          <div className="flex gap-2">
            {PRICE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set('price_type', t)}
                className={`flex-1 h-[48px] rounded-2xl text-[14px] font-semibold transition-colors ${
                  form.price_type === t
                    ? 'bg-[#3182f6] text-white'
                    : 'bg-[#1a1a1a] border border-[#222] text-[#8b95a1]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 가격 입력 (별도 섹션) */}
        <div>
          {form.price_type === '매매' && (
            <>
              <label className={labelCls}>매매가 (억)</label>
              <input
                placeholder="예: 9.5 (=9억 5천)"
                value={form.price ? (form.price / 10000).toString() : ''}
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  set('price', isNaN(v) ? null : Math.round(v * 10000))
                }}
                className={inputCls}
                inputMode="decimal"
              />
              {form.price != null && <p className="text-[12px] text-[#3182f6] font-medium mt-2">{(form.price / 10000).toFixed(1)}억 ({form.price.toLocaleString()}만원)</p>}
            </>
          )}
          {form.price_type === '전세' && (
            <>
              <label className={labelCls}>전세금 (억)</label>
              <input
                placeholder="예: 3.5 (=3억 5천)"
                value={form.deposit ? (form.deposit / 10000).toString() : ''}
                onChange={(e) => {
                  const v = parseFloat(e.target.value)
                  set('deposit', isNaN(v) ? null : Math.round(v * 10000))
                }}
                className={inputCls}
                inputMode="decimal"
              />
              {form.deposit != null && <p className="text-[12px] text-[#3182f6] font-medium mt-2">{(form.deposit / 10000).toFixed(1)}억 ({form.deposit.toLocaleString()}만원)</p>}
            </>
          )}
          {form.price_type === '월세' && (
            <>
              <label className={labelCls}>보증금 (억) / 월세 (만원)</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    placeholder="보증금 (억)"
                    value={form.deposit ? (form.deposit / 10000).toString() : ''}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value)
                      set('deposit', isNaN(v) ? null : Math.round(v * 10000))
                    }}
                    className={inputCls}
                    inputMode="decimal"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="월세 (만원)"
                    value={form.monthly_rent ?? ''}
                    onChange={(e) => set('monthly_rent', numOrNull(e.target.value))}
                    className={inputCls}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* 전용면적 + 층수 */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelCls}>전용면적</label>
            <input
              placeholder="예: 84/59"
              value={sizeInput}
              onChange={(e) => {
                setSizeInput(e.target.value)
                const parsed = parseSizeInput(e.target.value)
                set('size_pyeong', parsed)
              }}
              className={inputCls}
            />
            {form.size_pyeong != null && (
              <p className="text-[12px] text-[#3182f6] font-medium mt-1.5">{form.size_pyeong}평</p>
            )}
          </div>
          <div className="flex-1">
            <label className={labelCls}>층수</label>
            <input
              placeholder="예: 5/12"
              value={floorInput}
              onChange={(e) => {
                setFloorInput(e.target.value)
                set('floor', parseFloorInput(e.target.value))
              }}
              className={inputCls}
            />
            {form.floor != null && (
              <p className="text-[12px] text-[#3182f6] font-medium mt-1.5">{form.floor}층</p>
            )}
          </div>
        </div>

        {/* 방향 */}
        <div>
          <label className={labelCls}>방향</label>
          <div className="flex flex-wrap gap-2">
            {DIRECTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => set('direction', form.direction === d ? '' : d)}
                className={`h-[44px] px-4 rounded-2xl text-[14px] font-medium transition-colors ${
                  form.direction === d
                    ? 'bg-[#3182f6] text-white'
                    : 'bg-[#1a1a1a] border border-[#222] text-[#8b95a1]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* 방수 + 욕실수 */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelCls}>방 수</label>
            <input
              type="number"
              placeholder="2"
              min="0"
              value={form.rooms ?? ''}
              onChange={(e) => set('rooms', numOrNull(e.target.value))}
              className={inputCls}
            />
          </div>
          <div className="flex-1">
            <label className={labelCls}>욕실 수</label>
            <input
              type="number"
              placeholder="1"
              min="0"
              value={form.bathrooms ?? ''}
              onChange={(e) => set('bathrooms', numOrNull(e.target.value))}
              className={inputCls}
            />
          </div>
        </div>

        {/* 풀옵션 + 주차 토글 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFullOption(!fullOption)}
            className={`flex-1 flex items-center justify-between px-4 h-[52px] rounded-2xl transition-colors ${
              fullOption ? 'bg-[#0d2e20] border border-[#00b76a]/30' : 'bg-[#1a1a1a] border border-[#222]'
            }`}
          >
            <span className={`text-[15px] font-semibold ${fullOption ? 'text-[#00b76a]' : 'text-[#8b95a1]'}`}>풀옵션</span>
            <div className={`w-11 h-6 rounded-full transition-colors relative ${fullOption ? 'bg-[#00b76a]' : 'bg-[#4e5968]'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${fullOption ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </button>
          <button
            type="button"
            onClick={() => set('parking', !form.parking)}
            className={`flex-1 flex items-center justify-between px-4 h-[52px] rounded-2xl transition-colors ${
              form.parking ? 'bg-[#1a3a5c] border border-[#3182f6]/30' : 'bg-[#1a1a1a] border border-[#222]'
            }`}
          >
            <span className={`text-[15px] font-semibold ${form.parking ? 'text-[#3182f6]' : 'text-[#8b95a1]'}`}>주차</span>
            <div className={`w-11 h-6 rounded-full transition-colors relative ${form.parking ? 'bg-[#3182f6]' : 'bg-[#4e5968]'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.parking ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </button>
        </div>

        {/* 주소 */}
        <div>
          <label className={labelCls}>주소</label>
          <div className="flex gap-2">
            <input
              placeholder="서울시 강남구 논현동..."
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              onBlur={handleGeocode}
              className="flex-1 h-[52px] px-4 bg-[#1a1a1a] rounded-2xl text-[15px] text-white placeholder:text-[#4e5968] border-2 border-[#222] focus:border-[#3182f6] transition-all"
            />
            <button
              type="button"
              onClick={handleGeocode}
              disabled={geocoding || !form.address.trim()}
              className="h-[52px] px-4 bg-[#1a1a1a] border-2 border-[#222] text-[#8b95a1] rounded-2xl text-[14px] font-medium disabled:opacity-40 whitespace-nowrap active:opacity-60 transition-opacity"
            >
              {geocoding ? '검색중...' : '검색'}
            </button>
          </div>
          {form.latitude && form.longitude && (
            <p className="text-[12px] text-[#00b76a] font-medium mt-1.5">위치 확인됨 ({form.latitude.toFixed(4)}, {form.longitude.toFixed(4)})</p>
          )}
        </div>

        {/* 관리비 */}
        <div>
          <label className={labelCls}>관리비 (만원/월)</label>
          <input
            type="number"
            placeholder="예: 15"
            min="0"
            value={form.maintenance_fee ?? ''}
            onChange={(e) => set('maintenance_fee', numOrNull(e.target.value))}
            className={inputCls}
          />
        </div>

        {/* 입주 가능일 */}
        <div>
          <label className={labelCls}>입주 가능일</label>
          <input
            type="text"
            placeholder="예: 2025-03-01 또는 즉시입주"
            value={form.move_in_date ?? ''}
            onChange={(e) => set('move_in_date', e.target.value)}
            className={inputCls}
          />
        </div>

        {/* 링크 */}
        <div>
          <label className={labelCls}>링크 (네이버 부동산 등)</label>
          <input
            type="url"
            placeholder="https://..."
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            className={inputCls}
          />
        </div>

        {/* 메모 */}
        <div>
          <label className={labelCls}>메모</label>
          <textarea
            placeholder="특이사항, 느낀점 등 자유롭게 작성하세요"
            value={form.memo}
            onChange={(e) => set('memo', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-[#1a1a1a] rounded-2xl text-[15px] text-white placeholder:text-[#4e5968] border-2 border-[#222] focus:border-[#3182f6] transition-all resize-none leading-relaxed"
          />
        </div>

        {/* 별점 */}
        <div>
          <label className={labelCls}>별점</label>
          <RatingStars value={form.rating} onChange={(v) => set('rating', v)} />
        </div>
      </form>

      {/* 저장 버튼 - 하단 고정 */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pt-3 bg-[#000000] border-t border-[#222] z-20" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="w-full h-[52px] bg-[#3182f6] text-white rounded-2xl text-[16px] font-bold disabled:bg-[#4e5968] active:scale-[0.97] active:opacity-85 transition-all"
        >
          {saving ? '저장 중...' : isEdit ? '수정 완료' : '등록하기'}
        </button>
      </div>
    </div>
  )
}
