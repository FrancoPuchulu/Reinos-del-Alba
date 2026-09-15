import type { ItemDefinition } from '../../types/items'

export const GuerreroItems: ItemDefinition[] = [
  {
    id: 'guerrero-espada-mandoble',
    name: 'Espada Mandoble',
    slot: 'armaPrincipal',
    rarity: 'normal',
    stats: { fuerza: 3, armadura: 1 },
    damage: { min: 8, max: 14 },
    price: 8,
    description: 'Espada de acero pesada con filo reforzado.'
  },
  {
    id: 'guerrero-hacha-guerra',
    name: 'Hacha de Guerra',
    slot: 'armaPrincipal',
    rarity: 'magico',
    stats: { fuerza: 6, vitalidad: 2, armadura: 2 },
    damage: { min: 12, max: 20 },
    effects: [{ type: 'lifeSteal', value: 3 }],
    price: 30,
    description: 'Hacha brutal que devuelve parte del daño como vida.'
  },
  {
    id: 'guerrero-coraza-acero',
    name: 'Coraza de Acero',
    slot: 'armadura',
    rarity: 'normal',
    stats: { armadura: 8, vitalidad: 3 },
    price: 10,
    description: 'Peto de acero templado que cubre el torso.'
  },
  {
    id: 'guerrero-coraza-titan',
    name: 'Coraza del Titán',
    slot: 'armadura',
    rarity: 'epico',
    stats: { armadura: 15, vitalidad: 6, fuerza: 4, resistenciaMagica: 5 },
    effects: [{ type: 'passiveAura', value: 1, duration: 1 }],
    price: 80,
    description: 'Coraza imbuida con la esencia de un titán caído.'
  },
  {
    id: 'guerrero-yelmo-hierro',
    name: 'Yelmo de Hierro',
    slot: 'casco',
    rarity: 'normal',
    stats: { armadura: 4, resistenciaMagica: 2 },
    price: 6,
    description: 'Casco de hierro forjado con visor ajustable.'
  },
  {
    id: 'guerrero-yelmo-comandante',
    name: 'Yelmo del Comandante',
    slot: 'casco',
    rarity: 'magico',
    stats: { armadura: 6, fuerza: 2, vitalidad: 2 },
    effects: [{ type: 'critBonus', value: 5 }],
    price: 25,
    description: 'Yelmo que inspira ferocidad en combate.'
  },
  {
    id: 'guerrero-guanteletes-malla',
    name: 'Guanteletes de Malla',
    slot: 'guantes',
    rarity: 'normal',
    stats: { armadura: 3, precision: 2 },
    price: 5,
    description: 'Guanteletes de malla que protegen manos y antebrazos.'
  },
  {
    id: 'guerrero-guanteletes-furia',
    name: 'Guanteletes de Furia',
    slot: 'guantes',
    rarity: 'unico',
    stats: { fuerza: 5, probCritico: 8, dañoCritico: 15, velocidad: 3 },
    effects: [
      { type: 'critBonus', value: 10 },
      { type: 'extraCharges', value: 1 }
    ],
    price: 180,
    description: 'Guanteletes legendarios que canalizan la furia del guerrero.'
  },
  {
    id: 'guerrero-botas-yunque',
    name: 'Botas del Yunque',
    slot: 'botas',
    rarity: 'normal',
    stats: { armadura: 3, velocidad: 1 },
    price: 5,
    description: 'Botas ferradas con suela de acero.'
  },
  {
    id: 'guerrero-botas-carrera',
    name: 'Botas de Carga',
    slot: 'botas',
    rarity: 'magico',
    stats: { fuerza: 2, velocidad: 5, armadura: 2 },
    price: 22,
    description: 'Botas ligeras que potencian la carga del guerrero.'
  },
  {
    id: 'guerrero-amuleto-sangre',
    name: 'Amuleto de Sangre',
    slot: 'amuleto',
    rarity: 'magico',
    stats: { roboVida: 5, fuerza: 2, vitalidad: 2 },
    price: 35,
    description: 'Amuleto oscuro que absorbe la esencia de los caídos.'
  },
  {
    id: 'guerrero-anillo-escudo',
    name: 'Anillo Escudo',
    slot: 'anillo',
    rarity: 'normal',
    stats: { armadura: 3, resistenciaMagica: 2 },
    price: 7,
    description: 'Anillo de defensa básico para combatientes.'
  },
  {
    id: 'guerrero-escudo-muro',
    name: 'Escudo de Muro',
    slot: 'armaSecundaria',
    rarity: 'normal',
    stats: { armadura: 6, vitalidad: 3, resistenciaMagica: 2 },
    price: 12,
    description: 'Escudo de acero macizo que cubre todo el torso.'
  },
  {
    id: 'guerrero-escudo-titan',
    name: 'Escudo del Titán',
    slot: 'armaSecundaria',
    rarity: 'magico',
    stats: { armadura: 10, vitalidad: 5, resistenciaMagica: 4, fuerza: 2 },
    damage: { min: 3, max: 6 },
    effects: [{ type: 'critBonus', value: 5 }],
    price: 40,
    description: 'Escudo imbuido con la fuerza de un titán.'
  },
  {
    id: 'guerrero-hacha-arrojadiza',
    name: 'Hacha Arrojadiza',
    slot: 'armaDistancia',
    rarity: 'normal',
    stats: { agilidad: 2, precision: 4 },
    damage: { min: 5, max: 9 },
    price: 7,
    description: 'Hacha ligera equilibrada para lanzamiento.'
  },
  {
    id: 'guerrero-hacha-eco',
    name: 'Hacha del Eco',
    slot: 'armaDistancia',
    rarity: 'magico',
    stats: { agilidad: 3, precision: 6, velocidad: 3 },
    damage: { min: 8, max: 13 },
    price: 28,
    description: 'Hacha que regresa a la mano tras el lanzamiento.'
  }
]
