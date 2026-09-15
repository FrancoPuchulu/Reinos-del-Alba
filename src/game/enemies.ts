import type { EnemyAbility } from '../types/combat';
import { roll } from '../engine/utils';

export interface EnemyTemplate {
  name: string;
  className: string;
  baseHp: number;
  levelMultiplier: number;
  sprites: { front: string };
  abilityTemplates: {
    id: string;
    nombre: string;
    baseDamage: number;
    scalingFactor: number;
    cooldown: number;
    scalingStat?: 'fuerza' | 'inteligencia';
    statusChance?: number;
    statusType?: string;
    statusDuration?: number;
  }[];
  isBoss?: boolean;
}

export const MONSTER_POOL: EnemyTemplate[] = [
  {
    name: "Espíritu del Abismo",
    className: "Espectro Cifrado",
    baseHp: 90,
    levelMultiplier: 15,
    sprites: { front: "[Sprite Espíritu]" },
    abilityTemplates: [
      { id: "e_abyssal_strike", nombre: "Golpe del Abismo", baseDamage: 12, scalingFactor: 1.2, cooldown: 2 }
    ]
  },
  {
    name: "Monje Corrompido",
    className: "Flagelante de Ceniza",
    baseHp: 110,
    levelMultiplier: 18,
    sprites: { front: "[Sprite Monje]" },
    abilityTemplates: [
      { id: "e_whip", nombre: "Azote de Ceniza", baseDamage: 15, scalingFactor: 1.4, cooldown: 0 }
    ]
  },
  {
    name: "Sombra del Campanario",
    className: "Siniestro Alado",
    baseHp: 80,
    levelMultiplier: 12,
    sprites: { front: "[Sprite Sombra]" },
    abilityTemplates: [
      { id: "e_swoop", nombre: "Picado Siniestro", baseDamage: 10, scalingFactor: 1.1, cooldown: 3 }
    ]
  },
  {
    name: "Inquisidor Ciego",
    className: "Verdugo del Coro",
    baseHp: 130,
    levelMultiplier: 22,
    sprites: { front: "[Sprite Inquisidor]" },
    abilityTemplates: [
      { id: "e_judgment", nombre: "Juicio Ciego", baseDamage: 20, scalingFactor: 1.8, cooldown: 4 }
    ]
  },
  {
    name: "Señor de la Oscuridad",
    className: "Señor Oscuro",
    baseHp: 350,
    levelMultiplier: 45,
    sprites: { front: "[Sprite Señor Oscuro]" },
    isBoss: true,
    abilityTemplates: [
      { id: "boss_dark_slash", nombre: "Tajo de la Oscuridad", baseDamage: 30, scalingFactor: 1.5, cooldown: 0, scalingStat: 'fuerza' },
      { id: "boss_shadow_bolt", nombre: "Bolt Sombrío", baseDamage: 25, scalingFactor: 1.3, cooldown: 2, scalingStat: 'inteligencia', statusChance: 50, statusType: "silencio", statusDuration: 2 },
      { id: "boss_fear", nombre: "Ola de Miedo", baseDamage: 15, scalingFactor: 0.8, cooldown: 3, scalingStat: 'inteligencia', statusChance: 70, statusType: "aturdimiento", statusDuration: 1 },
      { id: "boss_void_eruption", nombre: "Erupción del Vacío", baseDamage: 45, scalingFactor: 2.0, cooldown: 5, scalingStat: 'inteligencia' }
    ]
  },
  {
    name: "Guardián del Abismo",
    className: "Titán Profundo",
    baseHp: 500,
    levelMultiplier: 50,
    sprites: { front: "[Sprite Guardián]" },
    isBoss: true,
    abilityTemplates: [
      { id: "boss_tremor", nombre: "Temblor Abisal", baseDamage: 22, scalingFactor: 1.2, cooldown: 0, scalingStat: 'fuerza', statusChance: 40, statusType: "ceguera", statusDuration: 2 },
      { id: "boss_crushing_blow", nombre: "Golpe Aplastante", baseDamage: 35, scalingFactor: 1.6, cooldown: 3, scalingStat: 'fuerza' },
      { id: "boss_abyssal_heal", nombre: "Regeneración Abisal", baseDamage: 25, scalingFactor: 1.0, cooldown: 4, scalingStat: 'inteligencia' },
      { id: "boss_ground_slam", nombre: "Golpe de Tierra", baseDamage: 28, scalingFactor: 1.4, cooldown: 2, scalingStat: 'fuerza', statusChance: 60, statusType: "congelacion", statusDuration: 1 }
    ]
  }
];

export const generateEnemyForLevel = (playerLevel: number) => {
  const bossless = MONSTER_POOL.filter(m => !m.isBoss);
  const template = bossless[roll(bossless.length) - 1];
  const calculatedMaxHp = template.baseHp + (playerLevel * template.levelMultiplier);

  const mappedAbilities: EnemyAbility[] = template.abilityTemplates.map(a => ({
    id: a.id,
    name: a.nombre,
    baseDamage: a.baseDamage,
    scalingStat: a.scalingStat ?? 'fuerza',
    scalingFactor: a.scalingFactor,
    cooldown: a.cooldown,
    currentCooldown: 0,
    statusChance: a.statusChance,
    statusType: a.statusType as EnemyAbility['statusType'],
    statusDuration: a.statusDuration
  }));

  return {
    name: template.name,
    className: template.className,
    level: Math.max(1, playerLevel + roll(3) - 2),
    currentHp: calculatedMaxHp,
    maxHp: calculatedMaxHp,
    sprite: template.sprites.front,
    abilities: mappedAbilities,
    stats: {
      fuerza: 10 + playerLevel,
      agilidad: 8,
      inteligencia: 6,
      vitalidad: 10,
      armadura: 5 + Math.floor(playerLevel / 3),
      resistenciaMagica: 3 + Math.floor(playerLevel / 4)
    }
  };
};

export const generateBossForLevel = (playerLevel: number) => {
  const bossTemplates = MONSTER_POOL.filter(m => m.isBoss);
  const template = bossTemplates[roll(bossTemplates.length) - 1];
  const calculatedMaxHp = template.baseHp + (playerLevel * template.levelMultiplier);

  const mappedAbilities: EnemyAbility[] = template.abilityTemplates.map(a => ({
    id: a.id,
    name: a.nombre,
    baseDamage: a.baseDamage,
    scalingStat: a.scalingStat ?? 'fuerza',
    scalingFactor: a.scalingFactor,
    cooldown: a.cooldown,
    currentCooldown: 0,
    statusChance: a.statusChance,
    statusType: a.statusType as EnemyAbility['statusType'],
    statusDuration: a.statusDuration
  }));

  return {
    name: template.name,
    className: template.className,
    level: Math.max(1, playerLevel + roll(3) - 1),
    currentHp: calculatedMaxHp,
    maxHp: calculatedMaxHp,
    sprite: template.sprites.front,
    abilities: mappedAbilities,
    isBoss: true,
    stats: {
      fuerza: 15 + playerLevel * 2,
      agilidad: 10 + playerLevel,
      inteligencia: 12 + playerLevel,
      vitalidad: 18 + playerLevel * 2,
      armadura: 10 + Math.floor(playerLevel / 2),
      resistenciaMagica: 8 + Math.floor(playerLevel / 3)
    }
  };
};
