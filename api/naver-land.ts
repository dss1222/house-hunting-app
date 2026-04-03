import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = { maxDuration: 15 }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  const inputUrl = req.query['url'] as string | undefined

  if (!inputUrl) {
    return res.status(400).json({ error: 'url 파라미터가 필요합니다' })
  }

  try {
    // 1. article ID 추출
    let articleId = ''

    const directMatch = inputUrl.match(/articles\/(\d+)/)
    if (directMatch) {
      articleId = directMatch[1]!
    }

    // naver.me 단축 URL → 첫 번째 리다이렉트만 따라가서 article ID 추출
    if (!articleId && inputUrl.includes('naver.me')) {
      try {
        const redirectRes = await fetch(inputUrl, {
          redirect: 'manual',
          headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' },
          signal: AbortSignal.timeout(8000),
        })
        const location = redirectRes.headers.get('location') ?? ''
        console.log('Redirect location:', location)
        const m = location.match(/articles\/(\d+)/)
        if (m) articleId = m[1]!
      } catch (e) {
        console.error('Redirect error:', e)
      }
    }

    if (!articleId) {
      return res.status(400).json({ error: '매물 ID를 찾을 수 없습니다. 네이버 부동산 매물 상세 페이지의 공유 링크를 사용해주세요.' })
    }

    // 2. 여러 API 엔드포인트 시도
    const endpoints = [
      {
        url: `https://fin.land.naver.com/front-api/v1/article/basicInfo?articleId=${articleId}`,
        referer: `https://fin.land.naver.com/articles/${articleId}`,
      },
      {
        url: `https://new.land.naver.com/api/articles/${articleId}`,
        referer: `https://new.land.naver.com/`,
      },
    ]

    let info: Record<string, unknown> | null = null

    for (const ep of endpoints) {
      try {
        const apiRes = await fetch(ep.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
            'Referer': ep.referer,
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(6000),
        })

        if (!apiRes.ok) continue
        const data = await apiRes.json()
        if (data?.detailCode === 'TOO_MANY_REQUESTS' || data?.code === 'TOO_MANY_REQUESTS') continue
        if (data?.success === false) continue

        info = data?.result ?? data
        if (info && (info.articleName || info.complexName || info.articleTitle)) break
        info = null
      } catch {
        continue
      }
    }

    if (!info) {
      return res.status(429).json({ error: '네이버 요청 제한. 30초~1분 후 다시 시도해주세요.' })
    }

    const property = {
      name: info.articleName ?? info.complexName ?? info.articleTitle ?? '',
      address: info.exposureAddress ?? info.address ?? info.roadAddress ?? '',
      price_type: mapPriceType(info.tradeTypeName ?? info.tradeType ?? ''),
      price: parseNum(info.dealPrice ?? info.price),
      monthly_rent: parseNum(info.monthlyRent),
      deposit: parseNum(info.deposit ?? info.warrantPrice),
      size_pyeong: info.exclusiveArea ? Math.round(parseFloat(info.exclusiveArea) * 0.3025 * 10) / 10 : null,
      floor: info.floor ? parseInt(info.floor) : info.floorInfo ? parseInt(info.floorInfo) : null,
      rooms: info.roomCount ? parseInt(info.roomCount) : null,
      bathrooms: info.bathroomCount ? parseInt(info.bathroomCount) : null,
      parking: info.parkingCount ? parseInt(info.parkingCount) > 0 : false,
      maintenance_fee: info.maintenanceFee ? Math.round(parseFloat(info.maintenanceFee)) : null,
      direction: info.direction ?? null,
      latitude: info.latitude ? parseFloat(info.latitude) : null,
      longitude: info.longitude ? parseFloat(info.longitude) : null,
      tags: buildTags(info),
      memo: `네이버 부동산: https://fin.land.naver.com/articles/${articleId}`,
    }

    return res.status(200).json({ property })
  } catch (err) {
    console.error('Handler error:', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return res.status(500).json({ error: `서버 오류: ${msg}` })
  }
}

function mapPriceType(t: string): string {
  if (t.includes('매매') || t === 'A1') return '매매'
  if (t.includes('월세') || t === 'B2') return '월세'
  return '전세'
}

function parseNum(v: unknown): number | null {
  if (v == null || v === '') return null
  const n = parseInt(String(v).replace(/[^0-9]/g, ''))
  return isNaN(n) ? null : n
}

function buildTags(info: Record<string, unknown>): string[] {
  const tags: string[] = []
  const year = info.approvalDate ?? info.useApprovalDate
  if (typeof year === 'string') {
    const y = parseInt(year.substring(0, 4))
    if (!isNaN(y)) tags.push(new Date().getFullYear() - y <= 5 ? '신축' : '구축')
  }
  return tags
}
