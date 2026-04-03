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
            className={`px-3 py-1.5 rounded-full text-sm min-h-[36px] border transition-colors ${
              isSelected
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-text-secondary border-border'
            }`}
          >
            {tag}
          </button>
        )
      })}
    </div>
  )
}
