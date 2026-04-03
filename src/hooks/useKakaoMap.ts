import { useState, useEffect } from 'react'

let loadPromise: Promise<void> | null = null

function loadKakaoSDK(): Promise<void> {
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve())
      return
    }

    const script = document.createElement('script')
    const key = import.meta.env.VITE_KAKAO_APP_KEY
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services`
    script.onload = () => {
      window.kakao.maps.load(() => resolve())
    }
    script.onerror = () => {
      loadPromise = null
      reject(new Error('Kakao Map SDK 로드 실패'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}

export function useKakaoMap() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadKakaoSDK()
      .then(() => setIsReady(true))
      .catch((err) => setError(err.message))
  }, [])

  return { isReady, error }
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  await loadKakaoSDK()
  return new Promise((resolve) => {
    const geocoder = new window.kakao.maps.services.Geocoder()
    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        resolve({ lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) })
      } else {
        resolve(null)
      }
    })
  })
}
