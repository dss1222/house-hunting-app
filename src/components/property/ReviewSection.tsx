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
        <h3 className="text-[18px] font-bold text-text">한줄평</h3>
        {!editing && (
          <button
            onClick={startEdit}
            className="text-[14px] text-[#3182f6] font-semibold min-h-[44px] active:opacity-50 transition-opacity"
          >
            {myReview ? '수정' : '작성하기'}
          </button>
        )}
      </div>

      {reviews.length === 0 && !editing && (
        <p className="text-[14px] text-text-tertiary text-center py-8">아직 한줄평이 없어요</p>
      )}

      <div>
        {reviews.map((review, idx) => (
          <div key={review.id} className={`py-4 ${idx < reviews.length - 1 ? 'border-b border-[#f2f4f6]' : ''}`}>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-[#f2f4f6] flex items-center justify-center">
                <span className="text-[12px] text-text-secondary font-bold">{review.author_name.charAt(0).toUpperCase()}</span>
              </div>
              <span className="text-[14px] font-semibold text-text">{review.author_name}</span>
              {review.user_id === user?.id && (
                <span className="text-[11px] text-[#3182f6] font-bold bg-[#e8f3ff] px-2 py-0.5 rounded-md">나</span>
              )}
            </div>
            <p className="text-[15px] text-text-secondary leading-relaxed pl-[38px]">{review.content}</p>
          </div>
        ))}
      </div>

      {editing && (
        <div className="mt-2 space-y-3">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="한줄평을 작성해주세요"
            maxLength={100}
            autoFocus
            className="w-full h-[52px] px-4 bg-[#f2f4f6] rounded-2xl text-[15px] text-text placeholder:text-[#b0b8c1] border-2 border-transparent focus:border-[#3182f6] focus:bg-white transition-all"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="toss-btn flex-1 h-[50px] bg-[#3182f6] text-white rounded-2xl text-[15px] disabled:bg-[#b0b8c1]"
            >
              저장
            </button>
            <button
              onClick={() => setEditing(false)}
              className="toss-btn h-[50px] px-6 bg-[#f2f4f6] rounded-2xl text-[15px] text-text-secondary"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
