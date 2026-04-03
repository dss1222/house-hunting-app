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
    if (data) {
      // 각 사진의 signed URL 생성 (비공개 버킷)
      const withUrls = await Promise.all(
        data.map(async (photo) => {
          const path = photo.url
          // 이미 http URL이면 그대로 사용
          if (path.startsWith('http')) return photo
          // storage path인 경우 signed URL 생성
          const { data: signed } = await supabase.storage
            .from('property-photos')
            .createSignedUrl(path, 3600) // 1시간 유효
          return { ...photo, url: signed?.signedUrl ?? photo.url }
        })
      )
      setPhotos(withUrls)
    }
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
      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('사진 업로드 실패: ' + uploadError.message)
        return
      }

      // DB에 storage path 저장 (URL이 아닌 경로)
      const { data: photo, error: insertError } = await supabase
        .from('photos')
        .insert({ property_id: propertyId, url: fileName })
        .select()
        .single()
      if (insertError) {
        console.error('Insert error:', insertError)
        alert('사진 정보 저장 실패: ' + insertError.message)
        return
      }

      // signed URL 생성해서 표시
      const { data: signed } = await supabase.storage
        .from('property-photos')
        .createSignedUrl(fileName, 3600)

      setPhotos((prev) => [{ ...photo, url: signed?.signedUrl ?? fileName }, ...prev])
    } catch (err) {
      console.error('Photo upload error:', err)
      alert('사진 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  const deletePhoto = async (photo: Photo) => {
    // DB에 저장된 원본 path로 삭제
    const { data: dbPhoto } = await supabase
      .from('photos')
      .select('url')
      .eq('id', photo.id)
      .single()

    const storagePath = dbPhoto?.url ?? ''
    if (storagePath && !storagePath.startsWith('http')) {
      await supabase.storage.from('property-photos').remove([storagePath])
    }
    await supabase.from('photos').delete().eq('id', photo.id)
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
  }

  return { photos, uploading, fetchPhotos, uploadPhoto, deletePhoto }
}
