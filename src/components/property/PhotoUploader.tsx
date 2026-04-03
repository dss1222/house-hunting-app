import { useRef } from 'react'
import type { Photo } from '../../types'

interface PhotoUploaderProps {
  photos: Photo[]
  uploading: boolean
  onUpload: (file: File) => Promise<void>
  onDelete: (photo: Photo) => Promise<void>
}

export function PhotoUploader({ photos, uploading, onUpload, onDelete }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await onUpload(file)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-text-secondary">사진</h3>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm text-primary font-medium min-h-[44px] px-2"
        >
          {uploading ? '업로드 중...' : '+ 추가'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {photos.length === 0 && !uploading && (
        <p className="text-sm text-text-secondary">등록된 사진이 없습니다.</p>
      )}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => onDelete(photo)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full text-xs flex items-center justify-center"
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
