import type { ItemDefinition } from '../../types/items'

export const DruidaItems: ItemDefinition[] = [
  {
    id: 'druida-baston-silvestre',
    name: 'Bastón Silvestre',
    slot: 'armaPrincipal',
    rarity: 'normal',
    stats: { inteligencia: 3, vitalidad: 2, regenMana: 1 },
    damage: { min: 6, max: 11 },
    price: 7,
    description: 'Bastón de madera viva que aún conserva savia.'
  },
  {
    id: 'druida-baston-lunar',
    name: 'Bastón Lunar',
    slot: 'armaPrincipal',
    rarity: 'magico',
    stats: { inteligencia: 5, vitalidad: 3, regenMana: 3, agilidad: 2 },
    damage: { min: 9, max: 15 },
    effects: [{ type: 'resourceGen', value: 3 }],
    price: 33,
    description: 'Bastón que brilla bajo la luz de la luna llena.'
  },
  {
    id: 'druida-armadura-corteza',
    name: 'Armadura de Corteza',
    slot: 'armadura',
    rarity: 'normal',
    stats: { armadura: 6, vitalidad: 3, resistenciaMagica: 2 },
    price: 9,
    description: 'Armadura hecha de corteza de árbol milenario.'
  },
  {
    id: 'druida-armadura-espinas',
    name: 'Armadura de Espinas',
    slot: 'armadura',
    rarity: 'epico',
    stats: { armadura: 10, vitalidad: 6, resistenciaMagica: 4, fuerza: 3 },
    effects: [
      { type: 'statusOnHit', statusType: 'sangrado', chance: 15, duration: 3 },
      { type: 'passiveAura', value: 2 }
    ],
    price: 85,
    description: 'Armadura viva que hiere a quienes la atacan.'
  },
  {
    id: 'druida-corona-ramas',
    name: 'Corona de Ramas',
    slot: 'casco',
    rarity: 'normal',
    stats: { inteligencia: 2, vitalidad: 2, resistenciaMagica: 1 },
    price: 5,
    description: 'Corona tejida con ramas de roble sagrado.'
  },
  {
    id: 'druida-corona-floreciente',
    name: 'Corona Floreciente',
    slot: 'casco',
    rarity: 'magico',
    stats: { inteligencia: 4, vitalidad: 3, regenMana: 3 },
    effects: [{ type: 'buffDuration', value: 1 }],
    price: 29,
    description: 'Corona que siempre está en floración primaveral.'
  },
  {
    id: 'druida-guantes-hojas',
    name: 'Guantes de Hojas',
    slot: 'guantes',
    rarity: 'normal',
    stats: { precision: 3, agilidad: 2 },
    price: 5,
    description: 'Guantes de hojas secas encantadas que no se deshacen.'
  },
  {
    id: 'druida-guantes-enredadera',
    name: 'Guantes de Enredadera',
    slot: 'guantes',
    rarity: 'unico',
    stats: { inteligencia: 5, vitalidad: 4, agilidad: 3, regenMana: 4 },
    effects: [
      { type: 'statusOnHit', statusType: 'veneno', chance: 20, duration: 3 },
      { type: 'extraCharges', value: 1 }
    ],
    price: 170,
    description: 'Guantes de enredadera viva que inyectan veneno natural.'
  },
  {
    id: 'druida-botas-raices',
    name: 'Botas de Raíces',
    slot: 'botas',
    rarity: 'normal',
    stats: { velocidad: 2, esquiva: 3, armadura: 1 },
    price: 5,
    description: 'Botas de raíces entrelazadas que se adaptan al terreno.'
  },
  {
    id: 'druida-botas-sotobosque',
    name: 'Botas del Sotobosque',
    slot: 'botas',
    rarity: 'magico',
    stats: { velocidad: 3, esquiva: 5, agilidad: 2 },
    price: 23,
    description: 'Botas que se mueven en silencio entre la maleza.'
  },
  {
    id: 'druida-amuleto-hoja',
    name: 'Amuleto de Hoja Perenne',
    slot: 'amuleto',
    rarity: 'magico',
    stats: { roboVida: 3, vitalidad: 3, resistenciaMagica: 3 },
    price: 31,
    description: 'Amuleto que contiene una hoja que nunca muere.'
  },
  {
    id: 'druida-anillo-ciclo',
    name: 'Anillo del Ciclo',
    slot: 'anillo',
    rarity: 'normal',
    stats: { regenMana: 3, vitalidad: 2 },
    price: 6,
    description: 'Anillo que simboliza el ciclo eterno de la naturaleza.'
  },
  {
    id: 'druida-totem-espiritu',
    name: 'Tótem del Espíritu',
    slot: 'armaSecundaria',
    rarity: 'normal',
    stats: { inteligencia: 2, vitalidad: 3, regenMana: 2 },
    price: 8,
    description: 'Tótem que canaliza la energía de los espíritus.'
  },
  {
    id: 'druida-totem-lunar',
    name: 'Tótem Lunar',
    slot: 'armaSecundaria',
    rarity: 'magico',
    stats: { inteligencia: 4, vitalidad: 4, regenMana: 4, resistenciaMagica: 2 },
    effects: [{ type: 'resourceGen', value: 3 }],
    price: 36,
    description: 'Tótem que brilla con la luz de la luna.'
  },
  {
    id: 'druida-arco-corto',
    name: 'Arco Corto',
    slot: 'armaDistancia',
    rarity: 'normal',
    stats: { agilidad: 3, precision: 4, velocidad: 2 },
    damage: { min: 5, max: 10 },
    price: 6,
    description: 'Arco de madera flexible para cacería.'
  },
  {
    id: 'druida-arco-selva',
    name: 'Arco de la Selva',
    slot: 'armaDistancia',
    rarity: 'magico',
    stats: { agilidad: 4, precision: 6, velocidad: 3, probCritico: 3 },
    damage: { min: 8, max: 14 },
    effects: [{ type: 'statusOnHit', statusType: 'veneno', chance: 10, duration: 2 }],
    price: 27,
    description: 'Arco envuelto en enredaderas venenosas.'
  }
]
