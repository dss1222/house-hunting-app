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
            className={`px-4 py-2.5 rounded-xl text-[12px] font-medium min-h-[40px] transition-colors active:scale-95 ${
              isSelected
                ? 'bg-[#1a3a5c] text-[#3182f6]'
                : 'bg-[#2c2c35] text-[#8b95a1]'
            }`}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
