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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[18px] font-bold text-text">사진</h3>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-[14px] text-[#3182f6] font-semibold min-h-[44px] active:opacity-50 transition-opacity"
        >
          {uploading ? '업로드 중...' : '추가'}
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
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center py-12 bg-[#f2f4f6] rounded-2xl active:bg-[#e5e8eb] transition-colors"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#b0b8c1" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          <p className="text-[14px] text-text-tertiary mt-3">탭하여 사진을 추가하세요</p>
        </button>
      )}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-square rounded-2xl overflow-hidden bg-[#f2f4f6]">
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => onDelete(photo)}
              className="absolute top-2 right-2 w-7 h-7 bg-black/40 text-white rounded-full flex items-center justify-center active:bg-black/60 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
