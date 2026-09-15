import type { ItemDefinition, Rarity } from '../types/items'
import type { InventoryItem, Class } from '../types/game'
import type { Difficulty, ActiveExpedition } from '../types/game.types'
import { DIFFICULTY_MULTIPLIER, RARITY_WEIGHTS } from '../types/game.types'
import { expeditions, type ExpeditionDef } from '../data/gameData'
import { getItemsForClass } from '../data/items'
import { roll } from './utils'

export interface ExpeditionRewards {
  gold: number
  experience: number
  item: InventoryItem | null
  talentPoint: boolean
}

function rollRarity(difficulty: Difficulty): Rarity {
  const weights = RARITY_WEIGHTS[difficulty]
  const total = weights.normal + weights.magico + weights.epico + weights.unico
  const rarityRoll = roll(total) - 1
  let cum = 0
  for (const [rarity, weight] of Object.entries(weights) as [Rarity, number][]) {
    cum += weight
    if (rarityRoll < cum) return rarity
  }
  return 'normal'
}

function pickItemForClass(charClass: Class, minLevel: number): ItemDefinition | null {
  const pool = getItemsForClass(charClass).filter(i => i.levelRequired === undefined || i.levelRequired <= minLevel)
  if (pool.length === 0) return null
  return pool[roll(pool.length) - 1]
}

export function calculateRewards(
  expedition: ActiveExpedition,
  charClass: Class,
  level: number,
  _talentPoints: number
): ExpeditionRewards {
  const def = findExpeditionDef(expedition.adventureName, expedition.category)
  if (!def) return { gold: 0, experience: 0, item: null, talentPoint: false }

  const time = expedition.durationMinutes
  const mult = DIFFICULTY_MULTIPLIER[expedition.difficulty]
  const levelScale = 1 + (level - 1) * 0.05

  const baseGold = time * 12
  const gold = Math.floor(baseGold * mult * levelScale)

  const baseXp = time * 15
  const experience = Math.floor(baseXp * mult * levelScale)

  const rarity = rollRarity(expedition.difficulty)
  const rawItem = pickItemForClass(charClass, level)
  const item: InventoryItem | null = rawItem
    ? {
        id: rawItem.id,
        name: rawItem.name,
        source: expedition.adventureName,
        rarity,
        stats: rawItem.stats,
        slot: rawItem.slot,
        equipped: false
      }
    : null

  const talentPoint = time >= 45 && mult >= 1

  return { gold, experience, item, talentPoint }
}

export function findExpeditionDef(name: string, category: string): ExpeditionDef | undefined {
  return expeditions[category].find(e => e.name === name)
}

export function getExpeditionDuration(def: ExpeditionDef, difficulty: Difficulty): number {
  return def.levels[difficulty].time
}

export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}m ${s}s`
}

export function isExpeditionComplete(expedition: ActiveExpedition): boolean {
  const elapsed = Date.now() - expedition.startTime
  return elapsed >= expedition.durationMinutes * 60 * 1000
}

export function getExpeditionProgress(expedition: ActiveExpedition): number {
  const elapsed = Date.now() - expedition.startTime
  const total = expedition.durationMinutes * 60 * 1000
  return Math.min(1, Math.max(0, elapsed / total))
}
