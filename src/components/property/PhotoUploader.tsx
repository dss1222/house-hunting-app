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
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">사진</h3>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 text-sm text-primary font-medium min-h-[44px] px-2 active:opacity-70 transition-opacity"
        >
          {uploading ? (
            <span className="flex items-center gap-1.5">
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-20"/><path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/></svg>
              업로드 중...
            </span>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              추가
            </>
          )}
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
        <div
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-2xl cursor-pointer active:bg-bg transition-colors"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-text-tertiary mb-2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          <p className="text-xs text-text-tertiary">탭하여 사진 추가</p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-bg shadow-[var(--shadow-soft)]">
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => onDelete(photo)}
              className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/40 backdrop-blur-sm text-white rounded-full text-xs flex items-center justify-center active:bg-black/60 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
