import type { StatBlock } from '../types/items'
import type { Skill } from '../types/game'

export interface CalculatedDamage {
  min: number
  max: number
  average: number
  breakdown: string
}

export function calculateSkillDamage(
  skill: Skill,
  characterStats: StatBlock,
  weaponDamage: { min: number; max: number }
): CalculatedDamage {
  const base = skill.baseDamage ?? 10
  const scalingStat = skill.scalingStat
  const scalingFactor = skill.scalingFactor ?? 1.0
  const weaponMultiplier = skill.weaponMultiplier ?? 0

  let statBonus = 0
  if (scalingStat && characterStats[scalingStat]) {
    statBonus = (characterStats[scalingStat] ?? 0) * scalingFactor
  }

  const weaponContribution = weaponMultiplier > 0
    ? ((weaponDamage.min + weaponDamage.max) / 2) * weaponMultiplier
    : 0

  const finalBase = base + statBonus + weaponContribution

  const profCrit = (characterStats.probCritico ?? 5) / 100
  const dañoCrit = (characterStats.dañoCritico ?? 50) / 100

  const min = Math.floor(finalBase * 0.85)
  const max = Math.floor(finalBase * 1.15)
  const average = Math.floor((min + max) / 2 * (1 + profCrit * dañoCrit))

  const breakdown = [
    `Base: ${base}`,
    scalingStat ? `${scalingStat} x${scalingFactor}: +${Math.floor(statBonus)}` : '',
    weaponMultiplier > 0 ? `Arma x${weaponMultiplier}: +${Math.floor(weaponContribution)}` : '',
    `Total: ${min}-${max}`
  ].filter(Boolean).join(' | ')

  return { min, max, average, breakdown }
}

export function getDefaultWeaponDamage(charClass: string): { min: number; max: number } {
  switch (charClass) {
    case 'Guerrero': return { min: 8, max: 14 }
    case 'Mago': return { min: 5, max: 10 }
    case 'Druida': return { min: 6, max: 11 }
    case 'Brujo': return { min: 6, max: 12 }
    default: return { min: 5, max: 10 }
  }
}

export function calculateAllSkillDamage(
  skills: Skill[],
  characterStats: StatBlock,
  weaponDamage: { min: number; max: number }
): Record<string, CalculatedDamage> {
  const result: Record<string, CalculatedDamage> = {}
  for (const skill of skills) {
    result[skill.id] = calculateSkillDamage(skill, characterStats, weaponDamage)
  }
  return result
}
