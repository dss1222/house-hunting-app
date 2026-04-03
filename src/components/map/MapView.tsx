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
        <div style="padding:8px 12px;min-width:150px;font-size:13px;line-height:1.4;cursor:pointer" id="info-${p.id}">
          <strong style="font-size:14px">${p.name}</strong><br/>
          <span style="color:#2563eb;font-weight:bold">${p.price_type} ${priceText}만원</span><br/>
          <span style="color:#facc15">${stars}</span>
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
      <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <p className="text-danger mb-2">지도를 불러올 수 없습니다</p>
        <button onClick={() => window.location.reload()} className="text-primary text-sm min-h-[44px]">새로고침</button>
      </div>
    )
  }

  if (!isReady || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-text-secondary">지도 로딩 중...</p>
      </div>
    )
  }

  const propsWithCoords = properties.filter((p) => p.latitude && p.longitude)

  return (
    <div className="relative h-[calc(100dvh-112px)]">
      <div ref={mapRef} className="w-full h-full" />
      {propsWithCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
          <p className="bg-white px-4 py-2 rounded-lg shadow text-sm text-text-secondary">
            좌표가 등록된 매물이 없습니다
          </p>
        </div>
      )}
    </div>
  )
}
