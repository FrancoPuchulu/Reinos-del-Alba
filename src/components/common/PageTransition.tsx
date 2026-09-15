import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

const CURVE = [0.16, 1, 0.3, 1] as const

const contentVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.35, delay: 0.18, ease: CURVE },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12 },
  },
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      className="relative w-full h-full overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Page content */}
      <motion.div
        variants={contentVariants}
        className="w-full h-full"
      >
        {children}
      </motion.div>

      {/* Gothic curtain overlay */}
      <motion.div
        className="absolute inset-0 z-layer-transition pointer-events-none"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        exit={{ x: '-100%' }}
        transition={{ duration: 0.6, ease: CURVE }}
      >
        {/* Main curtain panel */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #060608 0%, #0c0c18 40%, #0a0a14 60%, #060608 100%)',
          }}
        />

        {/* Left gold border */}
        <div
          className="absolute top-0 bottom-0 left-0 w-[3px]"
          style={{ background: 'var(--wow-border-gold-bright, #c0a860)' }}
        />

        {/* Right gold border */}
        <div
          className="absolute top-0 bottom-0 right-0 w-[3px]"
          style={{ background: 'var(--wow-border-gold-bright, #c0a860)' }}
        />

        {/* Horizontal gold accent lines */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, var(--wow-border, #4a4a3a), var(--wow-border-gold-bright, #c0a860), var(--wow-border, #4a4a3a))' }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, var(--wow-border, #4a4a3a), var(--wow-border-gold-bright, #c0a860), var(--wow-border, #4a4a3a))' }}
        />

        {/* Center glow shimmer */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(192,168,96,0.06) 0%, transparent 60%)',
          }}
        />

        {/* Center diamond emblem */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: 45 }}
            animate={{ scale: 1, opacity: 0.4, rotate: 45 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.4, ease: CURVE, delay: 0.1 }}
            className="w-5 h-5 border-2 border-[var(--wow-border-gold-bright, #c0a860)]"
            style={{
              boxShadow: '0 0 12px rgba(192,168,96,0.3), inset 0 0 8px rgba(192,168,96,0.15)',
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}
