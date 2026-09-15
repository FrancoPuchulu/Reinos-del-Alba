import type { ItemDefinition } from '../../types/items'

export const BrujoItems: ItemDefinition[] = [
  {
    id: 'brujo-vara-sombra',
    name: 'Vara de Sombra',
    slot: 'armaPrincipal',
    rarity: 'normal',
    stats: { inteligencia: 3, roboVida: 2 },
    damage: { min: 6, max: 12 },
    price: 8,
    description: 'Vara tallada de un árbol que creció en la oscuridad.'
  },
  {
    id: 'brujo-vara-alma',
    name: 'Vara de Almas',
    slot: 'armaPrincipal',
    rarity: 'magico',
    stats: { inteligencia: 6, roboVida: 4, regenMana: 3 },
    damage: { min: 10, max: 17 },
    effects: [{ type: 'lifeSteal', value: 5 }],
    price: 34,
    description: 'Vara que susurra con las almas atrapadas en su interior.'
  },
  {
    id: 'brujo-tunica-sombras',
    name: 'Túnica de Sombras',
    slot: 'armadura',
    rarity: 'normal',
    stats: { resistenciaMagica: 5, inteligencia: 2, roboVida: 1 },
    price: 7,
    description: 'Túnica tejida con hilos de sombra sólida.'
  },
  {
    id: 'brujo-tunica-abisal',
    name: 'Túnica Abisal',
    slot: 'armadura',
    rarity: 'epico',
    stats: { inteligencia: 7, resistenciaMagica: 8, roboVida: 5, vitalidad: 4 },
    effects: [
      { type: 'statusOnHit', statusType: 'quemadura', chance: 10, duration: 3 },
      { type: 'lifeSteal', value: 8 }
    ],
    price: 95,
    description: 'Túnica forjada en las profundidades del abismo.'
  },
  {
    id: 'brujo-corona-tinieblas',
    name: 'Corona de Tinieblas',
    slot: 'casco',
    rarity: 'normal',
    stats: { inteligencia: 2, resistenciaMagica: 2, regenMana: 1 },
    price: 5,
    description: 'Corona que proyecta una sombra perpetua sobre el rostro.'
  },
  {
    id: 'brujo-corona-dolor',
    name: 'Corona de Dolor',
    slot: 'casco',
    rarity: 'magico',
    stats: { inteligencia: 4, roboVida: 3, probCritico: 3 },
    effects: [{ type: 'critBonus', value: 5 }],
    price: 28,
    description: 'Corona que causa dolor a su portador pero potencia su poder.'
  },
  {
    id: 'brujo-guantes-hueso',
    name: 'Guantes de Hueso',
    slot: 'guantes',
    rarity: 'normal',
    stats: { precision: 2, roboVida: 2, armadura: 1 },
    price: 5,
    description: 'Guantes hechos de huesos de criaturas infernales.'
  },
  {
    id: 'brujo-guantes-alma-condenada',
    name: 'Guantes de Alma Condenada',
    slot: 'guantes',
    rarity: 'unico',
    stats: { inteligencia: 5, roboVida: 6, probCritico: 7, dañoCritico: 10 },
    effects: [
      { type: 'statusOnHit', statusType: 'sangrado', chance: 15, duration: 4 },
      { type: 'lifeSteal', value: 10 },
      { type: 'extraCharges', value: 1 }
    ],
    price: 175,
    description: 'Guantes imbuidos con almas condenadas que drenan vida.'
  },
  {
    id: 'brujo-botas-ceniza',
    name: 'Botas de Ceniza',
    slot: 'botas',
    rarity: 'normal',
    stats: { velocidad: 2, esquiva: 2, armadura: 1 },
    price: 5,
    description: 'Botas que dejan un rastro de ceniza al caminar.'
  },
  {
    id: 'brujo-botas-infernales',
    name: 'Botas Infernales',
    slot: 'botas',
    rarity: 'magico',
    stats: { velocidad: 3, esquiva: 4, inteligencia: 2 },
    price: 25,
    description: 'Botas que arden con llama negra sin consumirse.'
  },
  {
    id: 'brujo-amuleto-calavera',
    name: 'Amuleto de Calavera',
    slot: 'amuleto',
    rarity: 'magico',
    stats: { inteligencia: 3, roboVida: 4, probCritico: 3 },
    effects: [{ type: 'lifeSteal', value: 5 }],
    price: 33,
    description: 'Amuleto con la calavera de un brujo caído.'
  },
  {
    id: 'brujo-anillo-sombrio',
    name: 'Anillo Sombrío',
    slot: 'anillo',
    rarity: 'normal',
    stats: { resistenciaMagica: 3, roboVida: 2 },
    price: 6,
    description: 'Anillo que absorbe la luz a su alrededor.'
  },
  {
    id: 'brujo-reliquia-sombra',
    name: 'Reliquia de Sombra',
    slot: 'armaSecundaria',
    rarity: 'normal',
    stats: { inteligencia: 2, roboVida: 3, resistenciaMagica: 2 },
    price: 8,
    description: 'Reliquia oscura que absorbe la energía vital.'
  },
  {
    id: 'brujo-reliquia-abisal',
    name: 'Reliquia Abisal',
    slot: 'armaSecundaria',
    rarity: 'magico',
    stats: { inteligencia: 4, roboVida: 5, resistenciaMagica: 3, probCritico: 2 },
    effects: [{ type: 'lifeSteal', value: 5 }],
    price: 37,
    description: 'Reliquia forjada en las profundidades del abismo.'
  },
  {
    id: 'brujo-hueso-maldito',
    name: 'Hueso Maldito',
    slot: 'armaDistancia',
    rarity: 'normal',
    stats: { inteligencia: 2, precision: 3, velocidad: 2 },
    damage: { min: 4, max: 9 },
    price: 6,
    description: 'Hueso imbuido con energía infernal para lanzar.'
  },
  {
    id: 'brujo-hueso-alma',
    name: 'Hueso de Alma',
    slot: 'armaDistancia',
    rarity: 'magico',
    stats: { inteligencia: 3, precision: 5, velocidad: 3, roboVida: 3 },
    damage: { min: 7, max: 12 },
    effects: [{ type: 'lifeSteal', value: 8 }],
    price: 29,
    description: 'Hueso que contiene el alma de un brujo caído.'
  }
]
