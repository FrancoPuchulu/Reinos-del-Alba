// ── Hit Chance ──────────────────────────────────────────────
export const BASE_HIT_CHANCE = 95
export const MIN_HIT_CHANCE = 20
export const MAX_EVASION = 50

// ── Critical Hits ──────────────────────────────────────────
export const CRIT_CAP = 75
export const MAX_CRIT_DAMAGE = 200
export const DEFAULT_CRIT_CHANCE = 5
export const DEFAULT_CRIT_DAMAGE = 50
export const EQUIP_CRIT_BONUS = 5

// ── Mitigation ─────────────────────────────────────────────
export const MITIGATION_CAP = 0.6
export const MITIGATION_DENOMINATOR = 100
export const BLOCKED_THRESHOLD = 0.3
export const MIN_DAMAGE = 1

// ── Default Stats ──────────────────────────────────────────
export const DEFAULT_PRECISION = 80
export const DEFAULT_EVASION = 5
export const DEFAULT_REGEN_MANA = 3

// ── Potions ────────────────────────────────────────────────
export const HEALTH_POTION_HEAL = 50
export const MANA_POTION_RESTORE = 15

// ── Defend ─────────────────────────────────────────────────
export const DEFEND_ARMOR_MULTIPLIER = 0.5

// ── Extra Turn ─────────────────────────────────────────────
export const EXTRA_TURN_CHANCE = 30

// ── Status Effects ─────────────────────────────────────────
export const DEFAULT_STATUS_DAMAGE = {
  veneno: 5,
  sangrado: 8,
  quemadura: 6,
} as const

export const STATUS_DAMAGE_MULTIPLIER = 0.15
export const STATUS_DURATION_DEFAULT = 3

export const SKILL_BUFF_VALUES = {
  armorBuff: 30,
  resistanceBuff: 25,
  evasionBuff: 20,
  armorLink: 20,
  statBuff: 25,
  thornsMultiplier: 0.4,
} as const

export const SKILL_DEBUFF_VALUES = {
  armorDebuff: -30,
  resistanceDebuff: -20,
} as const

// ── Enemy Affixes ──────────────────────────────────────────
export const VAMPIRIC_HEAL_MULTIPLIER = 0.25
export const THORNS_AFFIX_MULTIPLIER = 0.2

// ── Life Steal ─────────────────────────────────────────────
export const EQUIP_LIFE_STEAL_BONUS = 3

// ── Player Actor Creation ──────────────────────────────────
export const PLAYER_BASE_HP = 80
export const PLAYER_HP_PER_VITALIDAD = 10
export const PLAYER_HP_PER_LEVEL = 5
export const PLAYER_BASE_MANA = 40
export const PLAYER_MANA_PER_INTEL = 8
export const PLAYER_MANA_PER_LEVEL = 3
export const PLAYER_DEFAULT_ARMOR = 5
export const PLAYER_DEFAULT_FUERZA = 10
export const PLAYER_ARMOR_FUERZA_SCALE = 0.3
export const PLAYER_MAGIC_RESIST_INTEL_SCALE = 0.25
export const PLAYER_DEFAULT_MAGIC_RESIST = 5
export const PLAYER_DEFAULT_VITALIDAD = 12
export const PLAYER_DEFAULT_INTEL = 10

// ── Enemy Actor Creation ───────────────────────────────────
export const ENEMY_BASE_HP = 60
export const ENEMY_HP_PER_VITALIDAD = 8
export const ENEMY_HP_PER_LEVEL = 4
export const ENEMY_BASE_MANA = 30
export const ENEMY_MIN_DAMAGE_BASE = 4
export const ENEMY_MAX_DAMAGE_BASE = 8
export const ENEMY_DAMAGE_PER_LEVEL_MAX = 2
export const ENEMY_ARMOR_STRENGTH_SCALE = 0.2
export const ENEMY_DEFAULT_ARMOR = 3
export const ENEMY_BASE_XP = 15
export const ENEMY_XP_PER_LEVEL = 5
export const ENEMY_BASE_GOLD = 5
export const ENEMY_GOLD_PER_LEVEL = 3
export const ENEMY_DEFAULT_VITALIDAD = 10
export const ENEMY_DEFAULT_FUERZA = 10
