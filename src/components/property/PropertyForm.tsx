import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useProperties } from '../../hooks/useProperties'
import { PRICE_TYPES, DIRECTIONS, EMPTY_PROPERTY_FORM } from '../../lib/constants'
import { RatingStars } from './RatingStars'
import { TagSelector } from './TagSelector'
import type { PropertyFormData } from '../../types'
import { supabase } from '../../lib/supabase'

export function PropertyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createProperty, updateProperty } = useProperties()
  const [form, setForm] = useState(EMPTY_PROPERTY_FORM)
  const [saving, setSaving] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [showImport, setShowImport] = useState(true)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      const data: PropertyFormData = {
        ...form,
        direction: form.direction || null,
        move_in_date: form.move_in_date || null,
        memo: form.memo || null,
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
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold">{isEdit ? '매물 수정' : '새 매물 등록'}</h2>
        <button type="button" onClick={() => navigate(-1)} className="text-text-secondary min-h-[44px] px-2">
          취소
        </button>
      </div>

      {/* 네이버 링크 저장 */}
      {!isEdit && showImport && (
        <section className="bg-primary-light rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-semibold text-primary">네이버 부동산 링크 저장</h3>
          <p className="text-xs text-text-secondary">공유 링크를 붙여넣으면 메모에 저장됩니다</p>
          <div className="flex gap-2">
            <input
              placeholder="네이버 부동산 링크 붙여넣기"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-lg text-sm min-h-[44px] bg-white"
            />
            <button
              type="button"
              disabled={!pasteText.trim()}
              onClick={() => {
                set('memo', pasteText.trim())
                setShowImport(false)
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium min-h-[44px] disabled:opacity-50 whitespace-nowrap"
            >
              저장
            </button>
          </div>
        </section>
      )}

      {/* 기본 정보 */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-text-secondary">기본 정보</h3>
        <input
          required
          placeholder="매물 이름 *"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          className="w-full px-3 py-3 border border-border rounded-lg min-h-[44px]"
        />
        <input
          required
          placeholder="주소 *"
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
          className="w-full px-3 py-3 border border-border rounded-lg min-h-[44px]"
        />
        <select
          value={form.price_type}
          onChange={(e) => set('price_type', e.target.value as typeof form.price_type)}
          className="w-full px-3 py-3 border border-border rounded-lg min-h-[44px] bg-white"
        >
          {PRICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {form.price_type === '매매' && (
          <input
            type="number"
            placeholder="매매가 (만원)"
            value={form.price ?? ''}
            onChange={(e) => set('price', numOrNull(e.target.value))}
            className="w-full px-3 py-3 border border-border rounded-lg min-h-[44px]"
          />
        )}
        {form.price_type === '전세' && (
          <input
            type="number"
            placeholder="전세금 (만원)"
            value={form.deposit ?? ''}
            onChange={(e) => set('deposit', numOrNull(e.target.value))}
            className="w-full px-3 py-3 border border-border rounded-lg min-h-[44px]"
          />
        )}
        {form.price_type === '월세' && (
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="보증금 (만원)"
              value={form.deposit ?? ''}
              onChange={(e) => set('deposit', numOrNull(e.target.value))}
              className="flex-1 px-3 py-3 border border-border rounded-lg min-h-[44px]"
            />
            <input
              type="number"
              placeholder="월세 (만원)"
              value={form.monthly_rent ?? ''}
              onChange={(e) => set('monthly_rent', numOrNull(e.target.value))}
              className="flex-1 px-3 py-3 border border-border rounded-lg min-h-[44px]"
            />
          </div>
        )}
        <input
          type="number"
          placeholder="평수"
          value={form.size_pyeong ?? ''}
          onChange={(e) => set('size_pyeong', numOrNull(e.target.value))}
          className="w-full px-3 py-3 border border-border rounded-lg min-h-[44px]"
        />
        <textarea
          placeholder="메모"
          value={form.memo}
          onChange={(e) => set('memo', e.target.value)}
          rows={3}
          className="w-full px-3 py-3 border border-border rounded-lg resize-none"
        />
      </section>

      {/* 상세 정보 */}
      <section>
        <button
          type="button"
          onClick={() => setShowDetail(!showDetail)}
          className="flex items-center justify-between w-full py-2 text-sm font-semibold text-text-secondary min-h-[44px]"
        >
          <span>상세 정보</span>
          <span>{showDetail ? '▲' : '▼'}</span>
        </button>
        {showDetail && (
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="층수" value={form.floor ?? ''} onChange={(e) => set('floor', numOrNull(e.target.value))} className="px-3 py-3 border border-border rounded-lg min-h-[44px]" />
              <input type="number" placeholder="방 수" value={form.rooms ?? ''} onChange={(e) => set('rooms', numOrNull(e.target.value))} className="px-3 py-3 border border-border rounded-lg min-h-[44px]" />
              <input type="number" placeholder="화장실 수" value={form.bathrooms ?? ''} onChange={(e) => set('bathrooms', numOrNull(e.target.value))} className="px-3 py-3 border border-border rounded-lg min-h-[44px]" />
              <input type="number" placeholder="관리비 (만원)" value={form.maintenance_fee ?? ''} onChange={(e) => set('maintenance_fee', numOrNull(e.target.value))} className="px-3 py-3 border border-border rounded-lg min-h-[44px]" />
            </div>
            <select value={form.direction} onChange={(e) => set('direction', e.target.value)} className="w-full px-3 py-3 border border-border rounded-lg min-h-[44px] bg-white">
              <option value="">방향 선택</option>
              {DIRECTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="date" placeholder="입주 가능일" value={form.move_in_date} onChange={(e) => set('move_in_date', e.target.value)} className="w-full px-3 py-3 border border-border rounded-lg min-h-[44px]" />
            <label className="flex items-center gap-2 min-h-[44px]">
              <input type="checkbox" checked={form.parking} onChange={(e) => set('parking', e.target.checked)} className="w-5 h-5 rounded" />
              <span>주차 가능</span>
            </label>
          </div>
        )}
      </section>

      {/* 평가 */}
      <section>
        <button
          type="button"
          onClick={() => setShowRating(!showRating)}
          className="flex items-center justify-between w-full py-2 text-sm font-semibold text-text-secondary min-h-[44px]"
        >
          <span>평가</span>
          <span>{showRating ? '▲' : '▼'}</span>
        </button>
        {showRating && (
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-sm text-text-secondary mb-1 block">별점</label>
              <RatingStars value={form.rating} onChange={(v) => set('rating', v)} />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1 block">태그</label>
              <TagSelector selected={form.tags} onChange={(t) => set('tags', t)} />
            </div>
          </div>
        )}
      </section>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 bg-primary text-white rounded-xl text-base font-semibold min-h-[44px] disabled:opacity-50"
      >
        {saving ? '저장 중...' : isEdit ? '수정 완료' : '등록하기'}
      </button>
    </form>
  )
}
