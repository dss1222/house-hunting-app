import { useState } from 'react'
import type { PropertyFormData } from '../types'

export function useNaverImport() {
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const importFromUrl = async (inputUrl: string): Promise<Partial<PropertyFormData> | null> => {
    setImporting(true)
    setError(null)

    try {
      // 1. naver.me 단축 URL → 실제 URL로 변환
      let articleId = ''
      const articleMatch = inputUrl.match(/articles\/(\d+)/)
      if (articleMatch) {
        articleId = articleMatch[1]!
      } else if (inputUrl.includes('naver.me')) {
        // CORS 프록시로 리다이렉트 URL 확인
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(inputUrl)}`
        const res = await fetchWithTimeout(proxyUrl, 10000)
        const html = await res.text()
        const idMatch = html.match(/articles\/(\d+)/)
        if (idMatch) articleId = idMatch[1]!
      }

      if (!articleId) {
        setError('유효한 네이버 부동산 링크가 아닙니다')
        return null
      }

      // 2. 네이버 부동산 API 호출 (CORS 프록시 경유)
      const apiUrl = `https://fin.land.naver.com/front-api/v1/article/basicInfo?articleId=${articleId}`
      const proxyApiUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`

      const apiRes = await fetchWithTimeout(proxyApiUrl, 10000)
      const data = await apiRes.json()

      const info = data?.result ?? data

      if (!info || info.detailCode === 'TOO_MANY_REQUESTS') {
        // API 실패시 HTML 페이지에서 파싱 시도
        const htmlUrl = `https://fin.land.naver.com/articles/${articleId}`
        const proxyHtmlUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(htmlUrl)}`
        const htmlRes = await fetchWithTimeout(proxyHtmlUrl, 10000)
        const htmlData = await htmlRes.json()

        if (htmlData?.contents) {
          const parsed = parseHtml(htmlData.contents, articleId)
          if (parsed) return parsed
        }

        setError('네이버에서 데이터를 가져올 수 없습니다. 잠시 후 다시 시도해주세요.')
        return null
      }

      // 3. 우리 앱 형태로 변환
      return convertToProperty(info, articleId)
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

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer))
}

function convertToProperty(info: Record<string, unknown>, articleId: string): Partial<PropertyFormData> {
  const result: Partial<PropertyFormData> = {}

  result.name = (info.articleName ?? info.complexName ?? info.articleTitle ?? '') as string
  result.address = (info.exposureAddress ?? info.address ?? info.roadAddress ?? '') as string

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

  if (info.exclusiveArea) {
    result.size_pyeong = Math.round(parseFloat(String(info.exclusiveArea)) * 0.3025 * 10) / 10
  }
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

function parseHtml(html: string, articleId: string): Partial<PropertyFormData> | null {
  try {
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
    if (nextDataMatch?.[1]) {
      const nextData = JSON.parse(nextDataMatch[1])
      const props = nextData?.props?.pageProps
      if (props?.articleDetail || props?.basicInfo) {
        return convertToProperty(props.articleDetail ?? props.basicInfo, articleId)
      }
    }
  } catch { /* ignore */ }
  return null
}

function parseNum(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const str = String(value).replace(/[^0-9]/g, '')
  const num = parseInt(str)
  return isNaN(num) ? null : num
}
