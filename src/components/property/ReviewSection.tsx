import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import type { Review } from '../../types'

interface ReviewSectionProps {
  reviews: Review[]
  onSubmit: (userId: string, authorName: string, content: string) => Promise<void>
}

export function ReviewSection({ reviews, onSubmit }: ReviewSectionProps) {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState('')

  const myReview = reviews.find((r) => r.user_id === user?.id)

  const handleSubmit = async () => {
    if (!user || !content.trim()) return
    const name = user.email ?? '익명'
    await onSubmit(user.id, name, content.trim())
    setEditing(false)
  }

  const startEdit = () => {
    setContent(myReview?.content ?? '')
    setEditing(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">한줄평</h3>
        {!editing && (
          <button
            onClick={startEdit}
            className="flex items-center gap-1 text-sm text-primary font-medium min-h-[44px] px-2 active:opacity-70 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            {myReview ? '수정' : '작성'}
          </button>
        )}
      </div>

      {reviews.length === 0 && !editing && (
        <p className="text-sm text-text-tertiary text-center py-4">아직 한줄평이 없습니다.</p>
      )}

      <div className="space-y-2">
        {reviews.map((review) => (
          <div key={review.id} className={`rounded-xl p-3.5 ${review.user_id === user?.id ? 'bg-primary-light border border-primary/10' : 'bg-bg'}`}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#4f6cff] to-[#9f7afa] flex items-center justify-center">
                <span className="text-[9px] text-white font-bold">{review.author_name.charAt(0).toUpperCase()}</span>
              </div>
              <p className="text-xs font-medium text-text-secondary">{review.author_name}</p>
              {review.user_id === user?.id && (
                <span className="text-[10px] text-primary font-medium">나</span>
              )}
            </div>
            <p className="text-sm text-text leading-relaxed pl-7">{review.content}</p>
          </div>
        ))}
      </div>

      {editing && (
        <div className="mt-3 space-y-2.5">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="한줄평을 작성해주세요"
            maxLength={100}
            autoFocus
            className="w-full px-4 py-3.5 border border-border rounded-xl min-h-[48px] bg-[#f8f9fc] text-sm transition-all"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="flex-1 py-2.5 bg-gradient-to-r from-[#4f6cff] to-[#7c5cfc] text-white rounded-xl text-sm font-medium min-h-[44px] disabled:opacity-40 active:scale-[0.98] transition-transform"
            >
              저장
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-5 py-2.5 bg-bg border border-border rounded-xl text-sm text-text-secondary min-h-[44px] active:bg-border/30 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
