import { describe, expect, it } from 'vitest'
import { generateLoot } from '../loot'
import type { Rarity } from '../../types/game.types'

const VALID_RARITIES: Rarity[] = ['normal', 'magico', 'epico', 'unico']
const VALID_SLOTS = [
  'armaPrincipal',
  'armaSecundaria',
  'armaDistancia',
  'armadura',
  'casco',
  'hombros',
  'pantalones',
  'guantes',
  'botas',
  'amuleto',
  'anillo',
]

describe('generateLoot', () => {
  it('returns a valid InventoryItem', () => {
    const item = generateLoot(1)

    expect(item.id).toBeTruthy()
    expect(item.name).toBeTruthy()
    expect(VALID_RARITIES).toContain(item.rarity)
    expect(item.stats).toBeDefined()
    expect(item.slot).toBeTruthy()
    expect(item.source).toBe('botin')
  })

  it('only produces valid rarities', () => {
    for (let i = 0; i < 100; i++) {
      expect(VALID_RARITIES).toContain(generateLoot(1).rarity)
    }
  })

  it('generates a valid slot for Guerrero loot', () => {
    const item = generateLoot(10, 'Guerrero')

    expect(VALID_SLOTS).toContain(item.slot)
  })

  it('accepts high levels without throwing', () => {
    expect(() => generateLoot(50)).not.toThrow()
  })

  it('works without an explicit class', () => {
    expect(() => generateLoot(1)).not.toThrow()
  })
})
