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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-text">한줄평</h3>
        {!editing && (
          <button
            onClick={startEdit}
            className="text-[14px] text-primary font-semibold min-h-[44px] flex items-center active:opacity-60 transition-opacity"
          >
            {myReview ? '수정' : '작성하기'}
          </button>
        )}
      </div>

      {reviews.length === 0 && !editing && (
        <p className="text-[14px] text-text-tertiary text-center py-6">아직 한줄평이 없어요</p>
      )}

      <div className="space-y-0 divide-y divide-[#f2f4f6]">
        {reviews.map((review) => (
          <div key={review.id} className="py-3.5 first:pt-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-[#f2f4f6] flex items-center justify-center">
                <span className="text-[11px] text-text-secondary font-bold">{review.author_name.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-[13px] font-medium text-text">{review.author_name}</span>
              {review.user_id === user?.id && (
                <span className="text-[11px] text-primary font-semibold bg-primary-light px-1.5 py-0.5 rounded">나</span>
              )}
            </div>
            <p className="text-[14px] text-text-secondary leading-relaxed pl-8">{review.content}</p>
          </div>
        ))}
      </div>

      {editing && (
        <div className="mt-3 space-y-3">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="한줄평을 작성해주세요"
            maxLength={100}
            autoFocus
            className="w-full px-4 py-3.5 bg-[#f2f4f6] rounded-xl min-h-[50px] text-[15px] border-0 placeholder:text-text-tertiary"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="flex-1 py-3 bg-primary text-white rounded-xl text-[14px] font-semibold min-h-[48px] disabled:opacity-40 active:bg-primary-dark transition-colors"
            >
              저장
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-5 py-3 bg-[#f2f4f6] rounded-xl text-[14px] text-text-secondary font-medium min-h-[48px] active:bg-[#e5e8eb] transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
