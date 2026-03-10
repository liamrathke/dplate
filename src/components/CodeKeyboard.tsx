import { ChevronDown } from 'lucide-react'
import { getValidCharsForPosition } from '../data/missions'
import { cn } from '../lib/utils'

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
]

interface CodeKeyboardProps {
  value: string
  onChange: (value: string) => void
  onHide: () => void
}

export function CodeKeyboard({ value, onChange, onHide }: CodeKeyboardProps) {
  const position = value.length as 0 | 1
  const validChars =
    position < 2
      ? getValidCharsForPosition(position, value[0])
      : new Set<string>()

  const handleKey = (key: string) => {
    if (value.length < 2 && validChars.has(key)) {
      onChange(value + key)
    }
  }

  const handleBackspace = () => {
    onChange(value.slice(0, -1))
  }

  const handleClear = () => {
    onChange('')
  }

  return (
    <div className="w-full pb-2">
      {/* Display current input + hide button */}
      <div className="grid grid-cols-3 items-center px-2 mb-3">
        <div>
          {value.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-muted-foreground px-2 py-1 rounded bg-secondary"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex gap-1.5 justify-center">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={cn(
                'w-10 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-bold',
                i < value.length
                  ? 'border-primary bg-primary/20 text-primary'
                  : i === value.length
                    ? 'border-primary/50 bg-card'
                    : 'border-border bg-card',
              )}
            >
              {value[i] || ''}
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onHide}
            className="flex items-center gap-1 text-xs text-muted-foreground px-2 py-1.5 rounded-lg bg-secondary active:bg-secondary/80"
          >
            <ChevronDown size={14} />
            Hide
          </button>
        </div>
      </div>

      {/* Keyboard rows */}
      {ROWS.map((row, rowIdx) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: Fine for now
          key={rowIdx}
          className="flex justify-center gap-[3px] mb-[3px]"
        >
          {rowIdx === 2 && <div className="w-4" />}
          {row.map((key) => {
            const isEnabled = value.length < 2 && validChars.has(key)
            return (
              <button
                type="button"
                key={key}
                onClick={() => handleKey(key)}
                disabled={!isEnabled}
                className={cn(
                  'h-11 min-w-[32px] flex-1 max-w-[36px] rounded-md text-sm font-semibold transition-colors',
                  isEnabled
                    ? 'bg-card text-foreground active:bg-primary active:text-primary-foreground'
                    : 'bg-secondary/40 text-muted-foreground/30',
                )}
              >
                {key}
              </button>
            )
          })}
          {rowIdx === 2 && (
            <button
              type="button"
              onClick={handleBackspace}
              className="h-11 w-14 rounded-md bg-card text-foreground flex items-center justify-center active:bg-secondary"
            >
              <svg
                aria-label="Backspace"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
