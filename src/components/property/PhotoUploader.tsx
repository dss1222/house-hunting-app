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
        <h3 className="text-[16px] font-bold text-text">사진</h3>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-[14px] text-primary font-semibold min-h-[44px] flex items-center active:opacity-60 transition-opacity"
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
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center py-10 bg-[#f2f4f6] rounded-2xl active:bg-[#e5e8eb] transition-colors"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#b0b8c1" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          <p className="text-[13px] text-text-tertiary mt-2">탭하여 사진 추가</p>
        </button>
      )}
      <div className="grid grid-cols-3 gap-1.5">
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-[#f2f4f6]">
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => onDelete(photo)}
              className="absolute top-2 right-2 w-6 h-6 bg-black/40 text-white rounded-full flex items-center justify-center active:bg-black/60 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
