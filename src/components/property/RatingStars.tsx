interface RatingStarsProps {
  value: number
  onChange?: (rating: number) => void
  size?: 'sm' | 'md'
}

export function RatingStars({ value, onChange, size = 'md' }: RatingStarsProps) {
  const s = size === 'sm' ? 16 : 24

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value
        return (
          <button
            key={star}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(star === value ? 0 : star)}
            className={`${onChange ? 'min-w-[44px] min-h-[44px]' : size === 'sm' ? 'min-w-[20px] min-h-[20px]' : 'min-w-[30px] min-h-[30px]'} flex items-center justify-center ${
              onChange ? 'cursor-pointer active:scale-110 transition-transform' : 'cursor-default'
            }`}
          >
            <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? '#ffb800' : 'none'} stroke={filled ? '#ffb800' : '#d1d6db'} strokeWidth="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </button>
        )
      })}
    </div>
  )
}
