import { motion } from 'framer-motion'
import { dispatch } from '@/store/GameStore'

interface TopNavBarProps {
  activeTab?: string
  onTabChange?: (tabId: string) => void
}

const GAME_TABS: { id: string; label: string; icon: string }[] = [
  { id: 'book', label: 'Aventura', icon: '📜' },
  { id: 'inventory', label: 'Inventario', icon: '🎒' },
  { id: 'talents', label: 'Talentos', icon: '🌟' },
  { id: 'raids', label: 'Raids', icon: '⚔️' },
]

export default function TopNavBar({ activeTab, onTabChange }: TopNavBarProps) {
  const tabs = [
    ...GAME_TABS.map(t => ({
      ...t,
      onClick: () => onTabChange?.(t.id),
    })),
    {
      id: 'shop',
      label: 'Tienda',
      icon: '⚒️',
      onClick: () => dispatch({ type: 'SET_SCREEN', payload: 'shop' }),
    },
  ]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-layer-header border-b-2 border-[var(--gothic-border)]"
      style={{ background: 'rgba(8, 6, 4, 0.95)', backdropFilter: 'blur(8px)' }}
      role="navigation"
      aria-label="Navegacion principal"
    >
      <div className="flex items-center gap-1 px-2 py-1.5">
        {/* Brand */}
        <span className="text-ember text-[9px] font-[var(--font-pixel)] tracking-wider uppercase shrink-0 mr-2 hidden sm:block">
          Reinos
        </span>

        {/* Tabs */}
        {tabs.map(({ id, label, icon, onClick }) => (
          <button
            key={id}
            onClick={onClick}
            className={`relative flex items-center justify-center gap-1.5 px-3 py-1.5 text-[9px] font-[var(--font-pixel)] tracking-wider uppercase cursor-pointer transition-all border-2 ${
              activeTab === id
                ? 'border-[var(--gothic-gold)] text-[var(--gothic-gold-bright)] bg-[var(--gothic-bg-slot)]'
                : 'border-transparent text-[var(--gothic-text-dim)] hover:text-[var(--gothic-text)] hover:border-[var(--gothic-border-dim)]'
            }`}
            aria-selected={activeTab === id}
            role="tab"
            aria-label={label}
          >
            {activeTab === id && (
              <motion.div
                layoutId="top-nav-indicator"
                className="absolute inset-0 border-2 border-[var(--gothic-gold)] bg-[var(--gothic-bg-slot)]"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10 text-xs">{icon}</span>
            <span className="relative z-10 hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
