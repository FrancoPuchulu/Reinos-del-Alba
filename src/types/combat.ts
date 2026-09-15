import type { StatusEffectType, StatBlock, Skill } from './game.types'

export type CombatFormat = '1v1' | '2v2'
export type CombatType = 'pve' | 'pvp'
export type TargetAlias = 'ally_1' | 'ally_2' | 'enemy_1' | 'enemy_2'
export type EnemyAffix = 'vampiric' | 'thorns' | 'frenzy'

export function isTargetAlias(v: string): v is TargetAlias {
  return ['ally_1', 'ally_2', 'enemy_1', 'enemy_2'].includes(v)
}

export interface CombatEnemy {
  id: string
  name: string
  level: number
  stats: StatBlock
  maxHp: number
  currentHp: number
  maxMana: number
  currentMana: number
  abilities: EnemyAbility[]
  damage: { min: number; max: number }
  armor: number
  magicResist: number
  experienceReward: number
  goldReward: number
  itemDrops: string[]
  isBoss?: boolean
  affixes?: EnemyAffix[]
  ultimateSkill?: Skill
}

export interface EnemyAbility {
  id: string
  name: string
  baseDamage: number
  scalingStat: keyof StatBlock
  scalingFactor: number
  statusChance?: number
  statusType?: StatusEffectType
  statusDuration?: number
}

export interface StatusInstance {
  type: StatusEffectType
  duration: number
  source: string
  value?: number
  skippedTurn?: boolean
}

export interface CombatState {
  phase: 'idle' | 'playerTurn' | 'enemyTurn' | 'animating' | 'victory' | 'defeat'
  turn: number
  allies: CombatActor[]
  enemies: CombatEnemy[]
  statuses: { allies: Record<string, StatusInstance[]>; enemies: Record<string, StatusInstance[]> }
  log: CombatLogEntry[]
  selectedAbility: string | null
  combatType: CombatType
  format: CombatFormat
  extraTurnActive?: boolean
  enemyUltimateCharge?: number
}

export interface CombatActor {
  id: string
  name: string
  maxHp: number
  currentHp: number
  maxMana: number
  currentMana: number
  stats: StatBlock
  totalStats: StatBlock
  armor: number
  magicResist: number
  damage: { min: number; max: number }
  weaponDamage: { min: number; max: number }
  equipmentEffectTypes?: string[]
}

export interface CombatAction {
  type: 'skill' | 'attack' | 'defend' | 'item'
  sourceId: string
  targetIds: string[]
  abilityId?: string
  healing?: boolean
}

export interface DamageResult {
  amount: number
  type: 'physical' | 'magical' | 'true'
  critical: boolean
  blocked: boolean
  mitigated: number
  statusApplied: StatusInstance | null
  finalDamage: number
}

export interface CombatLogEntry {
  turn: number
  message: string
  type: 'damage' | 'heal' | 'status' | 'miss' | 'critical' | 'death' | 'buff' | 'system'
}

export type CombatEventType =
  | 'Attack'
  | 'CriticalHit'
  | 'Miss'
  | 'Heal'
  | 'StatusApplied'
  | 'Death'
  | 'LevelUp'
  | 'TurnStart'
  | 'TurnEnd'
  | 'Victory'
  | 'Defeat'
  | 'ArenaVictory'
  | 'ArenaDefeat'

export interface CombatEvent {
  type: CombatEventType
  turn: number
  source?: string
  target?: string
  value?: number
  statusType?: StatusEffectType
  timestamp: number
}
