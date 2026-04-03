import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Review } from '../types'

export function useReviews(propertyId: string) {
  const [reviews, setReviews] = useState<Review[]>([])

  const fetchReviews = useCallback(async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: true })
    if (data) setReviews(data)
  }, [propertyId])

  const upsertReview = async (userId: string, authorName: string, content: string) => {
    const { data, error } = await supabase
      .from('reviews')
      .upsert(
        { property_id: propertyId, user_id: userId, author_name: authorName, content },
        { onConflict: 'property_id,user_id' }
      )
      .select()
      .single()
    if (error) throw error
    setReviews((prev) => {
      const existing = prev.findIndex((r) => r.user_id === userId)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = data
        return updated
      }
      return [...prev, data]
    })
  }

  return { reviews, fetchReviews, upsertReview }
}
