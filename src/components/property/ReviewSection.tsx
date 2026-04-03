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
      <h3 className="text-sm font-semibold text-text-secondary mb-3">한줄평</h3>
      <div className="space-y-2">
        {reviews.map((review) => (
          <div key={review.id} className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-text-secondary mb-1">{review.author_name}</p>
            <p className="text-sm text-text">{review.content}</p>
          </div>
        ))}
      </div>
      {editing ? (
        <div className="mt-3 space-y-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="한줄평을 작성해주세요"
            maxLength={100}
            className="w-full px-3 py-3 border border-border rounded-lg min-h-[44px]"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium min-h-[44px]"
            >
              저장
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 border border-border rounded-lg text-sm min-h-[44px]"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={startEdit}
          className="mt-3 text-sm text-primary font-medium min-h-[44px] px-2"
        >
          {myReview ? '내 한줄평 수정' : '한줄평 작성하기'}
        </button>
      )}
    </div>
  )
}
