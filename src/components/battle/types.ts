import type { StatBlock, Skill } from '../../types/game.types'
import type { EnemyAbility, EnemyAffix } from '../../types/combat'

export interface PlayerInputData {
  id?: string
  name: string
  clase?: string
  race?: string
  level?: number
  stats: StatBlock
  weaponDamage?: { min: number; max: number }
  habilidades?: Array<{
    id: string
    nombre: string
    cargas: number
    cargasMaximas: number
  }>
  fullSkills?: Skill[]
  equipmentEffects?: string[]
  hpMod?: number
}

export interface EnemyInputData {
  id?: string
  name: string
  clase?: string
  level?: number
  stats: StatBlock
  maxHp?: number
  hp?: number
  abilities?: EnemyAbility[]
  isBoss?: boolean
  affixes?: EnemyAffix[]
  ultimateSkill?: Skill | null
}

export interface FloatingDamage {
  id: number
  amount: number
  kind: 'physical' | 'magical' | 'critical' | 'heal'
  targetSide: 'player' | 'enemy'
}

export const CLASS_EMOJIS: Record<string, string> = {
  Guerrero: '⚔️',
  Mago: '🔮',
  Druida: '🌿',
  Brujo: '💀',
}

export const ENEMY_EMOJIS: Record<string, string> = {
  default: '👹',
  boss: '🐉',
}

export const STATUS_ICONS: Record<string, string> = {
  veneno: '🟢', sangrado: '🔴', quemadura: '🟠', congelacion: '🔵',
  aturdimiento: '⚡', silencio: '🔇', ceguera: '👁️',
  buff_fuerza: '💪', buff_inteligencia: '🧠', buff_esquiva: '💨',
  debuff_armadura: '🛡️', debuff_resistenciaMagica: '✨', thorns: '🌵',
}

export const DAMAGE_COLORS: Record<FloatingDamage['kind'], string> = {
  physical: '#cc2233',
  magical: '#4080c0',
  critical: '#d4a017',
  heal: '#30a030',
}

export interface SpellVFX {
  id: number
  kind: 'slash' | 'burst' | 'heal'
  targetSide: 'player' | 'enemy'
}
