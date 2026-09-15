import { describe, it, expect } from 'vitest'
import { sumStatBlocks, calculateTotalStats, getMaxHp, getMaxMana } from '../stats'
import type { StatBlock } from '../../types/game.types'

describe('sumStatBlocks', () => {
  it('sums values from multiple stat blocks', () => {
    const a: StatBlock = { fuerza: 5, agilidad: 3, armadura: 10 }
    const b: StatBlock = { fuerza: 2, inteligencia: 7 }
    const result = sumStatBlocks([a, b])
    expect(result.fuerza).toBe(7)
    expect(result.agilidad).toBe(3)
    expect(result.inteligencia).toBe(7)
    expect(result.armadura).toBe(10)
  })

  it('returns all zeros for an empty array', () => {
    const result = sumStatBlocks([])
    expect(result.fuerza).toBe(0)
    expect(result.agilidad).toBe(0)
    expect(result.inteligencia).toBe(0)
    expect(result.vitalidad).toBe(0)
    expect(result.armadura).toBe(0)
    expect(result.resistenciaMagica).toBe(0)
  })

  it('handles a single block', () => {
    const result = sumStatBlocks([{ fuerza: 12, probCritico: 8 }])
    expect(result.fuerza).toBe(12)
    expect(result.probCritico).toBe(8)
    expect(result.agilidad).toBe(0)
  })

  it('treats missing keys as zero', () => {
    const result = sumStatBlocks([{ fuerza: 4 }, { agilidad: 6 }])
    expect(result.fuerza).toBe(4)
    expect(result.agilidad).toBe(6)
    expect(result.inteligencia).toBe(0)
  })
})

describe('calculateTotalStats', () => {
  it('sums base, equipment, and talent bonuses', () => {
    const base: StatBlock = { fuerza: 10, vitalidad: 12, armadura: 5 }
    const equip: StatBlock = { fuerza: 5, armadura: 8 }
    const talent: StatBlock = { fuerza: 3 }
    const result = calculateTotalStats(base, equip, talent)
    expect(result.fuerza).toBe(18)
    expect(result.vitalidad).toBe(12)
    expect(result.armadura).toBe(13)
  })

  it('handles empty blocks', () => {
    const result = calculateTotalStats({}, {}, {})
    expect(result.fuerza).toBe(0)
    expect(result.inteligencia).toBe(0)
  })

  it('only base provided', () => {
    const result = calculateTotalStats({ fuerza: 15 }, {}, {})
    expect(result.fuerza).toBe(15)
    expect(result.agilidad).toBe(0)
  })
})

describe('getMaxHp', () => {
  it('calculates HP from vitalidad and level', () => {
    expect(getMaxHp(12, 1)).toBe(80 + 12 * 10 + 1 * 5)
    expect(getMaxHp(10, 5)).toBe(80 + 10 * 10 + 5 * 5)
    expect(getMaxHp(0, 0)).toBe(80)
  })
})

describe('getMaxMana', () => {
  it('calculates mana from inteligencia and level', () => {
    expect(getMaxMana(10, 1)).toBe(40 + 10 * 8 + 1 * 3)
    expect(getMaxMana(15, 5)).toBe(40 + 15 * 8 + 5 * 3)
    expect(getMaxMana(0, 0)).toBe(40)
  })
})
