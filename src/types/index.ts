export interface Property {
  id: string
  user_id: string
  name: string
  address: string
  price_type: '매매' | '전세' | '월세'
  price: number | null
  monthly_rent: number | null
  deposit: number | null
  size_pyeong: number | null
  floor: number | null
  rooms: number | null
  bathrooms: number | null
  parking: boolean
  maintenance_fee: number | null
  direction: string | null
  move_in_date: string | null
  rating: number
  memo: string | null
  latitude: number | null
  longitude: number | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Photo {
  id: string
  property_id: string
  url: string
  created_at: string
}

export interface Review {
  id: string
  property_id: string
  user_id: string
  author_name: string
  content: string
  created_at: string
  updated_at: string
}

export type PropertyFormData = Omit<Property, 'id' | 'user_id' | 'created_at' | 'updated_at'>
