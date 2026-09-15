import type { StatBlock } from '../types/game.types'
import type { ActiveExpedition, BonusBossData, Difficulty } from '../types/game.types'
import { MONSTER_POOL, type EnemyTemplate } from './enemies'
import { roll } from '../engine/utils'

const DIFFICULTY_HP_MULT: Record<Difficulty, number> = {
  normal: 1.5,
  heroico: 2.0,
  mitico: 3.0,
}

const DIFFICULTY_STAT_MULT: Record<Difficulty, number> = {
  normal: 1.2,
  heroico: 1.8,
  mitico: 2.5,
}

const CATEGORY_BONUS_NAMES: Record<string, string[]> = {
  misiones: [
    'Señor de la Guerra Abisal',
    'Centinela de la Oscuridad',
    'Archimago Corrompido',
  ],
  mazmorras: [
    'Tirano de las Profundidades',
    'Guardián del Sepulcro',
    'General de las Sombras',
  ],
  bandas: [
    'Destructor de Mundos',
    'Emperador del Vacío',
    'El Devorador Final',
  ],
}

const CATEGORY_CLASSES: Record<string, string[]> = {
  misiones: ['Señor Oscuro', 'Mago Corrompido', 'Guerrero Abisal'],
  mazmorras: ['Titán Profundo', 'General Sombrio', 'Señor de la Plaga'],
  bandas: ['Arquidemonio', 'El Rey Exánime', 'Señor del Caos'],
}

function pickRandom<T>(arr: T[]): T {
  return arr[roll(arr.length) - 1]
}

function generateBonusBossStats(level: number, difficulty: Difficulty): StatBlock {
  const mult = DIFFICULTY_STAT_MULT[difficulty]
  return {
    fuerza: Math.floor((15 + level * 2) * mult),
    agilidad: Math.floor((10 + level) * mult),
    inteligencia: Math.floor((12 + level) * mult),
    vitalidad: Math.floor((18 + level * 2) * mult),
    armadura: Math.floor((10 + level / 2) * mult),
    resistenciaMagica: Math.floor((8 + level / 3) * mult),
    probCritico: Math.floor(15 + level * 0.5),
    dañoCritico: Math.floor(80 + level * 2),
    velocidad: Math.floor(10 + level * 0.3),
    precision: 85,
    esquiva: Math.floor(5 + level * 0.2),
    roboVida: Math.floor(level * 0.3),
    regenMana: 5,
  }
}

function generateBonusBossAbilities(level: number, difficulty: Difficulty, template: EnemyTemplate) {
  const baseMult = DIFFICULTY_STAT_MULT[difficulty]
  return template.abilityTemplates.map(a => ({
    id: `bonus_${a.id}`,
    name: a.nombre,
    baseDamage: Math.floor(a.baseDamage * baseMult),
    scalingStat: a.scalingStat ?? 'fuerza',
    scalingFactor: a.scalingFactor * baseMult,
    cooldown: a.cooldown,
    currentCooldown: 0,
    statusChance: a.statusChance,
    statusType: a.statusType,
    statusDuration: a.statusDuration,
  }))
}

export function generateBonusBossForExpedition(expedition: ActiveExpedition): BonusBossData {
  const level = expedition.durationMinutes >= 120
    ? expedition.durationMinutes / 4
    : expedition.durationMinutes >= 45
      ? expedition.durationMinutes / 3
      : expedition.durationMinutes

  const bossLevel = Math.max(1, Math.floor(level))
  const hpMult = DIFFICULTY_HP_MULT[expedition.difficulty]
  const names = CATEGORY_BONUS_NAMES[expedition.category] ?? CATEGORY_BONUS_NAMES.misiones
  const classes = CATEGORY_CLASSES[expedition.category] ?? CATEGORY_CLASSES.misiones
  const bosses = MONSTER_POOL.filter(m => m.isBoss)
  const template = bosses.length > 0 ? pickRandom(bosses) : MONSTER_POOL[0]

  const calculatedMaxHp = Math.floor((template.baseHp + bossLevel * template.levelMultiplier) * hpMult)

  return {
    name: pickRandom(names),
    className: pickRandom(classes),
    level: bossLevel,
    currentHp: calculatedMaxHp,
    maxHp: calculatedMaxHp,
    sprite: template.sprites.front,
    abilities: generateBonusBossAbilities(bossLevel, expedition.difficulty, template),
    stats: generateBonusBossStats(bossLevel, expedition.difficulty),
    isBoss: true,
    expeditionName: expedition.adventureName,
    expeditionCategory: expedition.category,
    expeditionDifficulty: expedition.difficulty,
  }
}
