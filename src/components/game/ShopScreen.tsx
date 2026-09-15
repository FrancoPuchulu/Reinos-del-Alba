import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useGameStore, dispatch } from '@/store/GameStore'
import { GothicButton } from '@/components/common/GothicButton'
import { GothicFrame } from '@/components/ui/GothicFrame'
import TopNavBar from '@/components/ui/TopNavBar'
import type { EquipmentSlot, ItemDefinition, StatBlock } from '@/types/items'
import type { InventoryItem } from '@/types/game.types'
import { RARITY_COLORS } from '@/constants/theme'

const ITEM_ICONS: Record<string, string> = {
  'pocion-vida': '🧪',
  'pocion-mana': '💧',
  'vendaje': '🩹',
  'pergamino-bendecido': '📜',
  'polvo-alquimico': '✨',
  'talisman-oscuro': '🔮',
  'espada-larga-mellada': '⚔️',
  'daga-laton': '🗡️',
  'baston-madera': '🪄',
  'coraza-hierro': '🛡️',
  'jubon-cuero': '🦺',
  'toga-lino': '👘',
}

const REPAIR_COST_PER_POINT: Record<string, number> = {
  normal: 2,
  magico: 5,
  epico: 12,
  unico: 30,
}

interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  rarity: 'normal' | 'magico' | 'epico' | 'unico'
  equipSlot?: string
  stats?: StatBlock
}

const BASIC_ITEMS: ShopItem[] = [
  { id: 'pocion-vida', name: 'Pocion de Vida', description: 'Restaura 50 PS durante el combate.', price: 25, rarity: 'normal' },
  { id: 'pocion-mana', name: 'Pocion de Mana', description: 'Recupera todos los usos de una habilidad.', price: 40, rarity: 'normal' },
  { id: 'vendaje', name: 'Vendajes de Lino', description: 'Cura 20 PS fuera de combate.', price: 10, rarity: 'normal' },
  { id: 'pergamino-bendecido', name: 'Pergamino Bendecido', description: 'Proteccion sagrada para la proxima batalla.', price: 60, rarity: 'magico' },
  { id: 'polvo-alquimico', name: 'Polvo Alquimico', description: 'Mejora temporalmente las estadisticas.', price: 85, rarity: 'magico' },
  { id: 'talisman-oscuro', name: 'Talisman Oscuro', description: 'Amuleto de poder prohibido.', price: 150, rarity: 'epico' },
]

const EQUIPMENT_ITEMS: ShopItem[] = [
  { id: 'espada-larga-mellada', name: 'Espada Larga Mellada', description: 'Espada de acero desgastada pero funcional.', price: 40, rarity: 'normal', equipSlot: 'armaPrincipal', stats: { fuerza: 2 } },
  { id: 'daga-laton', name: 'Daga de Laton', description: 'Daga ligera y rapida de manejar.', price: 35, rarity: 'normal', equipSlot: 'armaSecundaria', stats: { agilidad: 2 } },
  { id: 'baston-madera', name: 'Baston de Madera', description: 'Baston rustico imbuido de energia natural.', price: 45, rarity: 'normal', equipSlot: 'armaPrincipal', stats: { inteligencia: 2 } },
  { id: 'coraza-hierro', name: 'Coraza de Hierro', description: 'Peto de hierro que ofrece proteccion solida.', price: 80, rarity: 'normal', equipSlot: 'armadura', stats: { armadura: 5, vitalidad: 1 } },
  { id: 'jubon-cuero', name: 'Jubon de Cuero', description: 'Armadura ligera de cuero reforzado.', price: 60, rarity: 'normal', equipSlot: 'armadura', stats: { armadura: 2, agilidad: 1 } },
  { id: 'toga-lino', name: 'Toga de Lino', description: 'Toga sencilla con tejido protector.', price: 50, rarity: 'normal', equipSlot: 'armadura', stats: { armadura: 1, inteligencia: 1 } },
]

function getMaxDurability(rarity: string): number {
  switch (rarity) {
    case 'unico': return 120
    case 'epico': return 90
    case 'magico': return 60
    default: return 40
  }
}

function calculateRepairCost(item: ItemDefinition): number {
  const maxDur = item.maxDurability ?? getMaxDurability(item.rarity)
  const curDur = item.durability ?? maxDur
  const missing = maxDur - curDur
  if (missing <= 0) return 0
  const costPerPoint = REPAIR_COST_PER_POINT[item.rarity] ?? 2
  return missing * costPerPoint
}

export default function ShopScreen() {
  const { character } = useGameStore()
  const buyTimestampRef = useRef(0)
  const handleBuy = useCallback((shopItem: ShopItem) => {
    if (!character || character.wallet.gold < shopItem.price) return
    if (character.stash.length >= 48) return
    buyTimestampRef.current = Date.now()
    const invItem: InventoryItem = {
      id: `shop-${shopItem.id}-${buyTimestampRef.current}`,
      name: shopItem.name,
      source: 'tienda',
      rarity: shopItem.rarity,
      description: shopItem.description,
      icon: shopItem.name.substring(0, 3).toUpperCase(),
      ...(shopItem.equipSlot ? {
        slot: shopItem.equipSlot,
        stats: shopItem.stats,
        durability: 50,
        maxDurability: 50,
      } : {}),
    }
    dispatch({ type: 'ADD_GOLD', payload: -shopItem.price })
    dispatch({ type: 'ADD_INVENTORY', payload: invItem })
  }, [character])

  if (!character) return null

  const equipmentSlots: [string, EquipmentSlot][] = [
    ['Arma Principal', 'armaPrincipal'],
    ['Arma Secundaria', 'armaSecundaria'],
    ['Arma Distancia', 'armaDistancia'],
    ['Armadura', 'armadura'],
    ['Casco', 'casco'],
    ['Hombros', 'hombros'],
    ['Pantalones', 'pantalones'],
    ['Guantes', 'guantes'],
    ['Botas', 'botas'],
    ['Amuleto', 'amuleto'],
    ['Anillo', 'anillo'],
  ]

  const equippedItems: ItemDefinition[] = equipmentSlots
    .map(([, slot]) => character.equipment[slot])
    .filter((item): item is ItemDefinition => item !== null)

  const totalRepairCost = equippedItems.reduce((sum, item) => sum + calculateRepairCost(item), 0)
  const canRepair = totalRepairCost > 0 && character.wallet.gold >= totalRepairCost

  const handleRepairAll = () => {
    const newEquipment = { ...character.equipment }
    for (const [, slot] of equipmentSlots) {
      const item = newEquipment[slot]
      if (!item) continue
      const maxDur = item.maxDurability ?? getMaxDurability(item.rarity)
      if ((item.durability ?? maxDur) < maxDur) {
        newEquipment[slot] = { ...item, durability: maxDur }
      }
    }
    dispatch({ type: 'UPDATE_CHARACTER', payload: { equipment: newEquipment } })
    dispatch({ type: 'ADD_GOLD', payload: -totalRepairCost })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 p-2 sm:p-3 overflow-y-auto gothic-bg"
    >
      <TopNavBar activeTab="shop" onTabChange={() => dispatch({ type: 'SET_SCREEN', payload: 'game' })} />
      <div className="max-w-5xl mx-auto space-y-4 pt-10">
        {/* Header */}
        <div className="text-center pt-4 pb-2">
          <h1 className="text-[var(--wow-border)] font-[var(--font-pixel)] text-lg tracking-wider uppercase"
            style={{ textShadow: '2px 2px 0 #0c0a06, 0 0 16px rgba(192,168,96,0.15)' }}>
            El Yunque Quebrado
          </h1>
          <p className="text-[var(--gothic-text-dim)] text-[11px] mt-1">Herrero y mercader de reliquias</p>
          <div className="flex items-center justify-center gap-1 mt-2 text-sm">
            <span className="text-[var(--wow-border)]">&#9679;</span>
            <span className="text-[var(--gothic-text)] font-mono">{character.wallet.gold}</span>
            <span className="text-[var(--wow-border)] text-[10px] opacity-70">Oro</span>
          </div>
        </div>

        <GothicFrame corners="none" className="!p-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <span className="text-2xl shrink-0">⚒️</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-[var(--wow-border)] text-[10px] font-[var(--font-pixel)] tracking-wider uppercase mb-1">
                Yunque de Reparacion
              </h3>
              {equippedItems.length === 0 ? (
                <p className="text-[var(--gothic-text-dim)] text-[9px]">No hay equipo que reparar.</p>
              ) : (
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {equippedItems.map((item) => {
                    const maxDur = item.maxDurability ?? getMaxDurability(item.rarity)
                    const curDur = item.durability ?? maxDur
                    const pct = maxDur > 0 ? Math.round((curDur / maxDur) * 100) : 100
                    const cost = calculateRepairCost(item)
                    return (
                      <div key={item.id} className="flex items-center gap-1.5 text-[9px]">
                        <span className="truncate max-w-[100px]" style={{ color: RARITY_COLORS[item.rarity] }}>
                          {item.name}
                        </span>
                        <div className="w-14 h-1.5 bg-[#0c0a06] border border-[var(--gothic-border)] overflow-hidden shrink-0">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: pct > 50 ? '#30a030' : pct > 25 ? '#c0a030' : '#a01020',
                            }}
                          />
                        </div>
                        {cost > 0 && <span className="text-[var(--wow-border)] text-[8px] shrink-0">{cost}oro</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            {equippedItems.length > 0 && (
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[9px] text-[var(--gothic-text-dim)]">
                  Total: <span className="text-[var(--wow-border)] font-mono">{totalRepairCost}</span> oro
                </span>
                <GothicButton size="sm" variant="gold" onClick={handleRepairAll} disabled={!canRepair}>
                  Reparar Todo
                </GothicButton>
              </div>
            )}
          </div>
        </GothicFrame>

        {/* Buy Section */}
        <GothicFrame title="Mercancias">
          {/* Consumibles */}
          {BASIC_ITEMS.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[var(--wow-border)] text-[9px] tracking-wider uppercase mb-2 opacity-70">Consumibles</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {BASIC_ITEMS.map((shopItem) => {
                  const stashFull = character.stash.length >= 48
                  const canBuy = character.wallet.gold >= shopItem.price && !stashFull
                  const icon = ITEM_ICONS[shopItem.id] ?? '📦'
                  return (
                    <div
                      key={shopItem.id}
                      className="flex border-2 border-[var(--gothic-border)] bg-[#0c0a06]/80 hover:border-[var(--wow-border-gold)] transition-colors group"
                    >
                      {/* Icon slot */}
                      <div className="w-12 h-12 flex items-center justify-center bg-[#1a1210] border-r border-[var(--gothic-border)] shrink-0">
                        <span className="text-xl">{icon}</span>
                      </div>
                      {/* Info */}
                      <div className="flex-1 p-2 flex flex-col justify-between min-w-0">
                        <div>
                          <span className="text-[10px] font-[var(--font-pixel)] truncate block leading-tight" style={{ color: RARITY_COLORS[shopItem.rarity] }}>
                            {shopItem.name}
                          </span>
                          <p className="text-[7px] text-[var(--gothic-text-dim)] truncate leading-tight mt-0.5">{shopItem.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[8px] text-[var(--wow-border)] font-mono">{shopItem.price} oro</span>
                          <GothicButton
                            size="sm"
                            variant={canBuy ? 'gold' : 'ghost'}
                            onClick={() => handleBuy(shopItem)}
                            disabled={!canBuy}
                          >
                            {stashFull ? 'Lleno' : canBuy ? 'Adquirir' : '---'}
                          </GothicButton>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Equipamiento */}
          {EQUIPMENT_ITEMS.length > 0 && (
            <div>
              <h4 className="text-[var(--wow-border)] text-[9px] tracking-wider uppercase mb-2 opacity-70">Armas y Armaduras</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {EQUIPMENT_ITEMS.map((shopItem) => {
                  const stashFull = character.stash.length >= 48
                  const canBuy = character.wallet.gold >= shopItem.price && !stashFull
                  const icon = ITEM_ICONS[shopItem.id] ?? '📦'
                  return (
                    <div
                      key={shopItem.id}
                      className="flex border-2 border-[var(--gothic-border)] bg-[#0c0a06]/80 hover:border-[var(--wow-border-gold)] transition-colors group"
                    >
                      {/* Icon slot */}
                      <div className="w-12 h-12 flex items-center justify-center bg-[#1a1210] border-r border-[var(--gothic-border)] shrink-0">
                        <span className="text-xl">{icon}</span>
                      </div>
                      {/* Info */}
                      <div className="flex-1 p-2 flex flex-col justify-between min-w-0">
                        <div>
                          <span className="text-[10px] font-[var(--font-pixel)] truncate block leading-tight" style={{ color: RARITY_COLORS[shopItem.rarity] }}>
                            {shopItem.name}
                          </span>
                          <p className="text-[7px] text-[var(--gothic-text-dim)] truncate leading-tight mt-0.5">{shopItem.description}</p>
                          {shopItem.stats && (
                            <div className="flex flex-wrap gap-x-1.5 gap-y-0 mt-1">
                              {Object.entries(shopItem.stats).map(([stat, val]) => (
                                <span key={stat} className="text-[7px] text-[#30a030] font-mono">+{val} {stat.substring(0, 3).toUpperCase()}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[8px] text-[var(--wow-border)] font-mono">{shopItem.price} oro</span>
                           <GothicButton
                            size="sm"
                            variant={canBuy ? 'gold' : 'ghost'}
                            onClick={() => handleBuy(shopItem)}
                            disabled={!canBuy}
                          >
                            {stashFull ? 'Lleno' : canBuy ? 'Adquirir' : '---'}
                          </GothicButton>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </GothicFrame>

        {/* Back Button */}
        <div className="text-center pb-4 pt-2">
          <GothicButton
            variant="secondary"
            size="md"
            onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'game' })}
          >
            Volver al Refugio
          </GothicButton>
        </div>
      </div>
    </motion.div>
  )
}
