import { describe, it, expect } from 'vitest'
import { applyEnemyAI, createDefaultAbilities } from '../enemyAI'
import type { CombatEnemy, CombatState, CombatActor } from '../../types/combat'

function makeAlly(overrides?: Partial<CombatActor>): CombatActor {
  return {
    id: 'ally_1', name: 'Hero', maxHp: 200, currentHp: 200,
    maxMana: 100, currentMana: 100,
    stats: {}, totalStats: {}, armor: 10, magicResist: 5,
    damage: { min: 5, max: 10 }, weaponDamage: { min: 5, max: 10 },
    ...overrides
  }
}

function makeEnemy(overrides?: Partial<CombatEnemy>): CombatEnemy {
  return {
    id: 'enemy_1', name: 'Goblin', level: 3,
    stats: { fuerza: 10 }, maxHp: 100, currentHp: 100,
    maxMana: 30, currentMana: 30,
    abilities: [], damage: { min: 4, max: 8 },
    armor: 5, magicResist: 3,
    experienceReward: 30, goldReward: 14, itemDrops: [],
    ...overrides
  }
}

function makeState(overrides?: Partial<CombatState>): CombatState {
  return {
    phase: 'playerTurn', turn: 1,
    allies: [makeAlly()],
    enemies: [makeEnemy()],
    statuses: { allies: { ally_1: [] }, enemies: { enemy_1: [] } },
    log: [], selectedAbility: null,
    combatType: 'pve', format: '1v1',
    ...overrides
  }
}

describe('applyEnemyAI', () => {
  it('returns a valid attack action when enemy has no abilities', () => {
    const enemy = makeEnemy({ abilities: [] })
    const state = makeState()
    const action = applyEnemyAI(enemy, state)
    expect(action.type).toBe('attack')
    expect(action.sourceId).toBe('enemy_1')
    expect(action.targetIds).toHaveLength(1)
    expect(action.targetIds[0]).toMatch(/^ally_/)
  })

  it('returns a valid action when enemy has abilities off cooldown', () => {
    const enemy = makeEnemy({
      abilities: [
        { id: 'strong_attack', name: 'Strong', baseDamage: 15, scalingStat: 'fuerza', scalingFactor: 0.8 }
      ]
    })
    const state = makeState()
    const action = applyEnemyAI(enemy, state)
    expect(['attack', 'skill']).toContain(action.type)
    expect(action.sourceId).toBe('enemy_1')
    expect(action.targetIds).toHaveLength(1)
  })

  it('targets the ally with lowest HP', () => {
    const ally1 = makeAlly({ id: 'ally_1', currentHp: 50 })
    const ally2 = makeAlly({ id: 'ally_2', currentHp: 200, name: 'Mage' })
    const enemy = makeEnemy()
    const state = makeState({ allies: [ally1, ally2] })
    const action = applyEnemyAI(enemy, state)
    expect(action.targetIds[0]).toBe('ally_1')
  })

  it('returns skill action with abilityId when using a skill', () => {
    const enemy = makeEnemy({
      abilities: [
        { id: 'heal', name: 'Heal', baseDamage: 10, scalingStat: 'inteligencia', scalingFactor: 0.5 }
      ]
    })
    const ally = makeAlly({ currentHp: 10 })
    const state = makeState({ allies: [ally] })
    const action = applyEnemyAI(enemy, state)
    if (action.type === 'skill') {
      expect(action.abilityId).toBeDefined()
    }
    expect(action.sourceId).toBe('enemy_1')
  })

  it('returns basic attack when no abilities provided', () => {
    const enemy = makeEnemy({ abilities: [] })
    const state = makeState()
    const action = applyEnemyAI(enemy, state)
    expect(action.type).toBe('attack')
  })
})

describe('createDefaultAbilities', () => {
  it('creates two default abilities', () => {
    const abilities = createDefaultAbilities(5)
    expect(abilities).toHaveLength(2)
    expect(abilities[0].id).toBe('attack')
    expect(abilities[1].id).toBe('strong_attack')
  })

  it('scales damage with level', () => {
    const low = createDefaultAbilities(1)
    const high = createDefaultAbilities(10)
    expect(high[0].baseDamage).toBeGreaterThan(low[0].baseDamage)
    expect(high[1].baseDamage).toBeGreaterThan(low[1].baseDamage)
  })
})
