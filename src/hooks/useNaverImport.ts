import { useState } from 'react'
import type { PropertyFormData } from '../types'

interface NaverImportResult {
  property: Partial<PropertyFormData>
}

export function useNaverImport() {
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const importFromUrl = async (url: string): Promise<Partial<PropertyFormData> | null> => {
    setImporting(true)
    setError(null)

    try {
      const apiUrl = `/api/naver-land?url=${encodeURIComponent(url)}`
      const res = await fetch(apiUrl)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? '가져오기 실패')
        return null
      }

      const result = data as NaverImportResult
      return result.property
    } catch {
      setError('네트워크 오류. 다시 시도해주세요.')
      return null
    } finally {
      setImporting(false)
    }
  }

  return { importFromUrl, importing, error }
}
