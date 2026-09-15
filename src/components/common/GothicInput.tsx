import { useState, forwardRef } from 'react'

interface GothicInputProps {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  icon?: string
  required?: boolean
  disabled?: boolean
  maxLength?: number
  className?: string
  autoComplete?: string
}

export const GothicInput = forwardRef<HTMLInputElement, GothicInputProps>(function GothicInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error,
  icon,
  required = false,
  disabled = false,
  maxLength,
  className = '',
  autoComplete,
}, ref) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <label className="block text-[var(--gothic-nature-light)] text-[10px] font-[var(--font-pixel)] uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-[#d03030] ml-1" aria-label="requerido">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-sm" aria-hidden="true">
            {icon}
          </div>
        )}

        <input
          ref={ref}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          required={required}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-invalid={!!error}
          aria-describedby={error ? `${label}-error` : undefined}
          className={`
            w-full rounded border-2 px-3 py-2 text-sm
            font-[var(--font-body)] outline-none transition-colors duration-150
            ${icon ? 'pl-10' : ''}
            ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
            ${error ? 'border-[#d03030]' : isFocused ? 'border-[var(--gothic-nature-light)]' : 'border-[var(--gothic-nature)]'}
          `}
          style={{
            backgroundColor: '#0a2a0a',
            color: 'var(--gothic-text)',
          }}
        />
      </div>

      {error && (
        <p
          id={`${label}-error`}
          className="flex items-center gap-1.5 mt-1 text-[#d03030] text-[10px]"
          role="alert"
        >
          <span aria-hidden="true">!</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  )
})
