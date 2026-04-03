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

      const infoContent = `
        <div style="padding:14px 18px;min-width:170px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;cursor:pointer;line-height:1.6;background:#212127;border-radius:16px;border:1px solid #2c2c35" id="info-${p.id}">
          <div style="font-size:16px;font-weight:700;color:#fff;letter-spacing:-0.02em">${p.name}</div>
          <div style="font-size:14px;color:#3182f6;font-weight:700;margin-top:4px">${p.price_type} ${priceText}만원</div>
          ${p.rating ? `<div style="font-size:12px;color:#ffb800;margin-top:2px">${'★'.repeat(Math.round(p.rating))}</div>` : ''}
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
        <p className="text-[48px] mb-4">😢</p>
        <p className="text-[15px] text-[#8b95a1] mb-6">지도를 불러올 수 없습니다</p>
        <button onClick={() => window.location.reload()} className="toss-btn h-[48px] px-6 bg-[#3182f6] text-white rounded-2xl text-[14px]">새로고침</button>
      </div>
    )
  }

  if (!isReady || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-6 h-6 border-2 border-[#2c2c35] border-t-[#3182f6] rounded-full animate-spin" />
        <p className="text-[14px] text-[#4e5968]">지도 로딩 중</p>
      </div>
    )
  }

  const propsWithCoords = properties.filter((p) => p.latitude && p.longitude)

  return (
    <div className="relative h-[calc(100dvh-128px)]">
      <div ref={mapRef} className="w-full h-full" />
      {propsWithCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-[#212127] px-5 py-3.5 rounded-2xl border border-[#2c2c35] flex items-center gap-2" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
            <p className="text-[14px] text-[#8b95a1]">좌표가 등록된 매물이 없습니다</p>
          </div>
        </div>
      )}
    </div>
  )
}
