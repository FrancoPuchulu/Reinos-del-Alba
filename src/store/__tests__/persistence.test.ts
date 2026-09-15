import { describe, expect, it } from 'vitest'
import { createEmptyEquipment } from '../../engine/equipment'
import { isValidCharacter } from '../persistence'

function validCharacter() {
  return {
    name: 'Hero',
    race: 'Humano',
    class: 'Guerrero',
    level: 1,
    wallet: { gold: 1, silver: 0, copper: 0 },
    inventory: [],
    stash: [],
    equipment: createEmptyEquipment(),
    talentPoints: 0,
    talents: [],
    stats: {},
    skills: { activeStyle: 'berserker', equipped: [], charges: {} },
    experience: 0,
    experienceToNext: 100,
  }
}

describe('isValidCharacter', () => {
  it('accepts a valid character', () => {
    expect(isValidCharacter(validCharacter())).toBe(true)
  })

  it('rejects a character without a name', () => {
    expect(isValidCharacter({ ...validCharacter(), name: '' })).toBe(false)
  })

  it('rejects level below 1', () => {
    expect(isValidCharacter({ ...validCharacter(), level: 0 })).toBe(false)
  })

  it('rejects missing class', () => {
    const { class: _class, ...character } = validCharacter()
    expect(isValidCharacter(character)).toBe(false)
  })

  it('rejects missing race', () => {
    const { race: _race, ...character } = validCharacter()
    expect(isValidCharacter(character)).toBe(false)
  })

  it('rejects missing wallet', () => {
    const { wallet: _wallet, ...character } = validCharacter()
    expect(isValidCharacter(character)).toBe(false)
  })

  it('rejects non-object values', () => {
    expect(isValidCharacter(null)).toBe(false)
    expect(isValidCharacter('hero')).toBe(false)
  })

  it('accepts optional arenaRank', () => {
    expect(isValidCharacter({
      ...validCharacter(),
      arenaRank: { eloRating: 1000, wins: 1, losses: 0 },
    })).toBe(true)
  })
})
