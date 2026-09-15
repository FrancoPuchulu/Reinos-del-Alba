import React from 'react'
import { motion } from 'framer-motion'

interface GothicButtonProps {
  children: React.ReactNode
  id?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold' | 'wow' | 'wow-gold' | 'blood'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  icon?: string
  fullWidth?: boolean
  type?: 'button' | 'submit'
  role?: string
  'aria-selected'?: boolean
  'aria-label'?: string
}

const VARIANT_STYLES = {
  primary: {
    bg: '#2a2018',
    border: '#8a6a30',
    text: '#d0c0a0',
    bgHover: '#3a2a18',
  },
  secondary: {
    bg: '#201810',
    border: 'var(--gothic-border)',
    text: '#b0a088',
    bgHover: '#302018',
  },
  danger: {
    bg: '#301010',
    border: '#802020',
    text: '#d0b0b0',
    bgHover: '#401818',
  },
  ghost: {
    bg: 'transparent',
    border: '#5a4030',
    text: 'var(--gothic-gold-copper)',
    bgHover: '#1a1008',
  },
  gold: {
    bg: 'var(--gothic-gold-copper)',
    border: '#d4a050',
    text: '#1a1008',
    bgHover: '#d0a050',
  },
  wow: {
    bg: '#1a1210',
    border: 'var(--gothic-border)',
    text: '#d0c0a0',
    bgHover: '#2a1c14',
  },
  'wow-gold': {
    bg: '#1a1210',
    border: '#8a6a30',
    text: 'var(--gothic-gold-copper)',
    bgHover: '#2a1c14',
  },
  blood: {
    bg: 'var(--blasphemous-shadow)',
    border: 'var(--blasphemous-blood)',
    text: 'var(--blasphemous-blood-fresh)',
    bgHover: '#1a0808',
  },
}

const SIZE_STYLES = {
  sm: 'px-3 py-1.5 text-[10px]',
  md: 'px-5 py-2 text-[11px]',
  lg: 'px-8 py-3 text-xs',
}

export const GothicButton = React.memo(function GothicButton({
  children,
  id,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false,
  type = 'button',
  role: roleProp,
  'aria-selected': ariaSelected,
  'aria-label': ariaLabel,
}: GothicButtonProps) {
  const style = VARIANT_STYLES[variant]
  const sizeStyle = SIZE_STYLES[size]
  const isWow = variant === 'wow' || variant === 'wow-gold'
  const isGoldVariant = variant === 'gold' || variant === 'wow-gold'
  const isBlood = variant === 'blood'

  const getHoverShadow = () => {
    if (isGoldVariant) {
      return 'inset 0 0 12px 2px rgba(192,144,64,0.45), 0 0 10px 1px rgba(192,144,64,0.25)'
    }
    if (isWow) {
      return 'inset 0 0 10px 2px rgba(192,144,64,0.25), 0 0 8px 1px rgba(192,144,64,0.15)'
    }
    if (variant === 'danger') {
      return 'inset 0 0 10px 2px rgba(160,16,32,0.35)'
    }
    if (variant === 'ghost') {
      return 'inset 0 0 8px 2px rgba(192,144,64,0.2)'
    }
    return 'inset 0 0 10px 2px rgba(192,144,64,0.3), 0 0 8px 1px rgba(192,144,64,0.15)'
  }

  return (
    <motion.button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      role={roleProp}
      aria-selected={ariaSelected}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={`
        relative overflow-hidden border-2 font-[var(--font-pixel)] uppercase tracking-wider
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wow-border-gold-bright)]
        ${isWow ? 'rounded-none' : 'rounded'}
        ${isBlood ? 'border-rust text-blood-dry rounded-none' : ''}
        ${sizeStyle}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-30 cursor-not-allowed grayscale-[0.5]' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        color: style.text,
      }}
      whileHover={
        !disabled
          ? {
              backgroundColor: style.bgHover,
              boxShadow: getHoverShadow(),
              y: -1,
            }
          : {}
      }
      whileTap={!disabled ? { scale: 0.97, y: 0 } : {}}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17,
      }}
    >
      {(isGoldVariant || isBlood) && (
        <motion.span
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%)',
          }}
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  )
})
