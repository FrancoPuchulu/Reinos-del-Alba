import type { ItemDefinition } from '../../types/items'

export const MagoItems: ItemDefinition[] = [
  {
    id: 'mago-baston-arcano',
    name: 'Bastón Arcano',
    slot: 'armaPrincipal',
    rarity: 'normal',
    stats: { inteligencia: 4, regenMana: 2 },
    damage: { min: 5, max: 10 },
    price: 9,
    description: 'Bastón de madera encantada con filamentos de maná.'
  },
  {
    id: 'mago-baston-portal',
    name: 'Bastón del Portal',
    slot: 'armaPrincipal',
    rarity: 'magico',
    stats: { inteligencia: 7, regenMana: 4, resistenciaMagica: 3 },
    damage: { min: 8, max: 14 },
    effects: [{ type: 'reduceCooldown', value: 1 }],
    price: 32,
    description: 'Bastón que distorsiona el tiempo y acelera los hechizos.'
  },
  {
    id: 'mago-tunica-seda',
    name: 'Túnica de Seda Arcana',
    slot: 'armadura',
    rarity: 'normal',
    stats: { resistenciaMagica: 6, inteligencia: 2 },
    price: 8,
    description: 'Túnica tejida con hilos impregnados de maná.'
  },
  {
    id: 'mago-tunica-estrellas',
    name: 'Túnica de las Estrellas',
    slot: 'armadura',
    rarity: 'epico',
    stats: { inteligencia: 8, resistenciaMagica: 10, regenMana: 6, vitalidad: 3 },
    effects: [
      { type: 'buffDuration', value: 2 },
      { type: 'resourceGen', value: 5 }
    ],
    price: 90,
    description: 'Túnica celestial que canaliza el poder de las constelaciones.'
  },
  {
    id: 'mago-gorra-iniciado',
    name: 'Gorra de Iniciado',
    slot: 'casco',
    rarity: 'normal',
    stats: { inteligencia: 2, regenMana: 1 },
    price: 5,
    description: 'Gorra puntiaguda de aprendiz de mago.'
  },
  {
    id: 'mago-diadema-sabio',
    name: 'Diadema del Sabio',
    slot: 'casco',
    rarity: 'magico',
    stats: { inteligencia: 4, regenMana: 3, resistenciaMagica: 2 },
    effects: [{ type: 'reduceCooldown', value: 1 }],
    price: 27,
    description: 'Diadema que expande la mente y acelera el pensamiento.'
  },
  {
    id: 'mago-guantes-seda',
    name: 'Guantes de Seda',
    slot: 'guantes',
    rarity: 'normal',
    stats: { precision: 3, regenMana: 1 },
    price: 5,
    description: 'Guantes finos de seda con runas protectoras.'
  },
  {
    id: 'mago-guantes-eter',
    name: 'Guantes de Éter',
    slot: 'guantes',
    rarity: 'unico',
    stats: { inteligencia: 6, regenMana: 5, probCritico: 10, dañoCritico: 12 },
    effects: [
      { type: 'reduceCooldown', value: 2 },
      { type: 'extraCharges', value: 1 }
    ],
    price: 190,
    description: 'Guantes legendarios que manipulan el éter mágico.'
  },
  {
    id: 'mago-botas-fantasma',
    name: 'Botas Fantasma',
    slot: 'botas',
    rarity: 'normal',
    stats: { velocidad: 3, esquiva: 2 },
    price: 6,
    description: 'Botas ligeras que amortiguan los pasos.'
  },
  {
    id: 'mago-botas-etereas',
    name: 'Botas Etéreas',
    slot: 'botas',
    rarity: 'magico',
    stats: { velocidad: 4, esquiva: 4, inteligencia: 2 },
    price: 24,
    description: 'Botas que se desvanecen entre planos al moverse.'
  },
  {
    id: 'mago-amuleto-mana',
    name: 'Amuleto de Maná',
    slot: 'amuleto',
    rarity: 'normal',
    stats: { regenMana: 5, inteligencia: 2 },
    price: 7,
    description: 'Amuleto que vibra con energía arcana.'
  },
  {
    id: 'mago-anillo-concentracion',
    name: 'Anillo de Concentración',
    slot: 'anillo',
    rarity: 'magico',
    stats: { inteligencia: 3, probCritico: 4, dañoCritico: 8 },
    price: 30,
    description: 'Anillo que enfoca el poder mágico en un punto crítico.'
  },
  {
    id: 'mago-grimorio-runas',
    name: 'Grimorio de Runas',
    slot: 'armaSecundaria',
    rarity: 'normal',
    stats: { inteligencia: 3, regenMana: 3, resistenciaMagica: 2 },
    price: 10,
    description: 'Libro de runas que contiene secretos arcanos.'
  },
  {
    id: 'mago-grimorio-portal',
    name: 'Grimorio del Portal',
    slot: 'armaSecundaria',
    rarity: 'magico',
    stats: { inteligencia: 5, regenMana: 5, resistenciaMagica: 3, probCritico: 3 },
    effects: [{ type: 'reduceCooldown', value: 1 }],
    price: 38,
    description: 'Grimorio que contiene hechizos de distorsión temporal.'
  },
  {
    id: 'mago-varita-proyectil',
    name: 'Varita de Proyectiles',
    slot: 'armaDistancia',
    rarity: 'normal',
    stats: { inteligencia: 2, precision: 5, velocidad: 2 },
    damage: { min: 4, max: 8 },
    price: 6,
    description: 'Varita que lanza proyectiles de energía arcana.'
  },
  {
    id: 'mago-varita-rayo',
    name: 'Varita del Rayo',
    slot: 'armaDistancia',
    rarity: 'magico',
    stats: { inteligencia: 3, precision: 7, velocidad: 4, probCritico: 4 },
    damage: { min: 7, max: 12 },
    price: 26,
    description: 'Varita que canaliza rayos de poder concentrado.'
  }
]
