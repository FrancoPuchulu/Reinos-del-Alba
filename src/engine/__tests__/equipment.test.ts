import { describe, it, expect } from 'vitest'
import { createEmptyEquipment, getWeaponDamage, getEquipmentStatBlock, applyItemEffects } from '../equipment'
import type { ItemDefinition } from '../../types/game.types'

describe('createEmptyEquipment', () => {
  it('returns an equipment object with all slots null', () => {
    const eq = createEmptyEquipment()
    expect(eq.armaPrincipal).toBeNull()
    expect(eq.armaSecundaria).toBeNull()
    expect(eq.armaDistancia).toBeNull()
    expect(eq.armadura).toBeNull()
    expect(eq.casco).toBeNull()
    expect(eq.hombros).toBeNull()
    expect(eq.pantalones).toBeNull()
    expect(eq.guantes).toBeNull()
    expect(eq.botas).toBeNull()
    expect(eq.amuleto).toBeNull()
    expect(eq.anillo).toBeNull()
  })
})

describe('getWeaponDamage', () => {
  it('returns default damage when no weapons equipped', () => {
    const eq = createEmptyEquipment()
    expect(getWeaponDamage(eq)).toEqual({ min: 5, max: 10 })
  })

  it('sums damage from a single weapon', () => {
    const weapon: ItemDefinition = {
      id: 'w1', name: 'Sword', slot: 'armaPrincipal', rarity: 'normal',
      stats: {}, description: '', damage: { min: 8, max: 15 }
    }
    const eq = createEmptyEquipment()
    eq.armaPrincipal = weapon
    expect(getWeaponDamage(eq)).toEqual({ min: 8, max: 15 })
  })

  it('sums damage from multiple weapons', () => {
    const main: ItemDefinition = {
      id: 'w1', name: 'Sword', slot: 'armaPrincipal', rarity: 'normal',
      stats: {}, description: '', damage: { min: 8, max: 15 }
    }
    const off: ItemDefinition = {
      id: 'w2', name: 'Dagger', slot: 'armaSecundaria', rarity: 'normal',
      stats: {}, description: '', damage: { min: 3, max: 7 }
    }
    const eq = createEmptyEquipment()
    eq.armaPrincipal = main
    eq.armaSecundaria = off
    expect(getWeaponDamage(eq)).toEqual({ min: 11, max: 22 })
  })

  it('ignores weapons without damage', () => {
    const shield: ItemDefinition = {
      id: 's1', name: 'Shield', slot: 'armaSecundaria', rarity: 'normal',
      stats: { armadura: 5 }, description: ''
    }
    const eq = createEmptyEquipment()
    eq.armaSecundaria = shield
    expect(getWeaponDamage(eq)).toEqual({ min: 5, max: 10 })
  })
})

describe('getEquipmentStatBlock', () => {
  it('returns all zeros for empty equipment', () => {
    const result = getEquipmentStatBlock(createEmptyEquipment())
    expect(result.fuerza).toBe(0)
    expect(result.armadura).toBe(0)
  })

  it('sums stats from equipped items', () => {
    const armor: ItemDefinition = {
      id: 'a1', name: 'Plate', slot: 'armadura', rarity: 'normal',
      stats: { armadura: 15, vitalidad: 5 }, description: ''
    }
    const helmet: ItemDefinition = {
      id: 'h1', name: 'Helm', slot: 'casco', rarity: 'normal',
      stats: { armadura: 8, fuerza: 3 }, description: ''
    }
    const eq = createEmptyEquipment()
    eq.armadura = armor
    eq.casco = helmet
    const result = getEquipmentStatBlock(eq)
    expect(result.armadura).toBe(23)
    expect(result.vitalidad).toBe(5)
    expect(result.fuerza).toBe(3)
  })
})

describe('applyItemEffects', () => {
  it('returns empty object when item has no effects', () => {
    const item: ItemDefinition = {
      id: 'i1', name: 'Basic', slot: 'armadura', rarity: 'normal',
      stats: {}, description: ''
    }
    expect(applyItemEffects(item)).toEqual({})
  })

  it('collects effects from item', () => {
    const item: ItemDefinition = {
      id: 'i1', name: 'Magic Ring', slot: 'anillo', rarity: 'magico',
      stats: {}, description: '',
      effects: [
        { type: 'critBonus', value: 5 },
        { type: 'lifeSteal', value: 3 }
      ]
    }
    const result = applyItemEffects(item)
    expect(result.critBonus).toBe(5)
    expect(result.lifeSteal).toBe(3)
  })

  it('sums duplicate effect types', () => {
    const item: ItemDefinition = {
      id: 'i1', name: 'Stacking Ring', slot: 'anillo', rarity: 'epico',
      stats: {}, description: '',
      effects: [
        { type: 'extraCharges', value: 2 },
        { type: 'extraCharges', value: 1 }
      ]
    }
    const result = applyItemEffects(item)
    expect(result.extraCharges).toBe(3)
  })

  it('defaults effect value to 1 when undefined', () => {
    const item: ItemDefinition = {
      id: 'i1', name: 'Odd Item', slot: 'amuleto', rarity: 'normal',
      stats: {}, description: '',
      effects: [{ type: 'extraTurn' }]
    }
    const result = applyItemEffects(item)
    expect(result.extraTurn).toBe(1)
  })
})
