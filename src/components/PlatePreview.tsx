interface PlatePreviewProps {
  plate: string
}

interface PlateParts {
  prefix: string
  code: string
  number: string
}

export function parsePlateParts(plate: string): PlateParts {
  if (/^[A-Z]/i.test(plate)) {
    // Embassy: prefix(1) + code(2) + number(4)
    return { prefix: plate[0] ?? 'D', code: plate.slice(1, 3), number: plate.slice(3) }
  }
  // UN: number(4) + prefix(1) + code(rest)
  return { prefix: plate[4] ?? 'D', code: plate.slice(5), number: plate.slice(0, 4) }
}

const BANNER_LABELS: Record<string, string> = {
  D: 'DIPLOMAT',
  C: 'CONSUL',
}

export function formatPlate(plate: string): string {
  if (!plate) return plate
  if (/^[A-Z]/i.test(plate)) {
    return plate.replace(/^(.+?)(\d{4})$/, '$1 $2')
  }
  return plate.replace(/^(\d+)(.+)$/, '$1 $2')
}

export function PlatePreview({ plate }: PlatePreviewProps) {
  const { prefix } = parsePlateParts(plate)
  const bannerLabel = BANNER_LABELS[prefix.toUpperCase()] ?? null
  const displayPlate = formatPlate(plate)
  return (
    <div className="flex justify-center">
      <svg
        aria-label="Plate preview"
        viewBox="0 0 480 240"
        className="w-full max-w-[300px] h-auto rounded-lg overflow-hidden"
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
      >
        <rect width="480" height="240" rx="12" fill="#5bb8d4" />
        <path d="M0 0 L480 0 L480 65 Q240 42 0 65 Z" fill="#c41e3a" />
        {bannerLabel && (
          <text
            x="240"
            y="28"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'Bebas Neue', 'Arial Narrow', Arial, sans-serif"
            fontSize="22"
            fontWeight="400"
            letterSpacing="6"
            fill="#ffffff"
          >
            {bannerLabel}
          </text>
        )}
        <text
          x="240"
          y="152"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Bebas Neue', 'Arial Narrow', Arial, sans-serif"
          fontSize="96"
          fontWeight="400"
          fill="#1a1a1a"
        >
          {displayPlate}
        </text>
        {/* Screws */}
        <circle cx="30" cy="28" r="6" fill="#8b2025" stroke="#721a1e" strokeWidth="1" />
        <circle cx="450" cy="28" r="6" fill="#8b2025" stroke="#721a1e" strokeWidth="1" />
        <circle cx="30" cy="212" r="6" fill="#3a8daa" stroke="#2e7a95" strokeWidth="1" />
        <circle cx="450" cy="212" r="6" fill="#3a8daa" stroke="#2e7a95" strokeWidth="1" />
      </svg>
    </div>
  )
}
