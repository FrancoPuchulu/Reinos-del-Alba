import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCombatState, calculateDamage, processTurn, createEnemy, createPlayerActor } from '../combat'
import type { CombatActor, CombatEnemy, CombatAction, CombatState } from '../../types/combat'
import { gameEventBus } from '../../events/EventBus'

function makeAlly(overrides?: Partial<CombatActor>): CombatActor {
  return {
    id: 'ally_1', name: 'Hero', maxHp: 200, currentHp: 200,
    maxMana: 100, currentMana: 100,
    stats: { probCritico: 0, dañoCritico: 50 },
    totalStats: {},
    armor: 0, magicResist: 0,
    damage: { min: 5, max: 10 },
    weaponDamage: { min: 5, max: 10 },
    ...overrides
  }
}

function makeEnemy(overrides?: Partial<CombatEnemy>): CombatEnemy {
  return {
    id: 'enemy_1', name: 'Goblin', level: 1,
    stats: { probCritico: 0, dañoCritico: 50 },
    maxHp: 100, currentHp: 100,
    maxMana: 30, currentMana: 30,
    abilities: [],
    damage: { min: 3, max: 8 },
    armor: 0, magicResist: 0,
    experienceReward: 20, goldReward: 10, itemDrops: [],
    ...overrides
  }
}

function _makeState(overrides?: Partial<CombatState>) {
  const allies = overrides?.allies ?? [makeAlly()]
  const enemies = overrides?.enemies ?? [makeEnemy()]
  return createCombatState(allies, enemies, 'pve', '1v1')
}

beforeEach(() => {
  gameEventBus.clear()
  vi.restoreAllMocks()
})

describe('createCombatState', () => {
  it('creates initial combat state with correct structure', () => {
    const allies = [makeAlly()]
    const enemies = [makeEnemy()]
    const state = createCombatState(allies, enemies)
    expect(state.phase).toBe('playerTurn')
    expect(state.turn).toBe(1)
    expect(state.allies).toBe(allies)
    expect(state.enemies).toBe(enemies)
    expect(state.combatType).toBe('pve')
    expect(state.format).toBe('1v1')
    expect(state.selectedAbility).toBeNull()
  })

  it('initializes empty status records for each actor', () => {
    const allies = [makeAlly({ id: 'a1' }), makeAlly({ id: 'a2' })]
    const enemies = [makeEnemy({ id: 'e1' })]
    const state = createCombatState(allies, enemies)
    expect(state.statuses.allies).toEqual({ a1: [], a2: [] })
    expect(state.statuses.enemies).toEqual({ e1: [] })
  })

  it('includes a system log entry', () => {
    const state = createCombatState([makeAlly()], [makeEnemy()])
    expect(state.log).toHaveLength(1)
    expect(state.log[0].type).toBe('system')
  })

  it('supports pvp combat type', () => {
    const state = createCombatState([makeAlly()], [makeEnemy()], 'pvp', '2v2')
    expect(state.combatType).toBe('pvp')
    expect(state.format).toBe('2v2')
  })
})

describe('calculateDamage', () => {
  it('calculates basic attack damage', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ally = makeAlly({ weaponDamage: { min: 10, max: 10 } })
    const enemy = makeEnemy()
    const state = createCombatState([ally], [enemy])
    const action: CombatAction = { type: 'attack', sourceId: 'ally_1', targetIds: ['enemy_1'] }
    const { results, log, newState } = calculateDamage(action, state, null)
    expect(results).toHaveLength(1)
    expect(results[0].finalDamage).toBeGreaterThan(0)
    expect(results[0].type).toBe('physical')
    expect(newState.enemies[0].currentHp).toBeLessThan(100)
    expect(log.length).toBeGreaterThan(0)
  })

  it('deals damage with a skill', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ally = makeAlly({
      stats: { fuerza: 20, probCritico: 0, dañoCritico: 50 },
      weaponDamage: { min: 10, max: 10 }
    })
    const enemy = makeEnemy({ maxHp: 500, currentHp: 500 })
    const state = createCombatState([ally], [enemy])
    const skill = {
      id: 'test', name: 'Test', effect: '', unlockLevel: 1, maxCharges: 5,
      baseDamage: 20, scalingStat: 'fuerza' as const, scalingFactor: 1.0, weaponMultiplier: 0.5
    }
    const action: CombatAction = { type: 'skill', sourceId: 'ally_1', targetIds: ['enemy_1'], abilityId: 'test' }
    const { results } = calculateDamage(action, state, skill)
    expect(results).toHaveLength(1)
    expect(results[0].finalDamage).toBeGreaterThan(0)
  })

  it('heals target when action is healing', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ally = makeAlly({ currentHp: 100, maxHp: 200, weaponDamage: { min: 10, max: 10 } })
    const state = createCombatState([ally], [makeEnemy()])
    const action: CombatAction = { type: 'attack', sourceId: 'ally_1', targetIds: ['ally_1'], healing: true }
    const { results, newState } = calculateDamage(action, state, null)
    expect(results).toHaveLength(1)
    expect(newState.allies[0].currentHp).toBeGreaterThan(100)
  })

  it('caps healing at maxHp', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ally = makeAlly({ currentHp: 195, maxHp: 200, weaponDamage: { min: 10, max: 10 } })
    const state = createCombatState([ally], [makeEnemy()])
    const action: CombatAction = { type: 'attack', sourceId: 'ally_1', targetIds: ['ally_1'], healing: true }
    const { newState } = calculateDamage(action, state, null)
    expect(newState.allies[0].currentHp).toBe(200)
  })

  it('returns empty results when source not found', () => {
    const state = createCombatState([makeAlly()], [makeEnemy()])
    const action: CombatAction = { type: 'attack', sourceId: 'nonexistent', targetIds: ['enemy_1'] }
    const { results } = calculateDamage(action, state, null)
    expect(results).toHaveLength(0)
  })
})

describe('processTurn', () => {
  it('processes a full turn and increments turn counter', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ally = makeAlly()
    const enemy = makeEnemy({ maxHp: 999, currentHp: 999 })
    const state = createCombatState([ally], [enemy])
    const action: CombatAction = { type: 'attack', sourceId: 'ally_1', targetIds: ['enemy_1'] }
    const result = processTurn(state, action)
    expect(result.turn).toBe(2)
    expect(result.phase).toBe('playerTurn')
    expect(result.enemies[0].currentHp).toBeLessThan(999)
  })

  it('returns victory when all enemies die', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ally = makeAlly({ weaponDamage: { min: 100, max: 100 } })
    const enemy = makeEnemy({ maxHp: 5, currentHp: 5 })
    const state = createCombatState([ally], [enemy])
    const action: CombatAction = { type: 'attack', sourceId: 'ally_1', targetIds: ['enemy_1'] }
    const result = processTurn(state, action)
    expect(result.phase).toBe('victory')
    expect(result.enemies[0].currentHp).toBe(0)
  })

  it('returns defeat when all allies die', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const ally = makeAlly({ maxHp: 1, currentHp: 1 })
    const enemy = makeEnemy({ damage: { min: 50, max: 50 } })
    const state = createCombatState([ally], [enemy])
    const action: CombatAction = { type: 'attack', sourceId: 'ally_1', targetIds: ['enemy_1'] }
    const result = processTurn(state, action)
    expect(result.phase).toBe('defeat')
  })

  it('skips player damage on defend action', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ally = makeAlly({ maxHp: 500, currentHp: 500 })
    const enemy = makeEnemy({ damage: { min: 1, max: 1 } })
    const state = createCombatState([ally], [enemy])
    const action: CombatAction = { type: 'defend', sourceId: 'ally_1', targetIds: [] }
    const result = processTurn(state, action)
    expect(result.enemies[0].currentHp).toBe(100)
  })
})

describe('processStatusEffects via processTurn', () => {
  it('applies veneno damage and decrements duration', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ally = makeAlly({ currentHp: 200, maxHp: 200 })
    const enemy = makeEnemy({ damage: { min: 1, max: 1 } })
    const state = createCombatState([ally], [enemy])
    state.statuses.allies['ally_1'] = [
      { type: 'veneno', duration: 2, value: 5, source: 'enemy_1' }
    ]
    const action: CombatAction = { type: 'defend', sourceId: 'ally_1', targetIds: [] }
    const result = processTurn(state, action)
    expect(result.allies[0].currentHp).toBe(194)
    expect(result.statuses.allies['ally_1']).toHaveLength(1)
    expect(result.statuses.allies['ally_1'][0].duration).toBe(1)
  })

  it('applies sangrado damage and decrements duration', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ally = makeAlly({ currentHp: 200, maxHp: 200 })
    const enemy = makeEnemy({ damage: { min: 1, max: 1 } })
    const state = createCombatState([ally], [enemy])
    state.statuses.allies['ally_1'] = [
      { type: 'sangrado', duration: 3, value: 8, source: 'enemy_1' }
    ]
    const action: CombatAction = { type: 'defend', sourceId: 'ally_1', targetIds: [] }
    const result = processTurn(state, action)
    expect(result.allies[0].currentHp).toBe(191)
    expect(result.statuses.allies['ally_1']).toHaveLength(1)
    expect(result.statuses.allies['ally_1'][0].duration).toBe(2)
  })

  it('applies quemadura damage and decrements duration', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ally = makeAlly({ currentHp: 200, maxHp: 200 })
    const enemy = makeEnemy({ damage: { min: 1, max: 1 } })
    const state = createCombatState([ally], [enemy])
    state.statuses.allies['ally_1'] = [
      { type: 'quemadura', duration: 2, value: 6, source: 'enemy_1' }
    ]
    const action: CombatAction = { type: 'defend', sourceId: 'ally_1', targetIds: [] }
    const result = processTurn(state, action)
    expect(result.allies[0].currentHp).toBe(193)
    expect(result.statuses.allies['ally_1']).toHaveLength(1)
    expect(result.statuses.allies['ally_1'][0].duration).toBe(1)
  })

  it('removes status when duration reaches 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ally = makeAlly({ currentHp: 200, maxHp: 200 })
    const enemy = makeEnemy({ damage: { min: 1, max: 1 } })
    const state = createCombatState([ally], [enemy])
    state.statuses.allies['ally_1'] = [
      { type: 'veneno', duration: 1, value: 5, source: 'enemy_1' }
    ]
    const action: CombatAction = { type: 'defend', sourceId: 'ally_1', targetIds: [] }
    const result = processTurn(state, action)
    expect(result.allies[0].currentHp).toBe(194)
    expect(result.statuses.allies['ally_1']).toHaveLength(0)
  })

  it('applies default damage when status value is undefined', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ally = makeAlly({ currentHp: 200, maxHp: 200 })
    const enemy = makeEnemy({ damage: { min: 1, max: 1 } })
    const state = createCombatState([ally], [enemy])
    state.statuses.allies['ally_1'] = [
      { type: 'veneno', duration: 2, source: 'enemy_1' }
    ]
    const action: CombatAction = { type: 'defend', sourceId: 'ally_1', targetIds: [] }
    const result = processTurn(state, action)
    expect(result.allies[0].currentHp).toBe(194)
  })

  it('clamps HP to 0 from status damage', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ally = makeAlly({ currentHp: 3, maxHp: 200 })
    const enemy = makeEnemy({ damage: { min: 1, max: 1 } })
    const state = createCombatState([ally], [enemy])
    state.statuses.allies['ally_1'] = [
      { type: 'sangrado', duration: 2, value: 8, source: 'enemy_1' }
    ]
    const action: CombatAction = { type: 'defend', sourceId: 'ally_1', targetIds: [] }
    const result = processTurn(state, action)
    expect(result.allies[0].currentHp).toBe(0)
  })

  it('processes status effects on enemies too', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ally = makeAlly({ currentHp: 500, maxHp: 500, weaponDamage: { min: 1, max: 1 } })
    const enemy = makeEnemy({ currentHp: 200, maxHp: 200, damage: { min: 1, max: 1 } })
    const state = createCombatState([ally], [enemy])
    state.statuses.enemies['enemy_1'] = [
      { type: 'quemadura', duration: 2, value: 10, source: 'ally_1' }
    ]
    const action: CombatAction = { type: 'attack', sourceId: 'ally_1', targetIds: ['enemy_1'] }
    const result = processTurn(state, action)
    expect(result.statuses.enemies['enemy_1']).toHaveLength(1)
    expect(result.statuses.enemies['enemy_1'][0].duration).toBe(1)
  })
})

describe('createEnemy', () => {
  it('creates enemy with correct HP formula', () => {
    const enemy = createEnemy('e1', 'Goblin', 5, { fuerza: 10, vitalidad: 12 }, [])
    expect(enemy.maxHp).toBe(60 + 12 * 8 + 5 * 4)
    expect(enemy.currentHp).toBe(enemy.maxHp)
  })

  it('creates enemy with correct damage and armor', () => {
    const enemy = createEnemy('e1', 'Orc', 3, { fuerza: 15, armadura: 5 }, [])
    expect(enemy.damage.min).toBe(4 + 3)
    expect(enemy.damage.max).toBe(8 + 3 * 2)
    expect(enemy.armor).toBe(5 + Math.floor(15 * 0.2))
  })

  it('creates enemy with correct rewards', () => {
    const enemy = createEnemy('e1', 'Imp', 10, {}, [])
    expect(enemy.experienceReward).toBe(15 + 10 * 5)
    expect(enemy.goldReward).toBe(5 + 10 * 3)
  })

  it('defaults missing stats to 10', () => {
    const enemy = createEnemy('e1', 'Slime', 1, {}, [])
    expect(enemy.maxHp).toBe(60 + 10 * 8 + 1 * 4)
    expect(enemy.armor).toBe(3 + Math.floor(10 * 0.2))
  })
})

describe('createPlayerActor', () => {
  it('creates player with correct HP and mana', () => {
    const actor = createPlayerActor('p1', 'Hero', { vitalidad: 12, inteligencia: 10 }, { min: 8, max: 14 }, 1)
    expect(actor.maxHp).toBe(80 + 12 * 10 + 1 * 5)
    expect(actor.maxMana).toBe(40 + 10 * 8 + 1 * 3)
    expect(actor.currentHp).toBe(actor.maxHp)
    expect(actor.currentMana).toBe(actor.maxMana)
  })

  it('creates player with correct armor and magic resist', () => {
    const actor = createPlayerActor('p1', 'Hero', { fuerza: 15, armadura: 10, inteligencia: 14, resistenciaMagica: 8 }, { min: 8, max: 14 }, 5)
    expect(actor.armor).toBe(10 + Math.floor(15 * 0.3))
    expect(actor.magicResist).toBe(8 + Math.floor(14 * 0.25))
  })

  it('defaults missing stats', () => {
    const actor = createPlayerActor('p1', 'Hero', {}, { min: 5, max: 10 }, 1)
    expect(actor.maxHp).toBe(80 + 12 * 10 + 1 * 5)
    expect(actor.maxMana).toBe(40 + 10 * 8 + 1 * 3)
  })
})
