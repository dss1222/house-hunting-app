import { useState } from 'react'
import type { PropertyFormData } from '../types'

export function useNaverImport() {
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const importFromUrl = async (inputUrl: string): Promise<Partial<PropertyFormData> | null> => {
    setImporting(true)
    setError(null)

    try {
      // 1. article ID 추출
      let articleId = ''

      // fin.land.naver.com/articles/12345 형태
      const directMatch = inputUrl.match(/articles\/(\d+)/)
      if (directMatch) {
        articleId = directMatch[1]!
      }

      // naver.me/xxxx 단축 URL → article ID 추출
      if (!articleId && inputUrl.includes('naver.me')) {
        // 방법1: corsproxy.io
        try {
          const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(inputUrl)}`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(15000),
          })
          const finalUrl = res.url || res.headers.get('x-final-url') || ''
          const m = finalUrl.match(/articles\/(\d+)/)
          if (m) articleId = m[1]!
        } catch { /* fallback below */ }

        // 방법2: 직접 fetch (일부 브라우저에서 작동)
        if (!articleId) {
          try {
            const res = await fetch(inputUrl, {
              method: 'HEAD',
              mode: 'no-cors',
              redirect: 'follow',
              signal: AbortSignal.timeout(10000),
            })
            const m = res.url.match(/articles\/(\d+)/)
            if (m) articleId = m[1]!
          } catch { /* ignore */ }
        }
      }

      if (!articleId) {
        setError('링크에서 매물 ID를 찾을 수 없습니다. fin.land.naver.com/articles/... 형태의 링크를 직접 사용해주세요.')
        return null
      }

      // 2. 네이버 부동산 API 호출
      const apiUrl = `https://fin.land.naver.com/front-api/v1/article/basicInfo?articleId=${articleId}`

      // 여러 프록시 시도
      const proxies = [
        `https://corsproxy.io/?url=${encodeURIComponent(apiUrl)}`,
        `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`,
      ]

      let data: Record<string, unknown> | null = null

      for (const proxyUrl of proxies) {
        try {
          const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) })
          if (!res.ok) continue

          const raw = await res.json()
          // allorigins는 { contents: "..." } 형태로 반환
          if (raw.contents) {
            data = JSON.parse(raw.contents)
          } else {
            data = raw
          }

          if (data && !('detailCode' in data && data.detailCode === 'TOO_MANY_REQUESTS')) {
            break
          }
          data = null
        } catch {
          continue
        }
      }

      if (!data) {
        setError('매물 정보를 가져올 수 없습니다. 잠시 후 다시 시도해주세요.')
        return null
      }

      const info = (data as Record<string, unknown>).result ?? data
      return convertToProperty(info as Record<string, unknown>, articleId)
    } catch (e) {
      console.error('Import error:', e)
      setError('가져오기 실패. 다시 시도해주세요.')
      return null
    } finally {
      setImporting(false)
    }
  }

  return { importFromUrl, importing, error }
}

function convertToProperty(info: Record<string, unknown>, articleId: string): Partial<PropertyFormData> {
  const result: Partial<PropertyFormData> = {}

  result.name = String(info.articleName ?? info.complexName ?? info.articleTitle ?? '')
  result.address = String(info.exposureAddress ?? info.address ?? info.roadAddress ?? '')

  const tradeType = String(info.tradeTypeName ?? info.tradeType ?? '')
  if (tradeType.includes('매매') || tradeType === 'A1') {
    result.price_type = '매매'
    result.price = parseNum(info.dealPrice ?? info.price)
  } else if (tradeType.includes('월세') || tradeType === 'B2') {
    result.price_type = '월세'
    result.deposit = parseNum(info.deposit ?? info.warrantPrice)
    result.monthly_rent = parseNum(info.monthlyRent)
  } else {
    result.price_type = '전세'
    result.deposit = parseNum(info.deposit ?? info.warrantPrice ?? info.dealPrice ?? info.price)
  }

  if (info.exclusiveArea) result.size_pyeong = Math.round(parseFloat(String(info.exclusiveArea)) * 0.3025 * 10) / 10
  if (info.floor || info.floorInfo) result.floor = parseInt(String(info.floor ?? info.floorInfo))
  if (info.roomCount) result.rooms = parseInt(String(info.roomCount))
  if (info.bathroomCount) result.bathrooms = parseInt(String(info.bathroomCount))
  if (info.parkingCount) result.parking = parseInt(String(info.parkingCount)) > 0
  if (info.maintenanceFee) result.maintenance_fee = Math.round(parseFloat(String(info.maintenanceFee)))
  if (info.direction) result.direction = String(info.direction)
  if (info.latitude) result.latitude = parseFloat(String(info.latitude))
  if (info.longitude) result.longitude = parseFloat(String(info.longitude))

  result.tags = []
  const year = info.approvalDate ?? info.useApprovalDate
  if (typeof year === 'string') {
    const builtYear = parseInt(year.substring(0, 4))
    if (!isNaN(builtYear)) {
      result.tags.push(new Date().getFullYear() - builtYear <= 5 ? '신축' : '구축')
    }
  }

  result.memo = `네이버 부동산: https://fin.land.naver.com/articles/${articleId}`
  return result
}

function parseNum(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const str = String(value).replace(/[^0-9]/g, '')
  const num = parseInt(str)
  return isNaN(num) ? null : num
}
