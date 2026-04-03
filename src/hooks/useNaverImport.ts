import { useState } from 'react'
import type { PropertyFormData } from '../types'

export function useNaverImport() {
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseText = (text: string): Partial<PropertyFormData> | null => {
    setImporting(true)
    setError(null)

    try {
      const result: Partial<PropertyFormData> = {}

      // 가격 파싱
      const pricePatterns = [
        { regex: /매매\s*[:\s]*([0-9,.]+)\s*만?\s*원?/i, type: '매매' as const, field: 'price' },
        { regex: /매매가\s*[:\s]*([0-9,.]+)\s*억?\s*([0-9,]*)\s*만?\s*원?/, type: '매매' as const, field: 'price' },
        { regex: /전세\s*[:\s]*([0-9,.]+)\s*만?\s*원?/i, type: '전세' as const, field: 'deposit' },
        { regex: /전세금?\s*[:\s]*([0-9,.]+)\s*억?\s*([0-9,]*)\s*만?\s*원?/, type: '전세' as const, field: 'deposit' },
        { regex: /월세\s*[:\s]*([0-9,.]+)\s*\/\s*([0-9,.]+)/i, type: '월세' as const },
        { regex: /보증금\s*[:\s]*([0-9,.]+).*?월세\s*[:\s]*([0-9,.]+)/i, type: '월세' as const },
      ]

      for (const pattern of pricePatterns) {
        const match = text.match(pattern.regex)
        if (match) {
          result.price_type = pattern.type
          if (pattern.type === '월세') {
            result.deposit = parsePrice(match[1]!)
            result.monthly_rent = parsePrice(match[2]!)
          } else if (pattern.type === '전세') {
            result.deposit = parsePrice(match[1]!, match[2])
          } else {
            result.price = parsePrice(match[1]!, match[2])
          }
          break
        }
      }

      // 억 단위 파싱
      const eokMatch = text.match(/([0-9]+)\s*억\s*([0-9,]*)\s*만?\s*원?/)
      if (eokMatch && !result.price && !result.deposit) {
        const eok = parseInt(eokMatch[1]!) * 10000
        const man = eokMatch[2] ? parseInt(eokMatch[2].replace(/,/g, '')) : 0
        const total = eok + man
        if (text.includes('전세')) {
          result.price_type = '전세'
          result.deposit = total
        } else {
          result.price_type = '매매'
          result.price = total
        }
      }

      // 면적/평수
      const areaMatch = text.match(/전용\s*면적?\s*[:\s]*([0-9.]+)\s*㎡/) ??
                        text.match(/전용\s*([0-9.]+)\s*㎡/) ??
                        text.match(/([0-9.]+)\s*㎡/)
      if (areaMatch) {
        result.size_pyeong = Math.round(parseFloat(areaMatch[1]!) * 0.3025 * 10) / 10
      }
      const pyeongMatch = text.match(/([0-9.]+)\s*평/)
      if (pyeongMatch && !result.size_pyeong) {
        result.size_pyeong = parseFloat(pyeongMatch[1]!)
      }

      // 층수
      const floorMatch = text.match(/([0-9]+)\s*층\s*[/\/]\s*[0-9]+\s*층/) ??
                         text.match(/([0-9]+)\s*층/)
      if (floorMatch) {
        result.floor = parseInt(floorMatch[1]!)
      }

      // 방/화장실
      const roomMatch = text.match(/방\s*([0-9]+)/) ?? text.match(/([0-9]+)\s*개?\s*룸/)
      if (roomMatch) result.rooms = parseInt(roomMatch[1]!)

      const bathMatch = text.match(/욕실\s*([0-9]+)/) ?? text.match(/화장실\s*([0-9]+)/)
      if (bathMatch) result.bathrooms = parseInt(bathMatch[1]!)

      // 관리비
      const maintMatch = text.match(/관리비\s*[:\s]*([0-9,.]+)\s*만?\s*원?/)
      if (maintMatch) result.maintenance_fee = parseInt(maintMatch[1]!.replace(/,/g, ''))

      // 방향
      const dirMatch = text.match(/(남향|동향|서향|북향|남동향|남서향|북동향|북서향)/)
      if (dirMatch) result.direction = dirMatch[1]!

      // 주차
      if (/주차\s*(가능|있|O|○)/i.test(text)) result.parking = true
      if (/주차\s*(불가|없|X|×)/i.test(text)) result.parking = false

      // 주소 (도/시로 시작하는 줄)
      const addrMatch = text.match(/(서울|경기|인천|부산|대구|대전|광주|울산|세종|강원|충북|충남|전북|전남|경북|경남|제주)[^\n]{5,50}/)
      if (addrMatch) result.address = addrMatch[0]!.trim()

      // 단지명 (첫 줄이나 굵은 텍스트)
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
      if (lines[0] && lines[0].length <= 30 && !lines[0].match(/^[0-9]/)) {
        result.name = lines[0]
      }

      // 링크 저장
      const linkMatch = text.match(/(https?:\/\/[^\s]+naver[^\s]+)/)
      if (linkMatch) {
        result.memo = `네이버 부동산: ${linkMatch[1]}`
      }

      if (Object.keys(result).length <= 1) {
        setError('매물 정보를 찾을 수 없습니다. 네이버 부동산 페이지의 텍스트를 더 많이 복사해주세요.')
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

  return { parseText, importing, error }
}

function parsePrice(main: string, sub?: string): number {
  const mainNum = parseInt(main.replace(/,/g, ''))
  if (main.includes('.') || mainNum <= 100) {
    // 억 단위로 추정
    const eok = Math.floor(mainNum) * 10000
    const remainder = sub ? parseInt(sub.replace(/,/g, '')) : Math.round((parseFloat(main) % 1) * 10000)
    return eok + remainder
  }
  return mainNum
}
