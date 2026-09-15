import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processTurn } from '../combat'
import { createBattleState } from '../testUtils'
import type { CombatAction, CombatState } from '../../types/combat'

vi.mock('../utils', () => ({
  roll: vi.fn((max: number) => {
    if (max === 1) return 1
    return 50
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Sistema de Afijos de Enemigos Élite', () => {
  it('Vampiric: enemy heals 25% of damage dealt on attack', () => {
    const state = createBattleState(
      { currentHp: 100, armor: 0 },
      { currentHp: 50, maxHp: 100, damage: { min: 20, max: 20 }, affixes: ['vampiric'] }
    )

    const playerAction: CombatAction = {
      type: 'defend',
      sourceId: 'player',
      targetIds: [],
    }

    const result: CombatState = processTurn(state, playerAction)
    const resultEnemy = result.enemies.find(e => e.id === 'enemy_1')

    expect(resultEnemy).toBeDefined()
    expect(resultEnemy?.currentHp).toBe(55)
  })

  it('Thorns: reflects damage back to attacker when enemy is hit', () => {
    const state = createBattleState(
      { currentHp: 100, armor: 0, weaponDamage: { min: 10, max: 10 } },
      { currentHp: 100, armor: 0, affixes: ['thorns'] }
    )

    const playerAction: CombatAction = {
      type: 'attack',
      sourceId: 'player',
      targetIds: ['enemy_1'],
    }

    const result: CombatState = processTurn(state, playerAction)
    const thornsLog = result.log.find(
      entry => entry.message.includes('espinas') && entry.message.includes('infligen')
    )

    expect(thornsLog).toBeDefined()
    expect(result.allies[0].currentHp).toBeLessThan(100)
  })
})
