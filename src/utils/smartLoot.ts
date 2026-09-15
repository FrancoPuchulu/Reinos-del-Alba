import type { Class, InventoryItem, Rarity } from '../types/game.types'
import { getItemsForClass, getAllItems } from '../data/items'
import { roll } from '../engine/utils'

type PvPRarity = 'common' | 'uncommon' | 'rare' | 'epic'

const PVP_RARITY_MAP: Record<PvPRarity, Rarity> = {
  common: 'normal',
  uncommon: 'magico',
  rare: 'epico',
  epic: 'unico',
}

export function generatePvPLoot(playerClass: Class, pvpRarity?: PvPRarity): InventoryItem {
  const mappedRarity: Rarity = pvpRarity ? PVP_RARITY_MAP[pvpRarity] : 'normal'

  const classItems = getItemsForClass(playerClass)
  const eligible = classItems.filter(item => item.rarity === mappedRarity)

  let pool = eligible
  if (pool.length === 0) {
    pool = getAllItems().filter(item => item.rarity === mappedRarity)
  }
  if (pool.length === 0) {
    pool = classItems
  }

  const item = pool[roll(pool.length) - 1]

  return {
    id: item.id,
    name: item.name,
    source: 'pvp',
    rarity: item.rarity,
    stats: item.stats,
    slot: item.slot,
    description: item.description,
    durability: item.durability,
    maxDurability: item.maxDurability,
    equipped: false,
  }
}
