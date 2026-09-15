export type Rarity = 'normal' | 'magico' | 'epico' | 'unico'

export type Race = 'Orco' | 'Minotauro' | 'NoMuerto' | 'Goblin' | 'Humano' | 'Enano' | 'Gnomo' | 'AltoElfo'
export type Class = 'Guerrero' | 'Mago' | 'Druida' | 'Brujo'

export interface RaceProfile {
  label: string
  color: string
  description: string
}

export interface StatBlock {
  fuerza?: number
  agilidad?: number
  inteligencia?: number
  vitalidad?: number
  armadura?: number
  resistenciaMagica?: number
  probCritico?: number
  dañoCritico?: number
  velocidad?: number
  precision?: number
  esquiva?: number
  roboVida?: number
  regenMana?: number
}

export type EquipmentSlot = 'armaPrincipal' | 'armaSecundaria' | 'armaDistancia' | 'armadura' | 'casco' | 'hombros' | 'pantalones' | 'guantes' | 'botas' | 'amuleto' | 'anillo'

export type ItemEffectType =
  | 'reduceCooldown'
  | 'extraCharges'
  | 'buffDuration'
  | 'statusOnHit'
  | 'resourceGen'
  | 'critBonus'
  | 'passiveAura'
  | 'bossDamage'
  | 'lifeSteal'
  | 'extraTurn'

export type StatusEffectType =
  | 'veneno'
  | 'sangrado'
  | 'quemadura'
  | 'congelacion'
  | 'aturdimiento'
  | 'silencio'
  | 'ceguera'
  | 'buff_fuerza'
  | 'buff_inteligencia'
  | 'buff_esquiva'
  | 'debuff_armadura'
  | 'debuff_resistenciaMagica'
  | 'thorns'

export interface ItemEffect {
  type: ItemEffectType
  value?: number
  statusType?: StatusEffectType
  duration?: number
  chance?: number
}

export interface ItemDefinition {
  id: string
  name: string
  slot: EquipmentSlot
  rarity: Rarity
  class?: string
  stats: StatBlock
  effects?: ItemEffect[]
  description: string
  levelRequired?: number
  damage?: { min: number; max: number }
  durability?: number
  maxDurability?: number
  price?: number
}

export interface Equipment {
  armaPrincipal: ItemDefinition | null
  armaSecundaria: ItemDefinition | null
  armaDistancia: ItemDefinition | null
  armadura: ItemDefinition | null
  casco: ItemDefinition | null
  hombros: ItemDefinition | null
  pantalones: ItemDefinition | null
  guantes: ItemDefinition | null
  botas: ItemDefinition | null
  amuleto: ItemDefinition | null
  anillo: ItemDefinition | null
  [key: string]: ItemDefinition | null
}

export interface Skill {
  id: string
  name: string
  effect: string
  unlockLevel: number
  maxCharges: number
  baseDamage?: number
  scalingStat?: keyof StatBlock
  scalingFactor?: number
  weaponMultiplier?: number
  cooldown?: number
  cost?: number
  statusChance?: number
  statusType?: string
  statusDuration?: number
  isUltimate?: boolean
  ultimateResource?: string
}

export interface SkillStyle {
  name: string
  summary: string
  skills: Skill[]
}

export interface Adventure {
  name: string
  time: number
  players: string
  reward: string
  item: string
}

export interface InventoryItem {
  id?: string
  name: string
  source: string
  rarity: Rarity
  stats?: StatBlock
  slot?: string
  equipped?: boolean
  icon?: string
  baseDamage?: number
  description?: string
  levelRequired?: number
  durability?: number
  maxDurability?: number
  price?: number
}

export interface Character {
  name: string
  race: Race
  class: Class
  level: number
  wallet: {
    gold: number
    silver: number
    copper: number
  }
  inventory: InventoryItem[]
  stash: InventoryItem[]
  equipment: Equipment
  talentPoints: number
  talents: string[]
  stats: StatBlock
  skills: {
    activeStyle: string
    equipped: string[]
    charges: Record<string, number>
  }
  ultimateEquipped?: string
  experience: number
  experienceToNext: number
  arenaRank?: ArenaRank
  loadouts?: Record<string, Record<string, string>>
}

export interface ArenaRank {
  eloRating: number
  wins: number
  losses: number
}

export interface Talent {
  id: string
  branch: 'ofensiva' | 'maestria' | 'supervivencia' | 'central'
  tier: number
  requires?: string[]
  name: string
  description: string
  cost: number
  stat?: keyof StatBlock
  amount?: number
  statMix?: Partial<StatBlock>
  allStats?: number
  chargesBonus?: number
}

export type Difficulty = 'normal' | 'heroico' | 'mitico'

export interface BonusBossData {
  name: string
  className: string
  level: number
  currentHp: number
  maxHp: number
  sprite: string
  abilities: Array<{
    id: string
    name: string
    baseDamage: number
    scalingStat: string
    scalingFactor: number
    cooldown: number
    currentCooldown: number
    statusChance?: number
    statusType?: string
    statusDuration?: number
  }>
  stats: StatBlock
  isBoss: true
  expeditionName: string
  expeditionCategory: 'misiones' | 'mazmorras' | 'bandas'
  expeditionDifficulty: Difficulty
}

export interface ActiveExpedition {
  adventureName: string
  category: 'misiones' | 'mazmorras' | 'bandas'
  difficulty: Difficulty
  startTime: number
  durationMinutes: number
  bonusBossReady?: boolean
  bonusBossData?: BonusBossData
}

export const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  normal: 1,
  heroico: 1.5,
  mitico: 2.5
}

export const RARITY_WEIGHTS: Record<Difficulty, { normal: number; magico: number; epico: number; unico: number }> = {
  normal: { normal: 75, magico: 20, epico: 4, unico: 1 },
  heroico: { normal: 40, magico: 35, epico: 20, unico: 5 },
  mitico: { normal: 10, magico: 35, epico: 35, unico: 20 }
}

export const STAT_KEYS: (keyof StatBlock)[] = [
  'fuerza', 'agilidad', 'inteligencia', 'vitalidad',
  'armadura', 'resistenciaMagica', 'probCritico', 'dañoCritico',
  'velocidad', 'precision', 'esquiva', 'roboVida', 'regenMana'
]

// ── Reward Preview ──────────────────────────────────────────

export interface RewardPreview {
  gold: { min: number; max: number }
  xp: { min: number; max: number }
  possibleLoot: { name: string; rarity: Rarity }[]
}

// ── Raid Types ─────────────────────────────────────────────

export type RaidRole = 'tank' | 'healer' | 'dps'

export interface RaidPhase {
  name: string
  hpThreshold: number
  bossAbility: string
  bossDamage: number
  bossDamageType: 'physical' | 'magical' | 'aoe'
  description: string
}

export interface RaidBossConfig {
  id: string
  name: string
  level: number
  maxHp: number
  damage: { min: number; max: number }
  armor: number
  magicResist: number
  description: string
  rewardPreview: RewardPreview
  phases: RaidPhase[]
}

export interface RaidMember {
  id: string
  name: string
  role: RaidRole
  maxHp: number
  currentHp: number
  attackPower: number
  healPower: number
  armor: number
  magicResist: number
}

export interface RaidCombatState {
  boss: {
    name: string
    level: number
    maxHp: number
    currentHp: number
    damage: { min: number; max: number }
    armor: number
    magicResist: number
    currentPhase: number
  }
  members: RaidMember[]
  turn: number
  log: string[]
  phase: 'lobby' | 'combat' | 'victory' | 'defeat'
  playerAction?: 'attack' | 'defend' | 'heal'
}

