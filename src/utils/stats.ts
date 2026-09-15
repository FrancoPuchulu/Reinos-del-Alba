import type { StatBlock } from '@/types/items'
import type { Character } from '@/types/game'
import { STAT_KEYS } from '@/types/game'
import { talentTree } from '@/data/gameData'
import { sumStatBlocks } from '@/engine/stats'

function getTalentBonus(talents: string[]): StatBlock {
  const bonus: StatBlock = {}
  for (const id of talents) {
    const talent = talentTree.find(t => t.id === id)
    if (!talent) continue
    if (talent.stat && talent.amount) {
      bonus[talent.stat] = (bonus[talent.stat] ?? 0) + talent.amount
    }
    if (talent.statMix) {
      for (const [k, v] of Object.entries(talent.statMix)) {
        const key = k as keyof StatBlock
        bonus[key] = (bonus[key] ?? 0) + v
      }
    }
    if (talent.allStats) {
      for (const key of STAT_KEYS) {
        bonus[key] = (bonus[key] ?? 0) + talent.allStats
      }
    }
  }
  return bonus
}

export function calculateTotalStats(character: Character): StatBlock {
  const base = { ...character.stats }

  const equipmentBlocks: StatBlock[] = []
  for (const key of Object.keys(character.equipment) as (keyof typeof character.equipment)[]) {
    const item = character.equipment[key]
    if (item?.stats && item.durability !== 0) equipmentBlocks.push(item.stats)
  }
  const equipment = sumStatBlocks(equipmentBlocks)

  const talentBonus = getTalentBonus(character.talents)

  const total: StatBlock = {}
  for (const key of STAT_KEYS) {
    total[key] = (base[key] ?? 0) + (equipment[key] ?? 0) + (talentBonus[key] ?? 0)
  }
  return total
}
