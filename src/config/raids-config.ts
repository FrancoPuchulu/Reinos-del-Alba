import type { RaidBossConfig, RaidMember, RaidRole } from '../types/game.types'

export const RAID_COMPOSITION = { tanks: 2, healers: 5, dps: 18 } as const
export const RAID_SIZE = RAID_COMPOSITION.tanks + RAID_COMPOSITION.healers + RAID_COMPOSITION.dps

export const RAID_BOSSES: RaidBossConfig[] = [
  {
    id: 'lord-brasas',
    name: 'El Senor de las Brasas',
    level: 60,
    maxHp: 500000,
    damage: { min: 800, max: 1400 },
    armor: 200,
    magicResist: 150,
    description: 'Un dragon ancestral que habita en el corazon de un volcan activo. Su aliento de fuego liquido puede derretir armaduras, y su rugido hace temblar la tierra. Se necesitan 25 guerreros de elite para enfrentarlo.',
    rewardPreview: {
      gold: { min: 15000, max: 30000 },
      xp: { min: 20000, max: 40000 },
      possibleLoot: [
        { name: "Colmillo del Dragon", rarity: "unico" },
        { name: "Escamas de Brasas", rarity: "epico" },
        { name: "Amuleto del Fuego", rarity: "unico" },
      ],
    },
    phases: [
      {
        name: 'Fase 1 - Llamas',
        hpThreshold: 0.7,
        bossAbility: 'Aliento de Dragon',
        bossDamage: 1200,
        bossDamageType: 'physical',
        description: 'El jefe escupe fuego en un cono, danando a todos los miembros.',
      },
      {
        name: 'Fase 2 - Oscuridad',
        hpThreshold: 0.3,
        bossAbility: 'Rugido de la Oscuridad',
        bossDamage: 1800,
        bossDamageType: 'magical',
        description: 'El jefe libera energia oscura que drena la vida de toda la banda.',
      },
      {
        name: 'Fase 3 - Furia Final',
        hpThreshold: 0,
        bossAbility: 'Aniquilacion',
        bossDamage: 2500,
        bossDamageType: 'aoe',
        description: 'El jefe entra en frenesi, atacando con furia desatada.',
      },
    ],
  },
  {
    id: 'inquisidor',
    name: 'El Inquisidor Caydo',
    level: 65,
    maxHp: 750000,
    damage: { min: 1000, max: 1800 },
    armor: 250,
    magicResist: 200,
    description: 'Un inquisidor que fue corrompido por el poder prohibido que juzgaba. Ahora usa la magia divina para castigar a los inocentes. Su furia purificadora no distingue entre aliados y enemigos.',
    rewardPreview: {
      gold: { min: 25000, max: 50000 },
      xp: { min: 35000, max: 70000 },
      possibleLoot: [
        { name: "Martillo del Inquisidor", rarity: "unico" },
        { name: "Tunica Sagrada", rarity: "unico" },
        { name: "Anillo de Condena", rarity: "epico" },
      ],
    },
    phases: [
      {
        name: 'Fase 1 - Juicio',
        hpThreshold: 0.7,
        bossAbility: 'Juicio Divino',
        bossDamage: 1500,
        bossDamageType: 'magical',
        description: 'El inquisidor canaliza energia divina contra los tanques.',
      },
      {
        name: 'Fase 2 - Castigo',
        hpThreshold: 0.3,
        bossAbility: 'Castigo Purificador',
        bossDamage: 2200,
        bossDamageType: 'aoe',
        description: 'Una oleada de fuego sagrado arde en toda la banda.',
      },
      {
        name: 'Fase 3 - Condena',
        hpThreshold: 0,
        bossAbility: 'Condena Eterna',
        bossDamage: 3000,
        bossDamageType: 'aoe',
        description: 'El inquisidor invoca una tormenta de condenacion absoluta.',
      },
    ],
  },
]

export const RAID_NAMES: Record<RaidRole, string[]> = {
  tank: [
    'Tormenta de Acero', 'Muro de Huesos', 'Baluarte Negro', 'Roca Inquebrantable',
    'Guardia Imperial', 'Escudo Viviente', 'Centinela de Fuego', 'Pilar de Guerra',
    'Barrera Eterna', 'Defensor Supremo', 'Fortaleza Andante', 'Titán de Hierro',
    'Guardian del Muro', 'Bastion Oscuro', 'Sentinela de Hierro', 'Protector Mayor',
    'Muralla de Hueso', 'Coloso de Acero', 'Amo del Frente', 'Baluarte Sagrado',
    'Roca Eterna', 'Muro Infernal', 'Centinela Supremo', 'Defensor de Sangre',
  ],
  healer: [
    'Luz Divina', 'Mano del Cielo', 'Sacerdotisa Mayor', 'Sanadora de Almas',
    'Voz de la Luz', 'Curandera Sagrada', 'Mistico de la Vida', 'Canal de Curacion',
    'Oracion Eterna', 'Don de los Dioses', 'Sanacion Divina', 'Alma Brillante',
    'Luz de la Aurora', 'Poder Sanador', 'Benefactora Celeste', 'Manos de Oro',
    'Vida Renacida', 'Don de Salud', 'Purificadora', 'Sabia del Rio',
    'Curadora Mayor', 'Luz Eterna', 'Sacerdotisa de la Vida', 'Sanadora Suprema',
  ],
  dps: [
    'Hoja Siniestra', 'Flecha Mortal', 'Filo Sombrío', 'Destruccion Pura',
    'Ojo del Halcon', 'Garra de Hierro', 'Llama Negra', 'Cuchilla Veloz',
    'Sombra Asesina', 'Trueno de Guerra', 'Colmillo de Acero', 'Furia Roja',
    'Martillo de Guerra', 'Espada del Alba', 'Daga Venenosa', 'Arco de Plata',
    'Hacha Doble', 'Lanza Mortal', 'Filo Dorado', 'Tormenta de Acero',
    'Golpe Certero', 'Punzo del Demonio', 'Corte Profundo', 'Tajo Final',
    'Ballesta Pesada', 'Daga Rápida', 'Espada Larga', 'Maza de Guerra',
    'Lanza Ardiente', 'Arco Largo', 'Hacha de Batalla', 'Machete Oscuro',
  ],
}

export function generateRaidMembers(): RaidMember[] {
  const members: RaidMember[] = []
  let nameIdx = 0

  for (let i = 0; i < RAID_COMPOSITION.tanks; i++) {
    members.push({
      id: `tank-${i}`,
      name: RAID_NAMES.tank[nameIdx % RAID_NAMES.tank.length],
      role: 'tank',
      maxHp: 8000,
      currentHp: 8000,
      attackPower: 200,
      healPower: 0,
      armor: 300,
      magicResist: 150,
    })
    nameIdx++
  }

  for (let i = 0; i < RAID_COMPOSITION.healers; i++) {
    members.push({
      id: `healer-${i}`,
      name: RAID_NAMES.healer[nameIdx % RAID_NAMES.healer.length],
      role: 'healer',
      maxHp: 5000,
      currentHp: 5000,
      attackPower: 80,
      healPower: 400,
      armor: 100,
      magicResist: 200,
    })
    nameIdx++
  }

  for (let i = 0; i < RAID_COMPOSITION.dps; i++) {
    members.push({
      id: `dps-${i}`,
      name: RAID_NAMES.dps[nameIdx % RAID_NAMES.dps.length],
      role: 'dps',
      maxHp: 4000,
      currentHp: 4000,
      attackPower: 500,
      healPower: 0,
      armor: 80,
      magicResist: 50,
    })
    nameIdx++
  }

  return members
}

export function validateComposition(members: RaidMember[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const tanks = members.filter(m => m.role === 'tank').length
  const healers = members.filter(m => m.role === 'healer').length
  const dps = members.filter(m => m.role === 'dps').length

  if (tanks !== RAID_COMPOSITION.tanks) errors.push(`Se requieren exactamente ${RAID_COMPOSITION.tanks} tanques (hay ${tanks})`)
  if (healers !== RAID_COMPOSITION.healers) errors.push(`Se requieren exactamente ${RAID_COMPOSITION.healers} healers (hay ${healers})`)
  if (dps !== RAID_COMPOSITION.dps) errors.push(`Se requieren ${RAID_COMPOSITION.dps} DPS (hay ${dps})`)
  if (members.length !== RAID_SIZE) errors.push(`Se requieren ${RAID_SIZE} miembros (hay ${members.length})`)

  return { valid: errors.length === 0, errors }
}
