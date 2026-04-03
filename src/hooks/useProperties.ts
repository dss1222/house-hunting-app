import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Property, PropertyFormData } from '../types'

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<number | null>(null)

  const fetchProperties = useCallback(async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setProperties(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProperties()

    const handleFocus = () => { fetchProperties() }
    window.addEventListener('focus', handleFocus)

    intervalRef.current = window.setInterval(fetchProperties, 30_000)

    return () => {
      window.removeEventListener('focus', handleFocus)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchProperties])

  const createProperty = async (data: PropertyFormData, userId: string) => {
    const { data: created, error } = await supabase
      .from('properties')
      .insert({ ...data, user_id: userId })
      .select()
      .single()
    if (error) throw error
    setProperties((prev) => [created, ...prev])
    return created
  }

  const updateProperty = async (id: string, data: Partial<PropertyFormData>) => {
    const { data: updated, error } = await supabase
      .from('properties')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)))
    return updated
  }

  const deleteProperty = async (id: string) => {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
    if (error) throw error
    setProperties((prev) => prev.filter((p) => p.id !== id))
  }

  return { properties, loading, fetchProperties, createProperty, updateProperty, deleteProperty }
}
