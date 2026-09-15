import type { StatBlock } from '../types/items'
import type { RaceProfile, SkillStyle, Talent, Race, Class, Skill } from '../types/game';
import type { Difficulty, RewardPreview } from '../types/game.types'

export const ULTIMATE_SKILLS: Record<Class, Skill> = {
  Guerrero: {
    id: 'guerrero-ira-del-campeon',
    name: 'Ira del Campeón',
    effect: 'Desata un golpe brutal con la furia del guerrero. Inflije 180% del Ataque Físico + 250% de Fuerza como daño físico directo y aplica Sangrado (Rend), infligiendo daño periódico durante 3 turnos.',
    unlockLevel: 1,
    maxCharges: 1,
    baseDamage: 70,
    scalingStat: 'fuerza',
    scalingFactor: 2.5,
    weaponMultiplier: 1.5,
    statusChance: 100,
    statusType: 'sangrado',
    statusDuration: 3,
    isUltimate: true,
    ultimateResource: 'Ira',
  },
  Mago: {
    id: 'mago-aniquilacion-arcan',
    name: 'Aniquilación Arcana',
    effect: 'Canales todo el poder arcano en una explosión devastadora. Inflije 250% de Inteligencia como daño mágico y reduce la Resistencia Mágica del objetivo un 30% durante 3 turnos.',
    unlockLevel: 1,
    maxCharges: 1,
    baseDamage: 80,
    scalingStat: 'inteligencia',
    scalingFactor: 2.5,
    statusChance: 100,
    statusType: 'debuff_resistenciaMagica',
    statusDuration: 3,
    isUltimate: true,
    ultimateResource: 'Maná Ancestral',
  },
  Druida: {
    id: 'druida-tempestad-ancestral',
    name: 'Tempestad Ancestral',
    effect: 'Invoca la furia de la naturaleza. Inflije 200% de Inteligencia como daño mágico al enemigo y cura al druida por el 50% del daño infligido.',
    unlockLevel: 1,
    maxCharges: 1,
    baseDamage: 65,
    scalingStat: 'inteligencia',
    scalingFactor: 2.0,
    weaponMultiplier: 1.0,
    isUltimate: true,
    ultimateResource: 'Energía Vital',
  },
  Brujo: {
    id: 'brujo-colmillo-infernal',
    name: 'Colmillo Infernal',
    effect: 'Canaliza energía infernal a través de un colmillo etéreo. Inflije 180% de Inteligencia como daño mágico y drena 80% del daño infligido como vida. Aplica Sangrado durante 3 turnos.',
    unlockLevel: 1,
    maxCharges: 1,
    baseDamage: 55,
    scalingStat: 'inteligencia',
    scalingFactor: 1.8,
    statusChance: 80,
    statusType: 'sangrado',
    statusDuration: 3,
    isUltimate: true,
    ultimateResource: 'Infernalidad',
  },
};

export interface ExpeditionDef {
  name: string
  baseTime: number
  players: string
  solo: boolean
  item: string
  minLevel: number
  description: string
  rewardPreview: RewardPreview
  levels: Record<Difficulty, { time: number; label: string }>
}

export const raceProfiles: Record<Race, RaceProfile> = {
    Orco: { label: "OR", color: "#436f3b", description: "Guerrero brutal con gran fuerza fisica." },
    Minotauro: { label: "MI", color: "#7a4a2f", description: "Defensor pesado con presencia amenazante." },
    NoMuerto: { label: "NM", color: "#59616f", description: "Combatiente oscuro resistente al miedo." },
    Goblin: { label: "GO", color: "#628c2d", description: "Explorador agil con instinto para el oro." },
    Humano: { label: "HU", color: "#3b6ea8", description: "Aventurero equilibrado y adaptable." },
    Enano: { label: "EN", color: "#8a5a2b", description: "Luchador tenaz con gran armadura natural." },
    Gnomo: { label: "GN", color: "#7c5fb0", description: "Inventor astuto con talento arcano." },
    AltoElfo: { label: "AE", color: "#b08b35", description: "Noble hechicero de intelecto superior." }
};

export const expeditions: Record<string, ExpeditionDef[]> = {
  misiones: [
    {
      name: "Aguja Brisaveloz", baseTime: 10, players: "1", solo: true, item: "Daga Rompehechizos", minLevel: 1,
      description: "Una aguja de piedra negra que se alza en el desierto, custodiada por escorpiones gigantes y espíritus del viento. Dicen que en su cima reposa una daga que corta hechizos.",
      rewardPreview: { gold: { min: 120, max: 300 }, xp: { min: 150, max: 375 }, possibleLoot: [{ name: "Daga Rompehechizos", rarity: "normal" }, { name: "Capa del Viento", rarity: "magico" }] },
      levels: { normal: { time: 10, label: "Fácil" }, heroico: { time: 8, label: "Heroico" }, mitico: { time: 6, label: "Mítico" } }
    },
    {
      name: "Arena Rajavacío", baseTime: 15, players: "1", solo: true, item: "Capa de Sombras", minLevel: 3,
      description: "Una arena ancestral donde las sombras cobran vida al caer la noche. Los guerreros caídos aún deambulan, buscando venganza contra los vivos.",
      rewardPreview: { gold: { min: 180, max: 450 }, xp: { min: 225, max: 562 }, possibleLoot: [{ name: "Capa de Sombras", rarity: "magico" }, { name: "Amuleto del Crepúsculo", rarity: "epico" }] },
      levels: { normal: { time: 15, label: "Fácil" }, heroico: { time: 12, label: "Heroico" }, mitico: { time: 9, label: "Mítico" } }
    },
    {
      name: "Bancal del Magister", baseTime: 20, players: "1", solo: true, item: "Sortija de Poder", minLevel: 5,
      description: "La torre del Magister ha sido corrompida por magia prohibida. Arcanos desatados rugen en cada pasillo, y el propio Magister ha perdido la razón.",
      rewardPreview: { gold: { min: 240, max: 600 }, xp: { min: 300, max: 750 }, possibleLoot: [{ name: "Sortija de Poder", rarity: "magico" }, { name: "Tomo del Magister", rarity: "epico" }] },
      levels: { normal: { time: 20, label: "Fácil" }, heroico: { time: 16, label: "Heroico" }, mitico: { time: 12, label: "Mítico" } }
    }
  ],
  mazmorras: [
    {
      name: "Cavernas de Maisara", baseTime: 45, players: "5", solo: false, item: "Escudo de Maisara", minLevel: 10,
      description: "Cuevas profundas donde una bestia ancestral protege un tesoro olvidado. Los ecos de gritos de antiguos aventureros resuenan en cada túnel. Se requiere un grupo coordinado para sobrevivir.",
      rewardPreview: { gold: { min: 540, max: 2160 }, xp: { min: 675, max: 2700 }, possibleLoot: [{ name: "Escudo de Maisara", rarity: "epico" }, { name: "Amuleto de la Caverna", rarity: "magico" }, { name: "Filo Abisal", rarity: "unico" }] },
      levels: { normal: { time: 45, label: "Normal" }, heroico: { time: 35, label: "Heroico" }, mitico: { time: 25, label: "Mítico" } }
    },
    {
      name: "Frontal de la Muerte", baseTime: 60, players: "5", solo: false, item: "Hacha de Verdugo", minLevel: 15,
      description: "La fortaleza del verdugo ha caído en desgracia. No-muertos de élite custodian las puertas, y el verdugo mismo espera en el trono de huesos. Solo los más valientes osan entrar.",
      rewardPreview: { gold: { min: 720, max: 2880 }, xp: { min: 900, max: 3600 }, possibleLoot: [{ name: "Hacha de Verdugo", rarity: "epico" }, { name: "Coraza de Hueso", rarity: "magico" }, { name: "Anillo del Verdugo", rarity: "unico" }] },
      levels: { normal: { time: 60, label: "Normal" }, heroico: { time: 50, label: "Heroico" }, mitico: { time: 40, label: "Mítico" } }
    },
    {
      name: "El Valle Cegador", baseTime: 90, players: "5", solo: false, item: "Casco de Visión", minLevel: 20,
      description: "Un valle envuelto en una niebla blanca que ciega a los intrusos. Criaturas etéreas acechan entre las rocas, y el Casco de Visión es la única protección contra la locura del valle.",
      rewardPreview: { gold: { min: 1080, max: 4320 }, xp: { min: 1350, max: 5400 }, possibleLoot: [{ name: "Casco de Visión", rarity: "epico" }, { name: "Túnica del Valle", rarity: "magico" }, { name: "Cetro de la Niebla", rarity: "unico" }] },
      levels: { normal: { time: 90, label: "Normal" }, heroico: { time: 75, label: "Heroico" }, mitico: { time: 60, label: "Mítico" } }
    }
  ],
  bandas: [
    {
      name: "Guarida de Nalorakk", baseTime: 180, players: "10-25", solo: false, item: "Espada Dimensional", minLevel: 30,
      description: "La guarida de un dragão antiguo que manipula las dimensiones. Nalorakk abre portales que desorientan a sus enemigos, y su cola destruye murallas enteras. Se necesita una banda completa para derrotarlo.",
      rewardPreview: { gold: { min: 2160, max: 8640 }, xp: { min: 2700, max: 10800 }, possibleLoot: [{ name: "Espada Dimensional", rarity: "unico" }, { name: "Escamas de Nalorakk", rarity: "epico" }, { name: "Collar del Dragón", rarity: "unico" }] },
      levels: { normal: { time: 180, label: "Normal" }, heroico: { time: 150, label: "Heroico" }, mitico: { time: 120, label: "Mítico" } }
    },
    {
      name: "Punto del Nexo", baseTime: 300, players: "25", solo: false, item: "Armadura de Éter", minLevel: 40,
      description: "El punto de convergencia de todas las energías arcanas. El Nexo es un ser de pura energía que distorsiona la realidad. Solo una banda de 25 guerreros de élite puede enfrentar su poder.",
      rewardPreview: { gold: { min: 3600, max: 11250 }, xp: { min: 4500, max: 14062 }, possibleLoot: [{ name: "Armadura de Éter", rarity: "unico" }, { name: "Cetro del Nexo", rarity: "unico" }, { name: "Anillo de Convergencia", rarity: "epico" }] },
      levels: { normal: { time: 300, label: "Normal" }, heroico: { time: 240, label: "Heroico" }, mitico: { time: 180, label: "Mítico" } }
    },
    {
      name: "Trono del Alba", baseTime: 600, players: "25", solo: false, item: "Cetro Celestial", minLevel: 50,
      description: "El trono donde el Alba Eterna gobierna sobre todos los reinos. Un poder casi divino emana de su portador, y los cielos se oscurecen cuando se enfrenta a una amenaza. El enfrentamiento definitivo.",
      rewardPreview: { gold: { min: 7200, max: 18000 }, xp: { min: 9000, max: 22500 }, possibleLoot: [{ name: "Cetro Celestial", rarity: "unico" }, { name: "Corona del Alba", rarity: "unico" }, { name: "Manto Estelar", rarity: "unico" }] },
      levels: { normal: { time: 600, label: "Normal" }, heroico: { time: 480, label: "Heroico" }, mitico: { time: 360, label: "Mítico" } }
    }
  ]
};

export const classAbilities: Record<Class, Record<string, SkillStyle>> = {
    Guerrero: {
        berserker: {
            name: "Berserker",
            summary: "Daño explosivo y golpes que castigan al rival.",
            skills: [
                { id: "berserker-golpe-mortal", name: "Golpe Mortal", effect: "Ataque potente que escala con Fuerza.", unlockLevel: 1, maxCharges: 5, cost: 12, baseDamage: 25, scalingStat: "fuerza", scalingFactor: 1.2, weaponMultiplier: 1.0 },
                { id: "berserker-golpe-rabioso", name: "Golpe Rabioso", effect: "Ataque básico con arma que aumenta con la ira.", unlockLevel: 1, maxCharges: 6, cost: 6, baseDamage: 12, scalingStat: "fuerza", scalingFactor: 0.7, weaponMultiplier: 0.6 },
                { id: "berserker-sed-sangre", name: "Sed de Sangre", effect: "Daño físico y cura menor.", unlockLevel: 2, maxCharges: 4, cost: 10, baseDamage: 18, scalingStat: "fuerza", scalingFactor: 0.9, weaponMultiplier: 0.7, statusChance: 30, statusType: "sangrado", statusDuration: 2 },
                { id: "berserker-furia-roja", name: "Furia Roja", effect: "Aumenta daño progresivamente.", unlockLevel: 3, maxCharges: 3, cost: 10, baseDamage: 20, scalingStat: "fuerza", scalingFactor: 1.0, weaponMultiplier: 0.8 },
                { id: "berserker-ejecucion", name: "Ejecucion", effect: "Remate devastador.", unlockLevel: 5, maxCharges: 2, cost: 20, baseDamage: 40, scalingStat: "fuerza", scalingFactor: 1.5, weaponMultiplier: 1.2 }
            ]
        },
        proteccion: {
            name: "Proteccion",
            summary: "Defensa, control y aguante para combates largos.",
            skills: [
                { id: "proteccion-golpe-escudo", name: "Golpe de Escudo", effect: "Daño y bloqueo combinados.", unlockLevel: 1, maxCharges: 5, cost: 8, baseDamage: 15, scalingStat: "fuerza", scalingFactor: 0.8, weaponMultiplier: 0.6 },
                { id: "proteccion-muro-acero", name: "Muro de Acero", effect: "Postura defensiva que reduce daño.", unlockLevel: 2, maxCharges: 3, cost: 6, baseDamage: 5, scalingStat: "fuerza", scalingFactor: 0.3, weaponMultiplier: 0.2 },
                { id: "proteccion-provocar", name: "Provocar", effect: "Obliga al enemigo a atacarte.", unlockLevel: 3, maxCharges: 4, cost: 8, baseDamage: 10, scalingStat: "fuerza", scalingFactor: 0.5, weaponMultiplier: 0.3 },
                { id: "proteccion-ultimo-bastion", name: "Ultimo Bastion", effect: "Defensa crítica que salva del golpe final.", unlockLevel: 5, maxCharges: 2, cost: 15, baseDamage: 30, scalingStat: "fuerza", scalingFactor: 1.0, weaponMultiplier: 0.8 },
                { id: "proteccion-muro-de-espinas", name: "Muro de Espinas", effect: "Escudo de pinchos que hiere al atacante.", unlockLevel: 5, maxCharges: 6, cost: 10, baseDamage: 18, scalingStat: "fuerza", scalingFactor: 0.7, weaponMultiplier: 0.4, statusChance: 60, statusType: "sangrado", statusDuration: 2 }
            ]
        },
        armas: {
            name: "Armas",
            summary: "Tecnica marcial con sangrados y golpes precisos.",
            skills: [
                { id: "armas-tajo-profundo", name: "Tajo Profundo", effect: "Causa sangrado severo.", unlockLevel: 1, maxCharges: 5, cost: 10, baseDamage: 20, scalingStat: "fuerza", scalingFactor: 1.0, weaponMultiplier: 0.8, statusChance: 80, statusType: "sangrado", statusDuration: 3 },
                { id: "armas-corte-preciso", name: "Corte Preciso", effect: "Daño estable y certero.", unlockLevel: 2, maxCharges: 5, cost: 12, baseDamage: 22, scalingStat: "fuerza", scalingFactor: 1.1, weaponMultiplier: 0.9 },
                { id: "armas-rompeguardia", name: "Rompeguardia", effect: "Reduce la defensa del enemigo.", unlockLevel: 3, maxCharges: 3, cost: 8, baseDamage: 15, scalingStat: "fuerza", scalingFactor: 0.7, weaponMultiplier: 0.5 },
                { id: "armas-duelo-final", name: "Duelo Final", effect: "Daño doble si el enemigo esta herido.", unlockLevel: 5, maxCharges: 2, cost: 18, baseDamage: 35, scalingStat: "fuerza", scalingFactor: 1.3, weaponMultiplier: 1.0 }
            ]
        }
    },
    Mago: {
        fuego: {
            name: "Fuego",
            summary: "Daño directo y quemaduras que presionan cada turno.",
            skills: [
                { id: "fuego-bola-fuego", name: "Bola de Fuego", effect: "Explosión de fuego arcano.", unlockLevel: 1, maxCharges: 5, cost: 15, baseDamage: 30, scalingStat: "inteligencia", scalingFactor: 1.5 },
                { id: "fuego-ascuas", name: "Ascuas", effect: "Chispas rápidas de daño menor pero frecuente.", unlockLevel: 1, maxCharges: 6, cost: 6, baseDamage: 10, scalingStat: "inteligencia", scalingFactor: 0.5 },
                { id: "fuego-llamarada", name: "Llamarada", effect: "Ola de fuego que quema al enemigo.", unlockLevel: 2, maxCharges: 4, cost: 12, baseDamage: 20, scalingStat: "inteligencia", scalingFactor: 1.0, statusChance: 80, statusType: "quemadura", statusDuration: 3 },
                { id: "fuego-combustion", name: "Combustion", effect: "Potencia el daño de fuego.", unlockLevel: 3, maxCharges: 3, cost: 14, baseDamage: 25, scalingStat: "inteligencia", scalingFactor: 1.2 },
                { id: "fuego-piroexplosion", name: "Piroexplosion", effect: "Estallido masivo de llamas.", unlockLevel: 5, maxCharges: 2, cost: 25, baseDamage: 50, scalingStat: "inteligencia", scalingFactor: 2.0 },
                { id: "fuego-combustion-total", name: "Combustion Total", effect: "Detonación de fuego puro que calcina al enemigo.", unlockLevel: 5, maxCharges: 6, cost: 16, baseDamage: 28, scalingStat: "inteligencia", scalingFactor: 1.2, statusChance: 90, statusType: "quemadura", statusDuration: 3 }
            ]
        },
        hielo: {
            name: "Hielo",
            summary: "Control del rival con lentitud y congelacion.",
            skills: [
                { id: "hielo-lanza-hielo", name: "Lanza de Hielo", effect: "Proyectil de hielo veloz.", unlockLevel: 1, maxCharges: 5, cost: 12, baseDamage: 25, scalingStat: "inteligencia", scalingFactor: 1.2 },
                { id: "hielo-escarcha", name: "Descarga de Escarcha", effect: "Ralentiza al enemigo.", unlockLevel: 2, maxCharges: 4, cost: 10, baseDamage: 18, scalingStat: "inteligencia", scalingFactor: 0.9, statusChance: 60, statusType: "congelacion", statusDuration: 1 },
                { id: "hielo-barrera", name: "Barrera de Hielo", effect: "Escudo protector de escarcha.", unlockLevel: 3, maxCharges: 3, cost: 8, baseDamage: 5, scalingStat: "inteligencia", scalingFactor: 0.2 },
                { id: "hielo-congelacion", name: "Congelacion", effect: "Congela al enemigo y pierde su turno.", unlockLevel: 5, maxCharges: 2, cost: 18, baseDamage: 30, scalingStat: "inteligencia", scalingFactor: 1.4, statusChance: 90, statusType: "congelacion", statusDuration: 1 }
            ]
        },
        rayo: {
            name: "Rayo",
            summary: "Velocidad, interrupciones y golpes electricos.",
            skills: [
                { id: "rayo-chispa", name: "Chispa Arcana", effect: "Descarga rápida de baja intensidad.", unlockLevel: 1, maxCharges: 6, cost: 8, baseDamage: 15, scalingStat: "inteligencia", scalingFactor: 0.8 },
                { id: "rayo-cadena", name: "Cadena de Rayos", effect: "Electricidad que golpea múltiples veces.", unlockLevel: 2, maxCharges: 4, cost: 12, baseDamage: 22, scalingStat: "inteligencia", scalingFactor: 1.1 },
                { id: "rayo-sobrecarga", name: "Sobrecarga", effect: "Potencia el siguiente golpe eléctrico.", unlockLevel: 3, maxCharges: 3, cost: 16, baseDamage: 28, scalingStat: "inteligencia", scalingFactor: 1.3 },
                { id: "rayo-tormenta", name: "Tormenta Electrica", effect: "Tormenta de rayos devastadora.", unlockLevel: 5, maxCharges: 2, cost: 22, baseDamage: 45, scalingStat: "inteligencia", scalingFactor: 1.8 }
            ]
        }
    },
    Druida: {
        healer: {
            name: "Healer",
            summary: "Curacion, limpieza y supervivencia.",
            skills: [
                { id: "healer-rejuvenecer", name: "Rejuvenecer", effect: "Curación gradual por turno.", unlockLevel: 1, maxCharges: 5, cost: 10, baseDamage: 15, scalingStat: "inteligencia", scalingFactor: 0.8 },
                { id: "healer-savia-vital", name: "Savia Vital", effect: "Curación ligera instantánea.", unlockLevel: 1, maxCharges: 6, cost: 6, baseDamage: 10, scalingStat: "inteligencia", scalingFactor: 0.5 },
                { id: "healer-toque-sanador", name: "Toque Sanador", effect: "Curación alta inmediata.", unlockLevel: 2, maxCharges: 4, cost: 15, baseDamage: 30, scalingStat: "inteligencia", scalingFactor: 1.2 },
                { id: "healer-piel-corteza", name: "Piel de Corteza", effect: "Reduce el daño recibido.", unlockLevel: 3, maxCharges: 3, cost: 8, baseDamage: 5, scalingStat: "inteligencia", scalingFactor: 0.2 },
                { id: "healer-renacer", name: "Renacer", effect: "Recuperación crítica masiva.", unlockLevel: 5, maxCharges: 1, cost: 25, baseDamage: 50, scalingStat: "inteligencia", scalingFactor: 2.0 },
                { id: "healer-corteza-ancestral", name: "Corteza Ancestral", effect: "Escudo de corteza que cura y protege.", unlockLevel: 5, maxCharges: 6, cost: 12, baseDamage: 20, scalingStat: "inteligencia", scalingFactor: 0.8 }
            ]
        },
        feral: {
            name: "Feral",
            summary: "Sangrados, velocidad y presion cuerpo a cuerpo.",
            skills: [
                { id: "feral-zarpazo", name: "Zarpazo", effect: "Golpe rápido con garras.", unlockLevel: 1, maxCharges: 6, cost: 8, baseDamage: 18, scalingStat: "fuerza", scalingFactor: 0.9, weaponMultiplier: 0.8 },
                { id: "feral-destripar", name: "Destripar", effect: "Causa sangrado profundo.", unlockLevel: 2, maxCharges: 4, cost: 10, baseDamage: 22, scalingStat: "fuerza", scalingFactor: 1.0, weaponMultiplier: 0.7, statusChance: 80, statusType: "sangrado", statusDuration: 3 },
                { id: "feral-rugido", name: "Rugido Salvaje", effect: "Aumenta el daño cuerpo a cuerpo.", unlockLevel: 3, maxCharges: 3, cost: 8, baseDamage: 15, scalingStat: "fuerza", scalingFactor: 0.7, weaponMultiplier: 0.5 },
                { id: "feral-mordida", name: "Mordida Feroz", effect: "Remate letal con colmillos.", unlockLevel: 5, maxCharges: 2, cost: 18, baseDamage: 35, scalingStat: "fuerza", scalingFactor: 1.3, weaponMultiplier: 1.0 }
            ]
        },
        lunar: {
            name: "Lunar",
            summary: "Magia astral con golpes fuertes y control suave.",
            skills: [
                { id: "lunar-fuego-lunar", name: "Fuego Lunar", effect: "Llama astral que daña al enemigo.", unlockLevel: 1, maxCharges: 5, cost: 12, baseDamage: 25, scalingStat: "inteligencia", scalingFactor: 1.2 },
                { id: "lunar-colera", name: "Colera", effect: "Ira lunar de daño estable.", unlockLevel: 2, maxCharges: 5, cost: 10, baseDamage: 22, scalingStat: "inteligencia", scalingFactor: 1.1 },
                { id: "lunar-eclipse", name: "Eclipse", effect: "Potencia la magia astral.", unlockLevel: 3, maxCharges: 3, cost: 10, baseDamage: 20, scalingStat: "inteligencia", scalingFactor: 1.0 },
                { id: "lunar-lluvia-estelar", name: "Lluvia Estelar", effect: "Bombardeo de energía estelar.", unlockLevel: 5, maxCharges: 2, cost: 20, baseDamage: 40, scalingStat: "inteligencia", scalingFactor: 1.6 }
            ]
        }
    },
    Brujo: {
        maldicion: {
            name: "Maldicion",
            summary: "Debilita al enemigo con efectos persistentes.",
            skills: [
                { id: "maldicion-agota", name: "Agonia", effect: "Veneno que drena vida por turno.", unlockLevel: 1, maxCharges: 5, cost: 10, baseDamage: 15, scalingStat: "inteligencia", scalingFactor: 0.8, statusChance: 100, statusType: "veneno", statusDuration: 4 },
                { id: "maldicion-toque-necrotico", name: "Toque Necrotico", effect: "Energía oscura que drena vida del enemigo.", unlockLevel: 1, maxCharges: 6, cost: 8, baseDamage: 12, scalingStat: "inteligencia", scalingFactor: 0.6, statusChance: 40, statusType: "veneno", statusDuration: 2 },
                { id: "maldicion-lenguas", name: "Maldicion de Lenguas", effect: "Reduce la velocidad del enemigo.", unlockLevel: 2, maxCharges: 4, cost: 8, baseDamage: 10, scalingStat: "inteligencia", scalingFactor: 0.5 },
                { id: "maldicion-fragilidad", name: "Fragilidad", effect: "Baja las defensas del enemigo.", unlockLevel: 3, maxCharges: 3, cost: 8, baseDamage: 12, scalingStat: "inteligencia", scalingFactor: 0.6 },
                { id: "maldicion-fatal", name: "Maldicion Fatal", effect: "Daño tardío que se acumula y estalla.", unlockLevel: 5, maxCharges: 2, cost: 18, baseDamage: 35, scalingStat: "inteligencia", scalingFactor: 1.5 },
                { id: "maldicion-absorber-alma", name: "Absorber Alma", effect: "Arranca la esencia del enemigo para sanarte.", unlockLevel: 5, maxCharges: 6, cost: 12, baseDamage: 22, scalingStat: "inteligencia", scalingFactor: 1.0, statusChance: 70, statusType: "veneno", statusDuration: 3 }
            ]
        },
        destructor: {
            name: "Destructor",
            summary: "Sombras y fuego para cerrar combates rapido.",
            skills: [
                { id: "destructor-incinerar", name: "Incinerar", effect: "Fuego infernal de daño medio.", unlockLevel: 1, maxCharges: 5, cost: 14, baseDamage: 28, scalingStat: "inteligencia", scalingFactor: 1.3 },
                { id: "destructor-caos", name: "Descarga de Caos", effect: "Energía caótica que ignora defensas.", unlockLevel: 2, maxCharges: 3, cost: 14, baseDamage: 25, scalingStat: "inteligencia", scalingFactor: 1.1 },
                { id: "destructor-inmolar", name: "Inmolar", effect: "Prende fuego al enemigo.", unlockLevel: 3, maxCharges: 4, cost: 12, baseDamage: 20, scalingStat: "inteligencia", scalingFactor: 1.0, statusChance: 70, statusType: "quemadura", statusDuration: 3 },
                { id: "destructor-llama-negra", name: "Llama Negra", effect: "Llamas oscuras de daño masivo.", unlockLevel: 5, maxCharges: 2, cost: 22, baseDamage: 45, scalingStat: "inteligencia", scalingFactor: 1.8 }
            ]
        },
        evocador: {
            name: "Evocador",
            summary: "Invoca apoyo oscuro para atacar y proteger.",
            skills: [
                { id: "evocador-diablillo", name: "Diablillo", effect: "Invocación menor que daña al enemigo.", unlockLevel: 1, maxCharges: 5, cost: 10, baseDamage: 18, scalingStat: "inteligencia", scalingFactor: 0.9 },
                { id: "evocador-vinculo", name: "Vinculo Oscuro", effect: "Absorbe parte del daño recibido.", unlockLevel: 2, maxCharges: 3, cost: 8, baseDamage: 10, scalingStat: "inteligencia", scalingFactor: 0.4 },
                { id: "evocador-acechador", name: "Acechador Vil", effect: "Interrumpe y daña al enemigo.", unlockLevel: 3, maxCharges: 3, cost: 12, baseDamage: 20, scalingStat: "inteligencia", scalingFactor: 1.0 },
                { id: "evocador-portal", name: "Portal Demoniaco", effect: "Evasión arcana que esconde al invocador.", unlockLevel: 5, maxCharges: 2, cost: 10, baseDamage: 5, scalingStat: "inteligencia", scalingFactor: 0.2 }
            ]
        }
    }
};

export const talentTree: Talent[] = [
    { id: "vigor", branch: "ofensiva", tier: 1, name: "Vigor de combate", description: "+2 Fuerza", cost: 1, stat: "fuerza" as keyof StatBlock, amount: 2 },
    { id: "mente-clara", branch: "maestria", tier: 1, name: "Mente clara", description: "+2 Inteligencia", cost: 1, stat: "inteligencia" as keyof StatBlock, amount: 2 },
    { id: "presencia", branch: "supervivencia", tier: 1, name: "Presencia firme", description: "+2 Poder", cost: 1, stat: "vitalidad" as keyof StatBlock, amount: 2 },
    { id: "cazador-duelos", branch: "ofensiva", tier: 2, requires: ["vigor"], name: "Cazador de duelos", description: "+1 carga a habilidades de daño", cost: 2, chargesBonus: 1 },
    { id: "piel-curtida", branch: "supervivencia", tier: 2, requires: ["presencia"], name: "Piel curtida", description: "+1 Fuerza y +1 Armadura", cost: 2, statMix: { fuerza: 1, armadura: 1 } },
    { id: "runas-fluidas", branch: "maestria", tier: 2, requires: ["mente-clara"], name: "Runas fluidas", description: "+1 carga a habilidades equipadas", cost: 2, chargesBonus: 1 },
    { id: "furia-enfocada", branch: "ofensiva", tier: 3, requires: ["cazador-duelos"], name: "Furia enfocada", description: "+3 Fuerza", cost: 3, stat: "fuerza" as keyof StatBlock, amount: 3 },
    { id: "guardia-veterana", branch: "supervivencia", tier: 3, requires: ["piel-curtida"], name: "Guardia veterana", description: "+3 Armadura", cost: 3, stat: "armadura" as keyof StatBlock, amount: 3 },
    { id: "maestria-inicial", branch: "maestria", tier: 3, requires: ["runas-fluidas"], name: "Maestria inicial", description: "+1 punto a todos los stats", cost: 3, allStats: 1 },
    { id: "campeon-alba", branch: "central", tier: 4, requires: ["furia-enfocada", "guardia-veterana", "maestria-inicial"], name: "Campeon del Alba", description: "+2 a todos los stats", cost: 4, allStats: 2 }
];
