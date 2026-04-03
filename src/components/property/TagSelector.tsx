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
            className={`px-3.5 py-2 rounded-xl text-sm min-h-[36px] border transition-all active:scale-95 ${
              isSelected
                ? 'bg-gradient-to-r from-[#4f6cff] to-[#7c5cfc] text-white border-transparent shadow-[0_2px_8px_rgba(79,108,255,0.25)]'
                : 'bg-card text-text-secondary border-border/70 shadow-[var(--shadow-soft)]'
            }`}
          >
            {isSelected && <span className="mr-1">&#10003;</span>}
            {tag}
          </button>
        )
      })}
    </div>
  )
}
