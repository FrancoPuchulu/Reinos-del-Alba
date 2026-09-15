import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { dispatch } from '@/store/GameStore'
import type { StatBlock } from '@/types/game.types'
import { RARITY_COLORS } from '@/constants/theme'
import { GothicContextMenu } from './GothicContextMenu'

interface SlotItem {
  id?: string
  name: string
  rarity: string
  slot?: string
  icon?: string
  description?: string
  baseDamage?: number
  durability?: number
  maxDurability?: number
  stats?: StatBlock
  price?: number
}

interface InventorySlotProps {
  item: SlotItem | null
  size?: 'sm' | 'md'
  onEquip?: boolean
}

export const InventorySlot = React.memo(function InventorySlot({ item, size = 'md', onEquip = true }: InventorySlotProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const isBroken = item != null && item.durability === 0
  const isSmall = size === 'sm'
  const slotSize = isSmall ? 'w-9 h-9' : 'w-11 h-11'
  const iconSize = isSmall ? 'text-[8px]' : 'text-[10px]'

  const dur = item?.durability
  const maxDur = item?.maxDurability
  const durabilityPct = (dur != null && maxDur != null && maxDur > 0) ? (dur / maxDur) * 100 : null

  const rarityColor = item?.rarity ? RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] : null

  const handleEquip = useCallback(() => {
    if (onEquip && item?.slot && item.id && !isBroken) {
      dispatch({ type: 'EQUIP_ITEM', payload: item.id })
    }
  }, [onEquip, item, isBroken])

  const handleSell = useCallback(() => {
    if (item?.id) {
      dispatch({ type: 'SELL_ITEM', payload: item.id })
    }
  }, [item])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (!item) return
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [item])

  const canEquip = onEquip && item?.slot && item.id && !isBroken
  const canSell = item?.id != null

  const contextActions = [
    ...(canEquip ? [{ label: 'Equipar', onClick: handleEquip }] : []),
    ...(canSell ? [{ label: 'Vender', onClick: handleSell }] : []),
  ]

  return (
    <div
      onClick={handleEquip}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative flex items-center justify-center ${slotSize}
        cursor-pointer transition-all select-none border-2 rounded-none
        ${isBroken
          ? 'border-[#a01020]/60 bg-[#200808]/80'
          : item
            ? 'bg-[#1a1210] hover:brightness-125'
            : 'border-[var(--gothic-border)] bg-[#1a1210]'
        }
        ${canEquip ? 'hover:border-[var(--gothic-gold-copper)]' : ''}
        gothic-focus
      `}
      style={
        item && rarityColor && !isBroken
          ? {
              borderColor: rarityColor,
              boxShadow: isHovered ? `0 0 10px ${rarityColor}40, inset 0 0 8px ${rarityColor}15` : undefined,
            }
          : item && !isBroken
            ? { borderColor: 'var(--gothic-border)' }
            : {}
      }
      role={canEquip ? 'button' : undefined}
      tabIndex={canEquip ? 0 : undefined}
      onKeyDown={(e) => { if (e.key === 'Enter' && canEquip) handleEquip() }}
      title={canEquip ? 'Click para equipar / Click derecho para opciones' : undefined}
    >
      {item ? (
        <span className={`${iconSize} font-mono tracking-tighter ${isBroken ? 'text-[#a01020]/50' : 'text-[#a09880] group-hover:text-[var(--gothic-text)]'} transition-colors z-10`}>
          {item.icon ?? (item.name ? item.name.substring(0, 3).toUpperCase() : 'EMP')}
        </span>
      ) : (
        <span className="text-[#301c10]/40 text-[8px]">-</span>
      )}

      {item && durabilityPct != null && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0c0a06]">
          <div
            className="h-full transition-all"
            style={{
              width: `${Math.max(0, durabilityPct)}%`,
              backgroundColor: isBroken
                ? '#a01020'
                : durabilityPct > 50
                  ? '#30a030'
                  : durabilityPct > 25
                    ? 'var(--gothic-gold-copper)'
                    : '#a01020',
            }}
          />
        </div>
      )}

      {isBroken && (
        <span className="absolute inset-0 flex items-center justify-center text-[6px] text-[#a01020]/80 font-[var(--font-pixel)] uppercase z-10">
          ROTO
        </span>
      )}

      <AnimatePresence>
        {item && isHovered && !contextMenu && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-layer-tooltip bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 pointer-events-none"
          >
            <div
              className="border-2 rounded-none p-2.5"
              style={{
                backgroundColor: '#0c0a06',
                borderColor: rarityColor ?? 'var(--gothic-border)',
                boxShadow: `0 0 8px rgba(0,0,0,0.8), 0 0 12px ${rarityColor ?? 'var(--gothic-border)'}25`,
              }}
            >
              <div className="pb-1.5 mb-1.5" style={{ borderBottom: `1px solid ${rarityColor ?? 'var(--gothic-border)'}40` }}>
                <h4 className="text-xs font-[var(--font-pixel)]" style={{ color: rarityColor ?? 'var(--gothic-text)' }}>
                  {item.name || 'Objeto'}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[8px] text-[var(--gothic-text-dim)] uppercase">{item.slot ?? 'Equipo'}</span>
                  {dur != null && maxDur != null && (
                    <span className={`text-[8px] font-mono ${isBroken ? 'text-[#a01020]' : 'text-[var(--gothic-text-dim)]'}`}>
                      Durabilidad {dur}/{maxDur}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-0.5">
                {item.stats && Object.entries(item.stats).map(([statName, value]) => {
                  if (!value) return null
                  const isPositive = value > 0
                  return (
                    <p key={statName} className={`text-[10px] font-mono ${isPositive ? 'text-[#30a030]' : 'text-[#a01020]'}`}>
                      {isPositive ? '+' : ''}{value} {statName.toUpperCase()}
                    </p>
                  )
                })}
                {item.baseDamage && (
                  <p className="text-[var(--gothic-gold-copper)] text-[10px] font-mono">Daño Base: {item.baseDamage}</p>
                )}
              </div>

              {item.description && (
                <p className="mt-1.5 pt-1.5 text-[9px] text-[var(--gothic-text-dim)] leading-tight" style={{ borderTop: `1px solid ${rarityColor ?? 'var(--gothic-border)'}40` }}>
                  &quot;{item.description}&quot;
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {contextMenu && contextActions.length > 0 && (
        <GothicContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          actions={contextActions}
        />
      )}
    </div>
  )
})
