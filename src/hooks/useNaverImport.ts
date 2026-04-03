import { useState } from 'react'
import type { PropertyFormData } from '../types'

export function useNaverImport() {
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const importFromUrl = async (inputUrl: string): Promise<Partial<PropertyFormData> | null> => {
    setImporting(true)
    setError(null)

    try {
      const res = await fetch(`/api/naver-land?url=${encodeURIComponent(inputUrl)}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? '가져오기 실패')
        return null
      }

      return data.property
    } catch {
      setError('네트워크 오류. 다시 시도해주세요.')
      return null
    } finally {
      setImporting(false)
    }
  }

  return { importFromUrl, importing, error }
}
