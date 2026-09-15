import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface GothicContextMenuProps {
  x: number
  y: number
  onClose: () => void
  actions: { label: string; onClick: () => void; disabled?: boolean }[]
}

export const GothicContextMenu = React.memo(function GothicContextMenu({ x, y, onClose, actions }: GothicContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const adjustedX = Math.min(x + 4, window.innerWidth - 180)
  const adjustedY = Math.min(y + 4, window.innerHeight - actions.length * 36 - 16)

  return createPortal(
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.1 }}
        className="fixed z-[9999] min-w-[160px] pointer-events-auto"
        style={{ left: adjustedX, top: adjustedY }}
      >
        <div
          className="border-2 rounded-none py-1"
          style={{
            backgroundColor: 'var(--gothic-bg-dark)',
            borderColor: 'var(--gothic-border)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.8), 0 0 1px var(--gothic-border)',
          }}
        >
          {actions.map((action, i) => (
            <button
              key={`${action.label}-${i}`}
              onClick={() => {
                if (!action.disabled) {
                  action.onClick()
                  onClose()
                }
              }}
              disabled={action.disabled}
              className={`
                w-full px-4 py-2 text-left text-xs font-[var(--font-pixel)]
                transition-colors cursor-pointer
                ${action.disabled
                  ? 'text-[var(--gothic-text-dim)] opacity-50 cursor-not-allowed'
                  : 'text-[var(--gothic-gold-copper)] hover:text-[var(--gothic-gold-bright)] hover:bg-[var(--gothic-bg-panel)]'
                }
              `}
              style={
                i < actions.length - 1
                  ? { borderBottom: `1px solid var(--gothic-border-dim)` }
                  : {}
              }
            >
              {action.label}
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
})
