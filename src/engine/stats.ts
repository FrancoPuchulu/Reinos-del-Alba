import type { StatBlock } from '../types/items'
import { STAT_KEYS } from '../types/game'
import { BASE_STATS_CLASES } from '../game/config'

const BASE_STATS: StatBlock = {
  fuerza: 15,
  agilidad: 10,
  inteligencia: 10,
  vitalidad: 12,
  armadura: 5,
  resistenciaMagica: 5,
  probCritico: 5,
  dañoCritico: 50,
  velocidad: 10,
  precision: 80,
  esquiva: 5,
  roboVida: 0,
  regenMana: 3
}

export function createBaseStats(charClass: string): StatBlock {
  const classStats = BASE_STATS_CLASES[charClass as keyof typeof BASE_STATS_CLASES]
  const { hpMod: _hpMod, mpMod: _mpMod, damageType: _damageType, ...stats } = classStats
  return { ...BASE_STATS, ...stats } as StatBlock
}

export function sumStatBlocks(blocks: StatBlock[]): StatBlock {
  const result: StatBlock = {}
  for (const key of STAT_KEYS) {
    result[key] = blocks.reduce((sum, b) => sum + (b[key] ?? 0), 0)
  }
  return result
}

export function calculateTotalStats(
  base: StatBlock,
  equipment: StatBlock,
  talentBonus: StatBlock
): StatBlock {
  const total: StatBlock = {}
  for (const key of STAT_KEYS) {
    total[key] = (base[key] ?? 0) + (equipment[key] ?? 0) + (talentBonus[key] ?? 0)
  }
  return total
}

export function getStatValue(stats: StatBlock, key: keyof StatBlock): number {
  return stats[key] ?? 0
}

export function getMaxHp(vitalidad: number, level: number): number {
  return 80 + vitalidad * 10 + level * 5
}

export function getMaxMana(inteligencia: number, level: number): number {
  return 40 + inteligencia * 8 + level * 3
}

export function getTotalArmor(armadura: number, fuerza: number): number {
  return armadura + Math.floor(fuerza * 0.3)
}

export function getTotalMagicResist(resistenciaMagica: number, inteligencia: number): number {
  return resistenciaMagica + Math.floor(inteligencia * 0.25)
}

export function getStatPercent(stats: StatBlock, key: keyof StatBlock): number {
  const value = stats[key] ?? 0
  if (key === 'probCritico') return Math.min(value, 75)
  if (key === 'dañoCritico') return 100 + value
  if (key === 'precision') return Math.min(value, 95)
  if (key === 'esquiva') return Math.min(value, 50)
  return value
}
