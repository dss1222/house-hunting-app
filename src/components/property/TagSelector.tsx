import { TAG_OPTIONS } from '../../lib/constants'

interface TagSelectorProps {
  selected: string[]
  onChange: (tags: string[]) => void
}

export function TagSelector({ selected, onChange }: TagSelectorProps) {
  const toggle = (tag: string) => {
    onChange(
      selected.includes(tag)
        ? selected.filter((t) => t !== tag)
        : [...selected, tag]
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {TAG_OPTIONS.map((tag) => {
        const isSelected = selected.includes(tag)
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`px-4 py-2.5 rounded-full text-[14px] min-h-[40px] transition-colors active:scale-95 ${
              isSelected
                ? 'bg-[#3182f6] text-white font-semibold'
                : 'bg-[#f2f4f6] text-[#4e5968] font-medium'
            }`}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
