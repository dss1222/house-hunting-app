import { useState } from 'react'
import type { PropertyFormData } from '../types'

export function useNaverImport() {
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseInput = (text: string): Partial<PropertyFormData> | null => {
    setImporting(true)
    setError(null)

    try {
      const result: Partial<PropertyFormData> = {}

      // URL이 포함되어 있으면 메모에 저장
      const linkMatch = text.match(/(https?:\/\/[^\s]+)/i)
      if (linkMatch) {
        result.memo = `네이버 부동산: ${linkMatch[1]}`
      }

      // 억 단위 가격 파싱 (예: "3억 5,000", "8억", "2억 3000만원")
      const eokPattern = /(\d+)\s*억\s*(?:원|만원|만\s*원)?(?:\s*(\d[\d,]*)\s*(?:만\s*원?|만)?)?/
      const eokMatch = text.match(eokPattern)

      // 가격 유형 감지
      const isWolse = /월세/i.test(text)
      const isJeonse = /전세/i.test(text)
      const isMaemae = /매매/i.test(text)

      if (isWolse) {
        result.price_type = '월세'
        // 월세 패턴: "보증금 1억 / 월 80만", "1000/80", "1억/80"
        const wolsePattern = /(\d[\d,.억]*)\s*[\/\|]\s*(\d[\d,.]*)/
        const wm = text.match(wolsePattern)
        if (wm) {
          result.deposit = parseKoreanPrice(wm[1]!)
          result.monthly_rent = parseKoreanPrice(wm[2]!)
        }
      } else if (isJeonse) {
        result.price_type = '전세'
        if (eokMatch) {
          result.deposit = eokToMan(eokMatch[1]!, eokMatch[2])
        } else {
          const priceMatch = text.match(/전세\s*(?:금?\s*)?(\d[\d,.]*)(?:\s*만?\s*원?)?/)
          if (priceMatch) result.deposit = parseKoreanPrice(priceMatch[1]!)
        }
      } else if (isMaemae) {
        result.price_type = '매매'
        if (eokMatch) {
          result.price = eokToMan(eokMatch[1]!, eokMatch[2])
        } else {
          const priceMatch = text.match(/매매\s*(?:가?\s*)?(\d[\d,.]*)(?:\s*만?\s*원?)?/)
          if (priceMatch) result.price = parseKoreanPrice(priceMatch[1]!)
        }
      } else if (eokMatch) {
        // 유형 모르면 기본 전세
        result.price_type = '전세'
        result.deposit = eokToMan(eokMatch[1]!, eokMatch[2])
      }

      // 면적 (㎡ → 평)
      const areaMatch = text.match(/(?:전용\s*)?(\d+\.?\d*)\s*㎡/)
      if (areaMatch) {
        result.size_pyeong = Math.round(parseFloat(areaMatch[1]!) * 0.3025 * 10) / 10
      }
      // 직접 평수
      const pyeongMatch = text.match(/(\d+\.?\d*)\s*평/)
      if (pyeongMatch && !result.size_pyeong) {
        result.size_pyeong = parseFloat(pyeongMatch[1]!)
      }

      // 층수
      const floorMatch = text.match(/(\d+)\s*층/)
      if (floorMatch) result.floor = parseInt(floorMatch[1]!)

      // 방/화장실
      const roomMatch = text.match(/방\s*(\d+)/) ?? text.match(/(\d+)\s*룸/)
      if (roomMatch) result.rooms = parseInt(roomMatch[1]!)

      const bathMatch = text.match(/(?:욕실|화장실)\s*(\d+)/)
      if (bathMatch) result.bathrooms = parseInt(bathMatch[1]!)

      // 관리비
      const maintMatch = text.match(/관리비\s*[:\s]*(\d[\d,]*)\s*(?:만\s*원?)?/)
      if (maintMatch) result.maintenance_fee = parseInt(maintMatch[1]!.replace(/,/g, ''))

      // 방향
      const dirMatch = text.match(/(남향|동향|서향|북향|남동향|남서향|북동향|북서향)/)
      if (dirMatch) result.direction = dirMatch[1]!

      // 주차
      if (/주차\s*(가능|있|O|○)/i.test(text)) result.parking = true

      // 주소
      const addrMatch = text.match(/(서울|경기|인천|부산|대구|대전|광주|울산|세종|강원|충북|충남|전북|전남|경북|경남|제주)[^\n]{3,40}/)
      if (addrMatch) result.address = addrMatch[0]!.trim()

      // 이름 (첫 줄에서 추출)
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 1)
      for (const line of lines) {
        // URL이나 숫자로 시작하지 않는 짧은 줄 = 매물 이름
        if (line.length <= 30 && !line.match(/^(https?|[0-9]|매매|전세|월세|관리|층수|방향)/) && !line.includes('㎡')) {
          result.name = line
          break
        }
      }

      // 결과 검증
      const hasData = result.name || result.address || result.price || result.deposit || result.size_pyeong
      if (!hasData) {
        setError('매물 정보를 인식하지 못했어요. 네이버 부동산 매물 페이지에서 더 많은 텍스트를 복사해 주세요.')
        return null
      }

      return result
    } catch {
      setError('파싱 중 오류가 발생했습니다.')
      return null
    } finally {
      setImporting(false)
    }
  }

  return { parseInput, importing, error }
}

function parseKoreanPrice(s: string): number {
  // "1억" → 10000, "3억 5000" → 35000, "5000" → 5000
  if (s.includes('억')) {
    return eokToMan(s.replace(/억.*/, ''), s.replace(/.*억\s*/, '').replace(/[^0-9]/g, '') || undefined)
  }
  return parseInt(s.replace(/[^0-9]/g, '')) || 0
}

function eokToMan(eok: string, man?: string): number {
  const e = parseInt(eok) * 10000
  const m = man ? parseInt(man.replace(/,/g, '')) : 0
  return e + (isNaN(m) ? 0 : m)
}
