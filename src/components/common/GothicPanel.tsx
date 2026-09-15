import React from 'react'
import { motion } from 'framer-motion'

interface GothicPanelProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  variant?: 'ornate' | 'iron' | 'dark' | 'scroll' | 'wow' | 'wow-gold' | 'blasphemous'
  animate?: boolean
  noPadding?: boolean
  headerDecoration?: boolean
}

export const GothicPanel = React.memo(function GothicPanel({
  children,
  className = '',
  title,
  subtitle,
  variant = 'ornate',
  animate = true,
  noPadding = false,
}: GothicPanelProps) {
  const variantStyles = {
    ornate: 'bg-[#181008]/95 border-[#5a4030]',
    iron: 'bg-[#1a1210]/95 border-[var(--gothic-border)]',
    dark: 'bg-[#0c0a06]/95 border-[#301c10]',
    scroll: 'bg-[#1a1408]/95 border-[#5a4030]',
    wow: 'bg-[#181210] border-[var(--gothic-border)] rounded-none',
    'wow-gold': 'bg-[#181210] border-[#8a6a30] rounded-none',
    blasphemous: 'bg-[var(--blasphemous-shadow)] border-[var(--blasphemous-iron-rust)] border-rust rounded-none glow-gold',
  }

  const content = (
    <div className={`relative rounded border-2 ${variantStyles[variant]} overflow-hidden ${className}`}>
      {title && (
        <div className={`px-3 py-2 border-b-2 border-inherit ${
          (variant === 'wow' || variant === 'wow-gold') ? 'bg-[#201810]' : 'bg-[#2a1c10]/60'
        }`}>
          <h2 className="text-[10px] font-[var(--font-pixel)] text-center uppercase tracking-wider text-[var(--gothic-gold-copper)]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[10px] text-center mt-0.5 text-[var(--gothic-text-dim)]">
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'p-3'}>
        {children}
      </div>
    </div>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {content}
      </motion.div>
    )
  }

  return content
})
