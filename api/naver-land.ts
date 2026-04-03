import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url 파라미터가 필요합니다' })
  }

  try {
    // 1. naver.me 단축 URL이면 리다이렉트 따라가기
    let articleId = ''

    if (url.includes('naver.me')) {
      const redirectRes = await fetch(url, { redirect: 'manual' })
      const location = redirectRes.headers.get('location') ?? ''
      const match = location.match(/articles\/(\d+)/)
      articleId = match?.[1] ?? ''
    } else {
      const match = url.match(/articles\/(\d+)/)
      articleId = match?.[1] ?? ''
    }

    if (!articleId) {
      return res.status(400).json({ error: '유효한 네이버 부동산 링크가 아닙니다' })
    }

    // 2. 네이버 부동산 API 호출
    const apiUrl = `https://fin.land.naver.com/front-api/v1/article/basicInfo?articleId=${articleId}`
    const apiRes = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Referer': `https://fin.land.naver.com/articles/${articleId}`,
        'Accept': 'application/json, text/plain, */*',
      },
    })

    if (!apiRes.ok) {
      // API 실패시 HTML에서 파싱 시도
      const htmlRes = await fetch(`https://fin.land.naver.com/articles/${articleId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        },
      })
      const html = await htmlRes.text()

      // Next.js __NEXT_DATA__ 에서 데이터 추출 시도
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/)
      if (nextDataMatch?.[1]) {
        const nextData = JSON.parse(nextDataMatch[1])
        return res.status(200).json({ source: 'html', data: nextData })
      }

      return res.status(502).json({ error: '네이버 부동산에서 데이터를 가져올 수 없습니다. 잠시 후 다시 시도해주세요.' })
    }

    const data = await apiRes.json()

    // 3. 우리 앱 형태로 변환
    const info = data?.result ?? data

    const property = {
      name: info.articleName ?? info.complexName ?? info.articleTitle ?? '',
      address: info.exposureAddress ?? info.address ?? info.roadAddress ?? '',
      price_type: mapPriceType(info.tradeTypeName ?? info.tradeType ?? ''),
      price: parsePriceNumber(info.dealPrice ?? info.price ?? info.warrantPrice ?? null),
      monthly_rent: parsePriceNumber(info.monthlyRent ?? null),
      deposit: parsePriceNumber(info.deposit ?? info.warrantPrice ?? null),
      size_pyeong: info.exclusiveArea ? Math.round(parseFloat(info.exclusiveArea) * 0.3025 * 10) / 10 : null,
      floor: info.floor ? parseInt(info.floor) : info.floorInfo ? parseInt(info.floorInfo) : null,
      rooms: info.roomCount ? parseInt(info.roomCount) : null,
      bathrooms: info.bathroomCount ? parseInt(info.bathroomCount) : null,
      parking: info.parkingCount ? parseInt(info.parkingCount) > 0 : false,
      maintenance_fee: info.maintenanceFee ? Math.round(parseFloat(info.maintenanceFee)) : null,
      direction: info.direction ?? null,
      move_in_date: info.moveInDate ?? info.moveInTypeName ?? null,
      latitude: info.latitude ? parseFloat(info.latitude) : null,
      longitude: info.longitude ? parseFloat(info.longitude) : null,
      tags: buildTags(info),
      memo: `네이버 부동산: https://fin.land.naver.com/articles/${articleId}`,
      raw: info,
    }

    return res.status(200).json({ source: 'api', property })
  } catch (err) {
    console.error('Naver land fetch error:', err)
    return res.status(500).json({ error: '서버 오류가 발생했습니다' })
  }
}

function mapPriceType(type: string): '매매' | '전세' | '월세' {
  if (type.includes('매매') || type === 'A1') return '매매'
  if (type.includes('전세') || type === 'B1') return '전세'
  if (type.includes('월세') || type === 'B2') return '월세'
  return '전세'
}

function parsePriceNumber(value: string | number | null): number | null {
  if (value === null || value === undefined || value === '') return null
  const str = String(value).replace(/[^0-9]/g, '')
  const num = parseInt(str)
  return isNaN(num) ? null : num
}

function buildTags(info: Record<string, unknown>): string[] {
  const tags: string[] = []
  const year = info.approvalDate ?? info.useApprovalDate
  if (typeof year === 'string') {
    const builtYear = parseInt(year.substring(0, 4))
    if (!isNaN(builtYear)) {
      tags.push(new Date().getFullYear() - builtYear <= 5 ? '신축' : '구축')
    }
  }
  if (info.parkingCount && parseInt(String(info.parkingCount)) > 0) {
    tags.push('주차가능')
  }
  return tags
}
