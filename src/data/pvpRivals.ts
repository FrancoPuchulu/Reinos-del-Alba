import type { CharacterSpriteKey } from './sprites';

export interface PvPRival {
  id: string;
  name: string;
  title: string;
  quote: string;
  level: number;
  spriteKey: CharacterSpriteKey;
  stats: {
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    speed: number;
  };
  rewards: {
    gold: number;
    experience: number;
    itemId?: string;
    itemLootName?: string;
    itemRarity?: 'common' | 'uncommon' | 'rare' | 'epic';
  };
  rankTier: number;
}

export const PVP_RIVALS: PvPRival[] = [
  {
    id: 'rival-1',
    name: 'Grimm el Desterrado',
    title: 'Gladiador de Sangre Baja',
    quote: '"Tu carne alimentará a los cuervos de la fosa."',
    level: 1,
    spriteKey: 'goblin-brujo',
    stats: { health: 80, maxHealth: 80, attack: 12, defense: 4, speed: 10 },
    rewards: {
      gold: 25,
      experience: 50,
      itemId: 'guerrero-espada-mandoble',
      itemLootName: 'Mandoble Oxidada',
      itemRarity: 'common',
    },
    rankTier: 1,
  },
  {
    id: 'rival-2',
    name: 'Borgath Martillodemonio',
    title: 'Rompefilos de la Fosa',
    quote: '"No hay escudo que soporte el peso de mi rencor."',
    level: 2,
    spriteKey: 'orco-guerrero',
    stats: { health: 130, maxHealth: 130, attack: 18, defense: 8, speed: 7 },
    rewards: {
      gold: 50,
      experience: 100,
      itemId: 'guerrero-guanteletes-malla',
      itemLootName: 'Guanteletes de Malla del Rompefilos',
      itemRarity: 'uncommon',
    },
    rankTier: 1,
  },
  {
    id: 'rival-3',
    name: 'Malakor el Marchito',
    title: 'Erudito de la Putrefacción',
    quote: '"La muerte no es el final, es solo tu nueva condición."',
    level: 3,
    spriteKey: 'no-muerto-mago',
    stats: { health: 100, maxHealth: 100, attack: 24, defense: 5, speed: 12 },
    rewards: {
      gold: 80,
      experience: 160,
      itemId: 'mago-diadema-sabio',
      itemLootName: 'Diadema del Sabio Marchito',
      itemRarity: 'rare',
    },
    rankTier: 2,
  },
  {
    id: 'rival-4',
    name: 'Tharon Pechoacero',
    title: 'Guardián del Alba Oscura',
    quote: '"Siente la furia de los antiguos bosques rodar sobre ti."',
    level: 4,
    spriteKey: 'minotauro-druida',
    stats: { health: 180, maxHealth: 180, attack: 22, defense: 12, speed: 9 },
    rewards: {
      gold: 120,
      experience: 240,
      itemId: 'guerrero-coraza-titan',
      itemLootName: 'Coraza del Titán Ancestral',
      itemRarity: 'rare',
    },
    rankTier: 2,
  },
  {
    id: 'rival-5',
    name: 'Vespera la Inmortal',
    title: 'Campeona Suprema de la Arena',
    quote: '"Muchos han pisado esta arena. Ninguno ha salido caminando."',
    level: 5,
    spriteKey: 'no-muerto-mago',
    stats: { health: 250, maxHealth: 250, attack: 32, defense: 15, speed: 14 },
    rewards: {
      gold: 250,
      experience: 500,
      itemId: 'brujo-reliquia-abisal',
      itemLootName: 'Reliquia Abisal de la Inmortal',
      itemRarity: 'epic',
    },
    rankTier: 3,
  },
];
