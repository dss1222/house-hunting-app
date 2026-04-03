import { useState, useCallback } from 'react'
import imageCompression from 'browser-image-compression'
import { supabase } from '../lib/supabase'
import type { Photo } from '../types'

export function usePhotos(propertyId: string) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)

  const fetchPhotos = useCallback(async () => {
    const { data } = await supabase
      .from('photos')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
    if (data) setPhotos(data)
  }, [propertyId])

  const uploadPhoto = async (file: File) => {
    setUploading(true)
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      })

      const fileName = `${propertyId}/${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('property-photos')
        .upload(fileName, compressed, { contentType: 'image/jpeg' })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('property-photos')
        .getPublicUrl(fileName)

      const { data: photo, error: insertError } = await supabase
        .from('photos')
        .insert({ property_id: propertyId, url: publicUrl })
        .select()
        .single()
      if (insertError) throw insertError

      setPhotos((prev) => [photo, ...prev])
    } finally {
      setUploading(false)
    }
  }

  const deletePhoto = async (photo: Photo) => {
    const path = photo.url.split('/property-photos/')[1]
    if (path) {
      await supabase.storage.from('property-photos').remove([path])
    }
    await supabase.from('photos').delete().eq('id', photo.id)
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
  }

  return { photos, uploading, fetchPhotos, uploadPhoto, deletePhoto }
}
