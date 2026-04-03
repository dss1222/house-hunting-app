import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 환경변수 누락:', { supabaseUrl, supabaseAnonKey: supabaseAnonKey ? '설정됨' : '없음' })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
