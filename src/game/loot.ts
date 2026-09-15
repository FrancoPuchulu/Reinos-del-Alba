import type { InventoryItem, Class } from '../types/game'
import { getItemsForClass } from '../data/items'
import type { Rarity } from '../types/game.types'
import { RARITY_WEIGHTS } from '../types/game.types'
import { roll } from '../engine/utils'

function rollRarity(): Rarity {
  const weights = RARITY_WEIGHTS.normal
  const total = weights.normal + weights.magico + weights.epico + weights.unico
  const rarityRoll = roll(total) - 1
  let cum = 0
  for (const [rarity, weight] of Object.entries(weights) as [Rarity, number][]) {
    cum += weight
    if (rarityRoll < cum) return rarity
  }
  return 'normal'
}

export function generateLoot(playerLevel: number, charClass?: Class): InventoryItem {
  const resolvedClass: Class = charClass ?? (['Guerrero', 'Mago', 'Druida', 'Brujo'] as Class[])[roll(4) - 1]
  const pool = getItemsForClass(resolvedClass)
  const eligible = pool.filter(i => i.levelRequired == null || i.levelRequired <= playerLevel)
  const itemPool = eligible.length > 0 ? eligible : pool
  if (itemPool.length === 0) {
    throw new Error(`generateLoot: no items found for class ${resolvedClass}`)
  }
  const item = itemPool[roll(itemPool.length) - 1]

  const rarity = rollRarity()

  return {
    id: item.id,
    name: item.name,
    source: 'botin',
    rarity,
    stats: item.stats,
    slot: item.slot,
    description: item.description,
    levelRequired: item.levelRequired,
    durability: item.durability,
    maxDurability: item.maxDurability,
    equipped: false,
  }
}
