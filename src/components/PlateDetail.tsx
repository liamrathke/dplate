/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
import confetti from 'canvas-confetti'
import { Check, Share2, Trash2, X } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { cn } from '../lib/utils'
import type { MissionEntry, Sighting } from '../types'
import { CategoryLabel } from './CategoryLabel'
import { formatPlate, PlatePreview } from './PlatePreview'

const PREFIXES = ['D', 'S', 'C', 'J', 'E'] as const
type PlateType = 'embassy' | 'un'

interface FormValues {
  plateType: PlateType
  prefix: string
  number: string
  date: string
  notes: string
}

function parsePlate(
  plate: string,
  code: string,
): { plateType: PlateType; prefix: string; number: string } {
  if (!plate) return { plateType: 'embassy', prefix: 'D', number: '0001' }

  const codeIndex = plate.indexOf(code)
  if (codeIndex === -1)
    return { plateType: 'embassy', prefix: 'D', number: '0001' }

  if (codeIndex <= 1) {
    // Embassy format: prefix + code + number
    const prefix = plate.substring(0, codeIndex) || 'D'
    const number = plate.substring(codeIndex + code.length) || '0001'
    return { plateType: 'embassy', prefix, number }
  }
  // UN format: number + prefix + code
  const prefix = plate[codeIndex - 1] || 'D'
  const number = plate.substring(0, codeIndex - 1) || '0001'
  return { plateType: 'un', prefix, number }
}

interface PlateDetailProps {
  entry: MissionEntry
  sighting: Sighting | null
  onClose: () => void
  onMarkSeen: (code: string, sighting: Sighting) => void
  onMarkUnseen: (code: string) => void
}

export function PlateDetail({
  entry,
  sighting,
  onClose,
  onMarkSeen,
  onMarkUnseen,
}: PlateDetailProps) {
  const parsed = sighting ? parsePlate(sighting.plate, entry.code) : null
  const isSeen = sighting !== null

  const { register, handleSubmit, watch, setValue, control } =
    useForm<FormValues>({
      defaultValues: {
        plateType: parsed?.plateType ?? 'embassy',
        prefix: parsed?.prefix ?? 'D',
        number: parsed?.number ?? '0001',
        date: sighting?.date ?? new Date().toISOString().split('T')[0],
        notes: sighting?.notes ?? '',
      },
    })

  const [plateType, prefix, number, notes] = watch([
    'plateType',
    'prefix',
    'number',
    'notes',
  ])

  const composedPlate =
    plateType === 'embassy'
      ? `${prefix}${entry.code}${number}`
      : `${number}${prefix}${entry.code}`

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const onSubmit = (data: FormValues) => {
    const plate =
      data.plateType === 'embassy'
        ? `${data.prefix}${entry.code}${data.number}`
        : `${data.number}${data.prefix}${entry.code}`
    onMarkSeen(entry.code, {
      date: data.date,
      plate,
      notes: data.notes.trim() || undefined,
    })
    if (!isSeen) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: entry.flagColors,
      })
    }
    onClose()
  }

  const handleRemove = () => {
    onMarkUnseen(entry.code)
    onClose()
  }

  const handleShare = async () => {
    const text = `🚗 Spotted a diplomatic plate! ${entry.emoji} ${entry.code} — ${entry.mission} (${formatPlate(composedPlate)})`
    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch {
        // User cancelled share
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Sheet */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative w-full max-w-lg bg-card rounded-t-2xl p-5 pb-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Handle */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-secondary text-muted-foreground"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-4xl">{entry.emoji}</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl font-bold font-mono">{entry.code}</span>
            <p className="text-muted-foreground text-xl">{entry.mission}</p>
            <CategoryLabel category={entry.category} />
            {isSeen && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-seen/20 text-seen text-xs font-medium">
                <Check size={12} />
                Seen
              </span>
            )}
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          {/* Plate preview */}
          <PlatePreview plate={composedPlate} />

          {/* Embassy / UN toggle */}
          <Controller
            name="plateType"
            control={control}
            render={({ field }) => (
              <div className="flex gap-1 p-1 bg-secondary rounded-xl">
                {(['embassy', 'un'] as const).map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => field.onChange(type)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-xs font-medium transition-colors',
                      field.value === type
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {type === 'embassy' ? 'Embassy' : 'UN'}
                  </button>
                ))}
              </div>
            )}
          />

          {/* Prefix + Number */}
          <div className="flex gap-3 items-end">
            <div>
              <label
                htmlFor="prefix-select"
                className="text-sm text-muted-foreground mb-1 block"
              >
                Prefix
              </label>
              <select
                id="prefix-select"
                {...register('prefix')}
                className="h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-8"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                }}
              >
                {PREFIXES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label
                htmlFor="number-input"
                className="text-sm text-muted-foreground mb-1 block"
              >
                Number
              </label>
              <input
                id="number-input"
                type="text"
                inputMode="numeric"
                className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                {...register('number', {
                  onChange: (e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4)
                    setValue('number', val, { shouldDirty: true })
                  },
                })}
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="date-input"
              className="text-sm text-muted-foreground mb-1 block"
            >
              Date Spotted
            </label>
            <input
              id="date-input"
              type="date"
              className="w-full h-11 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('date')}
            />
          </div>

          {/* Notes */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label
                htmlFor="notes-input"
                className="text-sm text-muted-foreground"
              >
                Notes
              </label>
              <span className="text-xs text-muted-foreground/60">
                {notes.length}/512
              </span>
            </div>
            <textarea
              id="notes-input"
              rows={3}
              maxLength={512}
              placeholder="Add a note about this sighting…"
              className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-muted-foreground/50"
              {...register('notes', {
                onChange: (e) => {
                  setValue('notes', e.target.value.slice(0, 512))
                },
              })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            className={cn(
              'flex-1 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors',
              'bg-primary text-primary-foreground active:bg-primary/80',
            )}
          >
            <Check size={18} />
            {isSeen ? 'Update' : 'Mark as Seen'}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="h-12 w-12 rounded-xl bg-secondary text-foreground flex items-center justify-center active:bg-secondary/80"
          >
            <Share2 size={18} />
          </button>
          {isSeen && (
            <button
              type="button"
              onClick={handleRemove}
              className="h-12 w-12 rounded-xl bg-destructive/20 text-destructive flex items-center justify-center active:bg-destructive/30"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </form>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
