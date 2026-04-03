interface RatingStarsProps {
  value: number
  onChange?: (rating: number) => void
  size?: 'sm' | 'md'
}

export function RatingStars({ value, onChange, size = 'md' }: RatingStarsProps) {
  const starSize = size === 'sm' ? 'text-base' : 'text-2xl'

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star === value ? 0 : star)}
          className={`${starSize} min-w-[44px] min-h-[44px] flex items-center justify-center ${
            onChange ? 'cursor-pointer' : 'cursor-default'
          }`}
        >
          {star <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  )
}
