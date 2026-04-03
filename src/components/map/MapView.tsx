import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKakaoMap } from '../../hooks/useKakaoMap'
import { useProperties } from '../../hooks/useProperties'

export function MapView() {
  const { isReady, error } = useKakaoMap()
  const { properties, loading } = useProperties()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isReady || !mapRef.current) return

    const center = new window.kakao.maps.LatLng(37.5665, 126.978)
    const map = new window.kakao.maps.Map(mapRef.current, { center, level: 8 })
    mapInstanceRef.current = map

    return () => { mapInstanceRef.current = null }
  }, [isReady])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !isReady) return

    const propsWithCoords = properties.filter((p) => p.latitude && p.longitude)
    if (propsWithCoords.length === 0) return

    const bounds = new window.kakao.maps.LatLngBounds()
    let openInfoWindow: kakao.maps.InfoWindow | null = null

    propsWithCoords.forEach((p) => {
      const position = new window.kakao.maps.LatLng(p.latitude!, p.longitude!)
      bounds.extend(position)

      const marker = new window.kakao.maps.Marker({ map, position })

      const priceText = p.price_type === '월세'
        ? `${p.deposit ?? 0}/${p.monthly_rent ?? 0}`
        : p.price_type === '전세'
          ? `${p.deposit ?? p.price ?? 0}`
          : `${p.price ?? 0}`

      const stars = '★'.repeat(Math.round(p.rating))

      const infoContent = `
        <div style="padding:12px 16px;min-width:160px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;cursor:pointer;line-height:1.5" id="info-${p.id}">
          <div style="font-size:15px;font-weight:700;color:#191f28;margin-bottom:2px">${p.name}</div>
          <div style="font-size:13px;color:#3182f6;font-weight:700">${p.price_type} ${priceText}만원</div>
          ${stars ? `<div style="font-size:12px;color:#ffb800;margin-top:2px">${stars}</div>` : ''}
        </div>
      `

      const infoWindow = new window.kakao.maps.InfoWindow({ content: infoContent })

      window.kakao.maps.event.addListener(marker, 'click', () => {
        if (openInfoWindow) openInfoWindow.close()
        infoWindow.open(map, marker)
        openInfoWindow = infoWindow

        setTimeout(() => {
          const el = document.getElementById(`info-${p.id}`)
          if (el) {
            el.addEventListener('click', () => navigate(`/property/${p.id}`))
          }
        }, 0)
      })
    })

    if (propsWithCoords.length > 0) {
      map.setBounds(bounds)
    }
  }, [properties, isReady, navigate])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-5 text-center min-h-[60vh] animate-fade-in">
        <p className="text-[40px] mb-4">😢</p>
        <p className="text-[15px] text-text-secondary mb-6">지도를 불러올 수 없습니다</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary text-white rounded-2xl text-[14px] font-semibold min-h-[48px] active:bg-primary-dark transition-colors">새로고침</button>
      </div>
    )
  }

  if (!isReady || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 animate-fade-in">
        <div className="w-8 h-8 border-2 border-[#f2f4f6] border-t-primary rounded-full animate-spin" />
        <p className="text-[14px] text-text-tertiary">지도 로딩 중...</p>
      </div>
    )
  }

  const propsWithCoords = properties.filter((p) => p.latitude && p.longitude)

  return (
    <div className="relative h-[calc(100dvh-128px)]">
      <div ref={mapRef} className="w-full h-full" />
      {propsWithCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-card px-5 py-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center gap-2">
            <p className="text-[14px] text-text-secondary">좌표가 등록된 매물이 없습니다</p>
          </div>
        </div>
      )}
    </div>
  )
}
