import { type Category, CategoryEnum } from '../types'

interface CategoryLabelProps {
  category: Category
  compact?: boolean
}

const COMPACT_LABELS: Record<Category, string> = {
  [CategoryEnum.AFRICA]: 'AFR',
  [CategoryEnum.ASIA]: 'ASI',
  [CategoryEnum.EUROPE]: 'EUR',
  [CategoryEnum.AMERICAS]: 'AME',
  [CategoryEnum.OCEANIA]: 'OCE',
  [CategoryEnum.INTERNATIONAL]: 'INT',
  [CategoryEnum.UNKNOWN]: 'UNK',
}

const LABEL_COLORS: Record<Category, string> = {
  [CategoryEnum.AFRICA]: '#c2410c',
  [CategoryEnum.ASIA]: '#b91c1c',
  [CategoryEnum.EUROPE]: '#1d4ed8',
  [CategoryEnum.AMERICAS]: '#15803d',
  [CategoryEnum.OCEANIA]: '#0e7490',
  [CategoryEnum.INTERNATIONAL]: '#6d28d9',
  [CategoryEnum.UNKNOWN]: '#475569',
}

export function CategoryLabel({
  category,
  compact = false,
}: CategoryLabelProps) {
  const label = compact ? COMPACT_LABELS[category] : category
  return (
    <span
      className="text-[11px] px-2 py-0.5 m-1 rounded-md text-white whitespace-nowrap"
      style={{ backgroundColor: LABEL_COLORS[category] }}
    >
      {label}
    </span>
  )
}
