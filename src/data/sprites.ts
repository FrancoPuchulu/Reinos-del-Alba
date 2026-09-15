export interface CharacterSpritePaths {
  front: string
  back: string
}

export type SupportedRace = 'minotauro' | 'orco' | 'no-muerto' | 'goblin'
export type SupportedClass = 'druida' | 'guerrero' | 'mago' | 'brujo'
export type CharacterSpriteKey = `${SupportedRace}-${SupportedClass}`

export const CHARACTER_SPRITES: Partial<Record<CharacterSpriteKey, CharacterSpritePaths>> = {
  'minotauro-druida': {
    front: '/assets/images/characters/minotauro-druida-front.png',
    back: '/assets/images/characters/minotauro-druida-back.png',
  },
  'orco-guerrero': {
    front: '/assets/images/characters/orco-guerrero-front.png',
    back: '/assets/images/characters/orco-guerrero-back.png',
  },
  'no-muerto-mago': {
    front: '/assets/images/characters/no-muerto-mago-front.png',
    back: '/assets/images/characters/no-muerto-mago-back.png',
  },
  'goblin-brujo': {
    front: '/assets/images/characters/goblin-brujo-front.png',
    back: '/assets/images/characters/goblin-brujo-back.png',
  },
}

export const PLACEHOLDER_SPRITE: CharacterSpritePaths = {
  front: '/assets/images/characters/placeholder.png',
  back: '/assets/images/characters/placeholder.png',
}

function normalizeRace(input: string): string {
  const lower = input.toLowerCase().trim()
  // Insert hyphen before uppercase in camelCase (NoMuerto → no-muerto)
  return lower.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

function normalizeClass(input: string): string {
  return input.toLowerCase().trim()
}

export function getCharacterSprite(
  raceOrKey: string,
  classOrView?: string | 'front' | 'back',
  viewParam: 'front' | 'back' = 'front'
): string {
  let key: string
  let view: 'front' | 'back'

  if (classOrView === 'front' || classOrView === 'back') {
    key = raceOrKey
    view = classOrView
  } else if (typeof classOrView === 'string') {
    key = `${normalizeRace(raceOrKey)}-${normalizeClass(classOrView)}`
    view = viewParam
  } else {
    key = normalizeRace(raceOrKey)
    view = 'front'
  }

  const normalizedKey = key.replace(/\s+/g, '-')

  const spriteSet = CHARACTER_SPRITES[normalizedKey as CharacterSpriteKey]

  if (!spriteSet) {
    console.warn(
      `[SpriteSystem] Sprite no encontrado para: "${normalizedKey}" (Original: "${raceOrKey}").`,
      `Claves validas:`,
      Object.keys(CHARACTER_SPRITES)
    )
    return PLACEHOLDER_SPRITE[view]
  }

  return spriteSet[view]
}

export function getCharacterSpritePair(
  race: string,
  charClass: string
): CharacterSpritePaths {
  const key = `${normalizeRace(race)}-${normalizeClass(charClass)}`
  const spriteSet = CHARACTER_SPRITES[key as CharacterSpriteKey]

  if (!spriteSet) {
    console.warn(
      `[SpriteSystem] Sprite no encontrado para: "${key}".`,
      `Claves validas:`,
      Object.keys(CHARACTER_SPRITES)
    )
    return PLACEHOLDER_SPRITE
  }

  return spriteSet
}
