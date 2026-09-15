import { motion } from 'framer-motion'
import { GAME_CONFIG } from '@/config/game'

export function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      className="fixed inset-0 flex flex-col items-center justify-center gothic-bg"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center"
      >
        <div className="mb-6 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--gothic-nature-light)] bg-[var(--gothic-nature-dark)] flex items-center justify-center">
            <span className="text-[var(--gothic-nature-light)] text-lg">&#9876;</span>
          </div>
        </div>

        <h1
          className="text-3xl md:text-4xl font-[var(--font-pixel)] text-[var(--gothic-text)] uppercase leading-tight"
          style={{ textShadow: '2px 2px 0 var(--gothic-nature-dark)' }}
        >
          {GAME_CONFIG.TITLE}
        </h1>

        <motion.p
          className="text-[10px] text-[var(--gothic-nature-light)] font-[var(--font-pixel)] tracking-wider uppercase mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {GAME_CONFIG.SUBTITLE}
        </motion.p>
      </motion.div>

      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-[var(--gothic-nature)] text-[9px] font-[var(--font-pixel)] tracking-widest uppercase animate-blink">
          Cargando...
        </p>
      </motion.div>
    </motion.div>
  )
}
