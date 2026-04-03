export const config = { maxDuration: 15 }

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const inputUrl = url.searchParams.get('url')

  if (!inputUrl) {
    return Response.json({ error: 'url 파라미터가 필요합니다' }, { status: 400 })
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json',
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  try {
    // 1. article ID 추출
    let articleId = ''

    // 직접 articles/ URL
    const directMatch = inputUrl.match(/articles\/(\d+)/)
    if (directMatch) {
      articleId = directMatch[1]!
    }

    // naver.me 단축 URL → 리다이렉트 따라가기
    if (!articleId && inputUrl.includes('naver.me')) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 8000)
      try {
        const res = await fetch(inputUrl, {
          redirect: 'follow',
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' },
        })
        clearTimeout(timer)
        const finalUrl = res.url
        const m = finalUrl.match(/articles\/(\d+)/)
        if (m) articleId = m[1]!
      } catch {
        clearTimeout(timer)
      }
    }

    if (!articleId) {
      return Response.json({ error: '매물 링크에서 ID를 찾을 수 없습니다. 네이버 부동산 매물 상세 페이지의 공유 링크를 사용해주세요.' }, { status: 400, headers })
    }

    // 2. 네이버 부동산 API 호출
    const apiUrl = `https://fin.land.naver.com/front-api/v1/article/basicInfo?articleId=${articleId}`
    const controller2 = new AbortController()
    const timer2 = setTimeout(() => controller2.abort(), 8000)

    const apiRes = await fetch(apiUrl, {
      signal: controller2.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'Referer': `https://fin.land.naver.com/articles/${articleId}`,
        'Accept': 'application/json',
      },
    })
    clearTimeout(timer2)

    if (!apiRes.ok) {
      return Response.json({ error: `네이버 API 오류 (${apiRes.status}). 잠시 후 다시 시도해주세요.` }, { status: 502, headers })
    }

    const data = await apiRes.json()
    if (data?.detailCode === 'TOO_MANY_REQUESTS') {
      return Response.json({ error: '네이버 요청 제한. 30초 후 다시 시도해주세요.' }, { status: 429, headers })
    }

    const info = data?.result ?? data

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

    return Response.json({ property }, { status: 200, headers })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: `서버 오류: ${msg}` }, { status: 500, headers })
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
