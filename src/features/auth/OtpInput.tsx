import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
  disabled?: boolean
  invalid?: boolean
  onComplete?: (value: string) => void
}

/**
 * Single-digit boxes input. Always rendered LTR regardless of page direction
 * because OTP digits are entered left → right by convention.
 */
export function OtpInput({
  length = 5,
  value,
  onChange,
  autoFocus,
  disabled,
  invalid,
  onComplete,
}: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (value.length === length) onComplete?.(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, length])

  const focusAt = (i: number) => {
    if (i >= 0 && i < length) inputs.current[i]?.focus()
  }

  const handleChange = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, '').slice(-1)
    if (!v) return
    if (i > value.length) return
    const next = (value.slice(0, i) + v + value.slice(i + 1)).slice(0, length)
    onChange(next)
    focusAt(i + 1)
  }

  const handleKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace') {
      if (value[i]) {
        e.preventDefault()
        onChange(value.slice(0, i) + value.slice(i + 1))
      } else if (i > 0) {
        e.preventDefault()
        onChange(value.slice(0, i - 1) + value.slice(i))
        focusAt(i - 1)
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focusAt(i - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      focusAt(i + 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length)
    onChange(pasted)
    focusAt(Math.min(pasted.length, length - 1))
  }

  return (
    <div
      dir="ltr"
      className="flex justify-center gap-2"
      onPaste={handlePaste}
    >
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            'h-14 w-12 rounded-md border border-input bg-background text-center text-xl font-semibold shadow-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'disabled:cursor-not-allowed disabled:opacity-50',
            invalid &&
              'border-destructive ring-2 ring-destructive/30',
          )}
        />
      ))}
    </div>
  )
}
