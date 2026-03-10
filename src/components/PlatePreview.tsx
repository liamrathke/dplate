interface PlatePreviewProps {
  plate: string
}

export function PlatePreview({ plate }: PlatePreviewProps) {
  return (
    <div className="flex justify-center">
      <svg
        viewBox="0 0 480 240"
        className="w-full max-w-[300px] h-auto rounded-lg overflow-hidden"
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
      >
        <rect width="480" height="240" rx="12" fill="#5bb8d4" />
        <path d="M0 0 L480 0 L480 65 Q240 42 0 65 Z" fill="#c41e3a" />
        <text
          x="240"
          y="28"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="18"
          fontWeight="700"
          letterSpacing="3"
          fill="#ffffff"
        >
          DIPLOMAT
        </text>
        <text
          x="240"
          y="152"
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Arial Black', Arial, Helvetica, sans-serif"
          fontSize="68"
          fontWeight="900"
          fill="#1a1a1a"
        >
          {plate}
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
