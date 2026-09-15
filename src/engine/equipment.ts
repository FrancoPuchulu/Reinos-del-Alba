import type { ItemDefinition, Equipment, EquipmentSlot, StatBlock } from '../types/items'
import type { Character } from '../types/game'
import { sumStatBlocks } from './stats'

export function createEmptyEquipment(): Equipment {
  return {
    armaPrincipal: null, armaSecundaria: null, armaDistancia: null,
    armadura: null, casco: null, hombros: null, pantalones: null,
    guantes: null, botas: null, amuleto: null, anillo: null
  }
}

export function equipItem(
  character: Character,
  item: ItemDefinition
): Character {
  const newEquipment = { ...character.equipment }
  const slot = item.slot

  const currentItem = newEquipment[slot]
  let newInventory = character.inventory

  if (currentItem) {
    newInventory = newInventory.map(inv =>
      inv.id === currentItem.id ? { ...inv, equipped: false } : inv
    )
  }

  newEquipment[slot] = item
  newInventory = newInventory.map(inv =>
    inv.id === item.id ? { ...inv, equipped: true } : inv
  )

  return {
    ...character,
    equipment: newEquipment,
    inventory: newInventory,
  }
}

export function unequipItem(
  character: Character,
  slot: EquipmentSlot
): Character {
  const newEquipment = { ...character.equipment }
  const currentItem = newEquipment[slot]

  if (!currentItem) return character

  const newInventory = character.inventory.map(inv =>
    inv.id === currentItem.id ? { ...inv, equipped: false } : inv
  )

  newEquipment[slot] = null

  return {
    ...character,
    equipment: newEquipment,
    inventory: newInventory,
  }
}

export function getWeaponDamage(equipment: Equipment): { min: number; max: number } {
  const weapons = [
    equipment.armaPrincipal,
    equipment.armaSecundaria,
    equipment.armaDistancia
  ]
  let totalMin = 0
  let totalMax = 0
  for (const w of weapons) {
    if (w?.damage) {
      totalMin += w.damage.min
      totalMax += w.damage.max
    }
  }
  if (totalMin > 0 || totalMax > 0) return { min: totalMin, max: totalMax }
  return { min: 5, max: 10 }
}

export function getEquipmentStatBlock(equipment: Equipment): StatBlock {
  const stats: StatBlock[] = []
  for (const key of Object.keys(equipment) as (keyof Equipment)[]) {
    const item = equipment[key]
    if (item?.stats) stats.push(item.stats)
  }
  return sumStatBlocks(stats)
}

export function applyItemEffects(item: ItemDefinition): Record<string, number> {
  const effects: Record<string, number> = {}
  if (!item.effects) return effects

  for (const effect of item.effects) {
    effects[effect.type] = (effects[effect.type] ?? 0) + (effect.value ?? 1)
  }
  return effects
}

export function getTotalItemEffects(equipment: Equipment): Record<string, number> {
  const effects: Record<string, number> = {}
  for (const key of Object.keys(equipment) as (keyof Equipment)[]) {
    const item = equipment[key]
    if (item?.effects) {
      const itemEffects = applyItemEffects(item)
      for (const [type, value] of Object.entries(itemEffects)) {
        effects[type] = (effects[type] ?? 0) + value
      }
    }
  }
  return effects
}
