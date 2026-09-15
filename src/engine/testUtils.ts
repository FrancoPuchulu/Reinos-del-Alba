import type { CombatActor, CombatEnemy, CombatState } from '../types/combat'
import { createCombatState } from './combat'

export function createMockPlayer(overrides?: Partial<CombatActor>): CombatActor {
  return {
    id: 'player',
    name: 'Héroe',
    maxHp: 100,
    currentHp: 100,
    maxMana: 50,
    currentMana: 50,
    stats: { fuerza: 15, inteligencia: 10, vitalidad: 12 },
    totalStats: {},
    armor: 0,
    magicResist: 0,
    damage: { min: 10, max: 15 },
    weaponDamage: { min: 10, max: 15 },
    ...overrides,
  }
}

export function createMockEnemy(overrides?: Partial<CombatEnemy>): CombatEnemy {
  return {
    id: 'enemy_1',
    name: 'Goblin',
    level: 3,
    stats: { fuerza: 10 },
    maxHp: 100,
    currentHp: 100,
    maxMana: 30,
    currentMana: 30,
    abilities: [],
    damage: { min: 8, max: 12 },
    armor: 0,
    magicResist: 0,
    experienceReward: 30,
    goldReward: 14,
    itemDrops: [],
    affixes: [],
    ...overrides,
  }
}

export function createBattleState(
  playerOverrides?: Partial<CombatActor>,
  enemyOverrides?: Partial<CombatEnemy>
): CombatState {
  const player = createMockPlayer(playerOverrides)
  const enemy = createMockEnemy(enemyOverrides)
  return createCombatState([player], [enemy])
}
