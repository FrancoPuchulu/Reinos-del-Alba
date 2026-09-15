import React from 'react'
import { motion } from 'framer-motion'

interface TooltipProps {
  content: string
  x: number
  y: number
  visible: boolean
  children?: React.ReactNode
}

export const Tooltip = React.memo(function Tooltip({ content, x, y, visible, children }: TooltipProps) {
  return (
    <>
      {children}
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="fixed z-layer-tooltip pointer-events-none"
          style={{ left: x + 10, top: y + 10 }}
        >
          <div
            className="px-3 py-2 text-xs font-[var(--font-body)] text-[var(--gothic-text)] bg-[#0c0a06] border-2 border-[var(--gothic-border)] rounded max-w-[200px] whitespace-pre-line"
          >
            {content}
          </div>
        </motion.div>
      )}
    </>
  )
})
