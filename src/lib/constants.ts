export const PRICE_TYPES = ['매매', '전세', '월세'] as const
export type PriceType = (typeof PRICE_TYPES)[number]

export const DIRECTIONS = ['남향', '동향', '서향', '북향', '남동향', '남서향', '북동향', '북서향'] as const

export const TAG_OPTIONS = [
  '신축', '구축', '역세권', '학군',
  '조용한', '상가근처', '공원근처', '대단지',
  '리모델링', '풀옵션', '반려동물가능',
] as const

export const COMMUTE_DESTINATIONS = [
  { name: '여의도', address: '여의도동 10', lat: 37.5219, lng: 126.9245 },
  { name: '논현', address: '서울 강남구 논현로72길 13', lat: 37.5110, lng: 127.0295 },
] as const

export const EMPTY_PROPERTY_FORM = {
  name: '',
  address: '',
  price_type: '전세' as PriceType,
  price: null as number | null,
  monthly_rent: null as number | null,
  deposit: null as number | null,
  size_pyeong: null as number | null,
  floor: null as number | null,
  rooms: null as number | null,
  bathrooms: null as number | null,
  parking: false,
  maintenance_fee: null as number | null,
  direction: '',
  move_in_date: '',
  rating: 0,
  memo: '',
  latitude: null as number | null,
  longitude: null as number | null,
  tags: [] as string[],
}
