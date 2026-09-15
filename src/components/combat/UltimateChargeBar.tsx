import { motion } from 'framer-motion'

interface UltimateChargeBarProps {
  charge: number
  resourceLabel: string
  side?: 'player' | 'enemy'
  isReady?: boolean
}

const RESOURCE_COLORS: Record<string, string> = {
  'Ira': '#c03030',
  'Maná Ancestral': '#3060c0',
  'Energía Vital': '#30a030',
  'Infernalidad': '#8030b0',
}

export function UltimateChargeBar({ charge, resourceLabel, isReady = false }: UltimateChargeBarProps) {
  const color = RESOURCE_COLORS[resourceLabel] ?? '#c09040'
  const pct = Math.max(0, Math.min(100, charge))

  return (
    <div className="w-full" role="meter" aria-label={`${resourceLabel}: ${Math.floor(pct)}%`} aria-valuenow={Math.floor(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[8px] font-[var(--font-pixel)] tracking-wider uppercase" style={{ color }}>
          {isReady ? '★ LISTO' : resourceLabel}
        </span>
        <span className="text-[8px] font-mono" style={{ color }}>
          {Math.floor(pct)}%
        </span>
      </div>
      <div className={`relative h-1.5 border bg-[#080604] overflow-hidden ${isReady ? 'border-amber-500 shadow-[0_0_6px_rgba(234,179,8,0.4)]' : 'border-[var(--gothic-border)]'}`}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0"
          style={{
            backgroundColor: isReady ? '#d4a017' : color,
            boxShadow: isReady ? `0 0 8px ${color}80` : 'none',
          }}
        />
        {isReady && (
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }}
          />
        )}
      </div>
    </div>
  )
}
