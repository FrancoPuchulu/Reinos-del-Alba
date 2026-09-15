import { describe, it, expect } from 'vitest'
import { calculateSkillDamage } from '../skills'
import type { Skill, StatBlock } from '../../types/game.types'

describe('calculateSkillDamage', () => {
  it('calculates damage with no scaling stat and no weapon multiplier', () => {
    const skill: Skill = {
      id: 'test',
      name: 'Test',
      effect: '',
      unlockLevel: 1,
      maxCharges: 5,
      baseDamage: 20
    }
    const stats: StatBlock = {}
    const weapon = { min: 5, max: 10 }
    const result = calculateSkillDamage(skill, stats, weapon)
    expect(result.min).toBe(Math.floor(20 * 0.85))
    expect(result.max).toBe(Math.floor(20 * 1.15))
    expect(result.average).toBeGreaterThan(0)
    expect(result.breakdown).toContain('Base: 20')
  })

  it('adds stat scaling bonus', () => {
    const skill: Skill = {
      id: 'test',
      name: 'Test',
      effect: '',
      unlockLevel: 1,
      maxCharges: 5,
      baseDamage: 10,
      scalingStat: 'fuerza',
      scalingFactor: 1.5
    }
    const stats: StatBlock = { fuerza: 20 }
    const weapon = { min: 5, max: 10 }
    const result = calculateSkillDamage(skill, stats, weapon)
    const expectedMin = Math.floor((10 + 30) * 0.85)
    const expectedMax = Math.floor((10 + 30) * 1.15)
    expect(result.min).toBe(expectedMin)
    expect(result.max).toBe(expectedMax)
  })

  it('adds weapon multiplier contribution', () => {
    const skill: Skill = {
      id: 'test',
      name: 'Test',
      effect: '',
      unlockLevel: 1,
      maxCharges: 5,
      baseDamage: 10,
      weaponMultiplier: 0.5
    }
    const stats: StatBlock = {}
    const weapon = { min: 6, max: 14 }
    const weaponAvg = (6 + 14) / 2
    const expectedFinalBase = 10 + weaponAvg * 0.5
    const result = calculateSkillDamage(skill, stats, weapon)
    expect(result.min).toBe(Math.floor(expectedFinalBase * 0.85))
    expect(result.max).toBe(Math.floor(expectedFinalBase * 1.15))
  })

  it('combines stat scaling and weapon multiplier', () => {
    const skill: Skill = {
      id: 'test',
      name: 'Test',
      effect: '',
      unlockLevel: 1,
      maxCharges: 5,
      baseDamage: 25,
      scalingStat: 'inteligencia',
      scalingFactor: 1.2,
      weaponMultiplier: 1.0
    }
    const stats: StatBlock = { inteligencia: 15 }
    const weapon = { min: 8, max: 14 }
    const statBonus = 15 * 1.2
    const weaponContrib = ((8 + 14) / 2) * 1.0
    const finalBase = 25 + statBonus + weaponContrib
    const result = calculateSkillDamage(skill, stats, weapon)
    expect(result.min).toBe(Math.floor(finalBase * 0.85))
    expect(result.max).toBe(Math.floor(finalBase * 1.15))
  })

  it('handles missing scaling stat in character stats', () => {
    const skill: Skill = {
      id: 'test',
      name: 'Test',
      effect: '',
      unlockLevel: 1,
      maxCharges: 5,
      baseDamage: 15,
      scalingStat: 'fuerza',
      scalingFactor: 1.0
    }
    const stats: StatBlock = {}
    const weapon = { min: 5, max: 10 }
    const result = calculateSkillDamage(skill, stats, weapon)
    expect(result.min).toBe(Math.floor(15 * 0.85))
    expect(result.max).toBe(Math.floor(15 * 1.15))
  })

  it('defaults baseDamage to 10 when undefined', () => {
    const skill: Skill = {
      id: 'test',
      name: 'Test',
      effect: '',
      unlockLevel: 1,
      maxCharges: 5
    }
    const result = calculateSkillDamage(skill, {}, { min: 5, max: 10 })
    expect(result.min).toBe(Math.floor(10 * 0.85))
    expect(result.max).toBe(Math.floor(10 * 1.15))
  })

  it('includes scaling info in breakdown', () => {
    const skill: Skill = {
      id: 'test',
      name: 'Test',
      effect: '',
      unlockLevel: 1,
      maxCharges: 5,
      baseDamage: 10,
      scalingStat: 'fuerza',
      scalingFactor: 2.0,
      weaponMultiplier: 0.5
    }
    const result = calculateSkillDamage(skill, { fuerza: 10 }, { min: 6, max: 14 })
    expect(result.breakdown).toContain('fuerza x2')
    expect(result.breakdown).toContain('Arma x0.5')
  })
})
