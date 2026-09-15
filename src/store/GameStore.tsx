import type { ReactNode } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Character } from '../types/game'
import type { Equipment, EquipmentSlot, StatBlock, ItemDefinition } from '../types/items'
import type { CombatState } from '../types/combat'
import type { InventoryItem } from '../types/game'
import { createEmptyEquipment } from '../engine/equipment'
import { talentTree, classAbilities } from '../data/gameData'
import type { Talent, Race, Class } from '../types/game'
import { BASE_STATS_CLASES, BASE_STATS_RAZAS } from '../game/config'
import type { ActiveExpedition, ArenaRank, BonusBossData } from '../types/game.types'
import { gameEventBus } from '../events/EventBus'
import { calculateRewards } from '../engine/expeditions'

export interface GameState {
  character: Character | null
  combat: CombatState | null
  screen: 'login' | 'creation' | 'game' | 'battle' | 'shop'
  expedition: ActiveExpedition | null
  levelUpCount: number
}

type StoreState = GameState & {
  dispatch: (action: GameAction) => void
}

export type GameAction =
  | { type: 'SET_CHARACTER'; payload: Character }
  | { type: 'UPDATE_CHARACTER'; payload: Partial<Character> }
  | { type: 'UPDATE_STATS'; payload: StatBlock }
  | { type: 'EQUIP_ITEM'; payload: string }
  | { type: 'UNEQUIP_ITEM'; payload: EquipmentSlot }
  | { type: 'ADD_INVENTORY'; payload: InventoryItem }
  | { type: 'ADD_ITEM_TO_INVENTORY'; payload: InventoryItem }
  | { type: 'REMOVE_INVENTORY'; payload: number }
  | { type: 'SET_COMBAT'; payload: CombatState | null }
  | { type: 'UPDATE_COMBAT'; payload: Partial<CombatState> }
  | { type: 'SET_SCREEN'; payload: GameState['screen'] }
  | { type: 'ADD_GOLD'; payload: number }
  | { type: 'ADD_CURRENCY'; payload: { gold?: number; silver?: number; copper?: number } }
  | { type: 'ADD_TALENT_POINT'; payload: number }
  | { type: 'LEARN_TALENT'; payload: { id: string; cost: number } }
  | { type: 'UPDATE_CHARGES'; payload: Record<string, number> }
  | { type: 'ADD_EXPERIENCE'; payload: number }
  | { type: 'LEVEL_UP' }
  | { type: 'CREATE_CHARACTER'; payload: { name: string; race: Race; class: Class } }
  | { type: 'LOAD_GAME'; payload: { character: Character } }
  | { type: 'START_EXPEDITION'; payload: ActiveExpedition }
  | { type: 'FINISH_EXPEDITION' }
  | { type: 'TRIGGER_BONUS_BOSS'; payload: { expedition: ActiveExpedition; bossData: BonusBossData } }
  | { type: 'START_BONUS_BATTLE' }
  | { type: 'CLEAR_BONUS_BOSS' }
  | { type: 'RECORD_PVP_RESULT'; payload: { won: boolean; opponentElo: number } }
  | { type: 'DEFEAT_PENALTY' }
  | { type: 'SELL_ITEM'; payload: string }
  | { type: 'EQUIP_ULTIMATE'; payload: string }
  | { type: 'UNEQUIP_ULTIMATE' }
  | { type: 'ACKNOWLEDGE_LEVEL_UP' }
  | { type: 'LOGOUT' }
  | { type: 'SAVE_LOADOUT'; payload: { name: string } }
  | { type: 'EQUIP_LOADOUT'; payload: { name: string } }

const initialState: GameState = {
  character: null,
  combat: null,
  screen: 'login',
  expedition: null,
  levelUpCount: 0
}

function applyTalentStatBonus(talent: Talent, base: StatBlock): StatBlock {
  if (talent.allStats) {
    const bonus: StatBlock = {}
    for (const key of Object.keys(base) as (keyof StatBlock)[]) {
      bonus[key] = (base[key] ?? 0) + talent.allStats
    }
    return bonus
  }
  if (talent.stat && talent.amount != null) {
    return { ...base, [talent.stat]: (base[talent.stat] ?? 0) + talent.amount }
  }
  if (talent.statMix) {
    const mix = { ...base }
    for (const key of Object.keys(talent.statMix) as (keyof StatBlock)[]) {
      mix[key] = (mix[key] ?? 0) + (talent.statMix[key] ?? 0)
    }
    return mix
  }
  return base
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_CHARACTER':
      return { ...state, character: action.payload, screen: 'game' }

    case 'UPDATE_CHARACTER':
      if (!state.character) return state
      return { ...state, character: { ...state.character, ...action.payload } }

    case 'UPDATE_STATS':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          stats: { ...state.character.stats, ...action.payload }
        }
      }

    case 'EQUIP_ITEM': {
      if (!state.character) return state
      const itemId = action.payload

      const invIndex = state.character.inventory.findIndex(inv => inv.id === itemId)
      const stashIndex = state.character.stash.findIndex(st => st.id === itemId)

      let sourceItem: InventoryItem | null = null
      let fromStash = false
      let sourceIndex = -1

      if (invIndex !== -1) {
        sourceItem = state.character.inventory[invIndex]
        sourceIndex = invIndex
      } else if (stashIndex !== -1) {
        sourceItem = state.character.stash[stashIndex]
        sourceIndex = stashIndex
        fromStash = true
      }

      if (!sourceItem || !sourceItem.slot) return state

      if (sourceItem.levelRequired && sourceItem.levelRequired > state.character.level) return state

      const slot = sourceItem.slot as EquipmentSlot
      const oldEquipment = state.character.equipment
      const oldItem = oldEquipment[slot]

      let newInventory = [...state.character.inventory]
      const newStash = [...state.character.stash]

      if (oldItem) {
        const displaced: InventoryItem = {
          id: oldItem.id,
          name: oldItem.name,
          source: 'equipado',
          rarity: oldItem.rarity,
          stats: oldItem.stats,
          slot: oldItem.slot,
          description: oldItem.description,
          durability: oldItem.durability,
          maxDurability: oldItem.maxDurability,
        }
        if (newInventory.length < 20) {
          newInventory.push(displaced)
        } else if (newStash.length < 48) {
          newStash.push(displaced)
        }
      }

      if (fromStash) {
        newStash.splice(sourceIndex, 1)
      } else {
        newInventory = newInventory.filter((_, i) => i !== sourceIndex)
      }

      const newEquipment = { ...oldEquipment, [slot]: sourceItem as ItemDefinition }

      return {
        ...state,
        character: {
          ...state.character,
          inventory: newInventory,
          stash: newStash,
          equipment: newEquipment,
        }
      }
    }

    case 'UNEQUIP_ITEM': {
      if (!state.character) return state
      const slot = action.payload
      const currentItem = state.character.equipment[slot]
      if (!currentItem) return state

      const hasInventorySpace = state.character.inventory.length < 20
      const hasStashSpace = state.character.stash.length < 48
      if (!hasInventorySpace && !hasStashSpace) return state

      const unequippedItem: InventoryItem = {
        id: currentItem.id,
        name: currentItem.name,
        source: 'botin',
        rarity: currentItem.rarity,
        stats: currentItem.stats,
        slot: currentItem.slot,
        description: currentItem.description,
        durability: currentItem.durability,
        maxDurability: currentItem.maxDurability,
      }

      const newEquipment = { ...state.character.equipment, [slot]: null }
      const newInventory = [...state.character.inventory]
      const newStash = [...state.character.stash]

      if (hasInventorySpace) {
        newInventory.push(unequippedItem)
      } else {
        newStash.push(unequippedItem)
      }

      return {
        ...state,
        character: {
          ...state.character,
          inventory: newInventory,
          equipment: newEquipment,
          stash: newStash,
        }
      }
    }

    case 'ADD_INVENTORY':
    case 'ADD_ITEM_TO_INVENTORY': {
      if (!state.character) return state
      const newStash = state.character.stash.length < 48
        ? [...state.character.stash, action.payload]
        : state.character.stash
      return {
        ...state,
        character: {
          ...state.character,
          stash: newStash,
        }
      }
    }

    case 'REMOVE_INVENTORY': {
      if (!state.character) return state
      const inv = [...state.character.inventory]
      inv.splice(action.payload, 1)
      return { ...state, character: { ...state.character, inventory: inv } }
    }

    case 'SET_COMBAT':
      return { ...state, combat: action.payload }

    case 'UPDATE_COMBAT':
      if (!state.combat) return state
      return { ...state, combat: { ...state.combat, ...action.payload } }

    case 'SET_SCREEN':
      return { ...state, screen: action.payload }

    case 'ADD_GOLD':
      if (!state.character) return state
      {
        let newGold = state.character.wallet.gold + action.payload
        let newSilver = state.character.wallet.silver
        let newCopper = state.character.wallet.copper

        if (newGold >= 100) {
          const silverFromGold = Math.floor(newGold / 100)
          newSilver += silverFromGold
          newGold = newGold % 100
        }

        if (newSilver >= 100) {
          const goldFromSilver = Math.floor(newSilver / 100)
          newGold += goldFromSilver
          newSilver = newSilver % 100
        }

        if (newCopper >= 100) {
          newSilver += Math.floor(newCopper / 100)
          newCopper = newCopper % 100
        }

        while (newGold < 0 && newSilver > 0) {
          newSilver -= 1
          newGold += 100
        }

        while (newGold < 0 && newCopper > 0) {
          newCopper -= 1
          newGold += 100
        }

        if (newGold < 0) {
          newGold = 0
        }

        return {
          ...state,
          character: {
            ...state.character,
            wallet: {
              gold: newGold,
              silver: newSilver,
              copper: newCopper
            }
          }
        }
      }

    case 'ADD_CURRENCY':
      if (!state.character) return state
      {
        const { gold = 0, silver = 0, copper = 0 } = action.payload
        let newGold = state.character.wallet.gold + gold
        let newSilver = state.character.wallet.silver + silver
        let newCopper = state.character.wallet.copper + copper

        if (newGold >= 100) {
          const silverFromGold = Math.floor(newGold / 100)
          newSilver += silverFromGold
          newGold = newGold % 100
        }
        if (newSilver >= 100) {
          const goldFromSilver = Math.floor(newSilver / 100)
          newGold += goldFromSilver
          newSilver = newSilver % 100
        }
        if (newCopper >= 100) {
          const silverFromCopper = Math.floor(newCopper / 100)
          newSilver += silverFromCopper
          newCopper = newCopper % 100
        }

        return {
          ...state,
          character: {
            ...state.character,
            wallet: {
              gold: Math.max(0, newGold),
              silver: Math.max(0, newSilver),
              copper: Math.max(0, newCopper)
            }
          }
        }
      }

    case 'ADD_TALENT_POINT':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          talentPoints: state.character.talentPoints + action.payload
        }
      }

    case 'LEARN_TALENT': {
      if (!state.character) return state
      const { id, cost } = action.payload
      const talent = talentTree.find(t => t.id === id)
      if (!talent) return state
      if (state.character.talentPoints < cost) return state
      if (state.character.talents.includes(id)) return state

      if (talent.requires?.length) {
        const hasPrereqs = talent.requires.every(reqId =>
          state.character?.talents.includes(reqId)
        )
        if (!hasPrereqs) return state
      }

      const newStats = applyTalentStatBonus(talent, state.character.stats)
      const char = state.character
      const bonus = talent.chargesBonus ?? 0
      const newCharges = bonus > 0
        ? Object.fromEntries(
            Object.entries(char.skills.charges).map(([k, v]) => [k, v + bonus])
          )
        : char.skills.charges

      return {
        ...state,
        character: {
          ...char,
          stats: newStats,
          talents: [...char.talents, id],
          talentPoints: char.talentPoints - cost,
          skills: { ...char.skills, charges: newCharges }
        }
      }
    }

    case 'UPDATE_CHARGES':
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          skills: {
            ...state.character.skills,
            charges: { ...state.character.skills.charges, ...action.payload }
          }
        }
      }

    case 'ADD_EXPERIENCE': {
      if (!state.character) return state
      let remaining = state.character.experience + action.payload
      let level = state.character.level
      let talentPoints = state.character.talentPoints
      let levelsGained = 0

      while (remaining >= level * 100) {
        remaining -= level * 100
        level += 1
        talentPoints += 1
        levelsGained += 1
      }

      return {
        ...state,
        levelUpCount: state.levelUpCount + levelsGained,
        character: {
          ...state.character,
          experience: remaining,
          experienceToNext: level * 100,
          level,
          talentPoints
        }
      }
    }

    case 'LEVEL_UP':
      if (!state.character) return state
      return {
        ...state,
        levelUpCount: state.levelUpCount + 1,
        character: {
          ...state.character,
          level: state.character.level + 1,
          experienceToNext: (state.character.level + 1) * 100,
          talentPoints: state.character.talentPoints + 1
        }
      }

    case 'LOAD_GAME':
      return { ...state, character: action.payload.character, screen: 'game', expedition: null, levelUpCount: 0 }

    case 'START_EXPEDITION':
      if (state.expedition) return state
      return { ...state, expedition: action.payload }

    case 'FINISH_EXPEDITION':
      if (!state.character || !state.expedition) return { ...state, expedition: null }
      {
        const char = state.character
        const rewards = calculateRewards(state.expedition, char.class, char.level, char.talentPoints)

        let remainingXp = char.experience + rewards.experience
        let level = char.level
        let talentPoints = char.talentPoints + (rewards.talentPoint ? 1 : 0)
        let levelsGained = 0

        while (remainingXp >= level * 100) {
          remainingXp -= level * 100
          level += 1
          talentPoints += 1
          levelsGained += 1
        }

        const currentWallet = char.wallet
        let newGold = currentWallet.gold + rewards.gold
        let newSilver = currentWallet.silver
        const newCopper = currentWallet.copper

        if (newGold >= 100) {
          newSilver += Math.floor(newGold / 100)
          newGold = newGold % 100
        }

        const newStash = rewards.item && char.stash.length < 48
          ? [...char.stash, rewards.item]
          : char.stash

        return {
          ...state,
          expedition: null,
          levelUpCount: state.levelUpCount + levelsGained,
          character: {
            ...char,
            level,
            experience: remainingXp,
            experienceToNext: level * 100,
            talentPoints,
            wallet: { gold: newGold, silver: newSilver, copper: newCopper },
            stash: newStash,
          }
        }
      }

    case 'TRIGGER_BONUS_BOSS': {
      const { expedition, bossData } = action.payload
      return {
        ...state,
        expedition: {
          ...expedition,
          bonusBossReady: true,
          bonusBossData: bossData,
        }
      }
    }

    case 'START_BONUS_BATTLE':
      return { ...state, screen: 'battle' as const }

    case 'CLEAR_BONUS_BOSS':
      if (!state.expedition) return state
      return {
        ...state,
        expedition: {
          ...state.expedition,
          bonusBossReady: false,
          bonusBossData: undefined,
        }
      }

    case 'RECORD_PVP_RESULT': {
      if (!state.character) return state
      const { won, opponentElo } = action.payload
      const currentRank: ArenaRank = state.character.arenaRank ?? { eloRating: 1000, wins: 0, losses: 0 }
      const newElo = calculateElo(currentRank.eloRating, opponentElo, won)
      return {
        ...state,
        character: {
          ...state.character,
          arenaRank: {
            eloRating: newElo,
            wins: currentRank.wins + (won ? 1 : 0),
            losses: currentRank.losses + (won ? 0 : 1)
          }
        }
      }
    }

    case 'CREATE_CHARACTER': {
      const { name, race, class: charClass } = action.payload
      const classConfig = BASE_STATS_CLASES[charClass as keyof typeof BASE_STATS_CLASES]
      const raceConfig = BASE_STATS_RAZAS[race as keyof typeof BASE_STATS_RAZAS]
      const BASE: StatBlock = { fuerza: 15, agilidad: 10, inteligencia: 10, vitalidad: 12, armadura: 5, resistenciaMagica: 5, probCritico: 5, dañoCritico: 50, velocidad: 10, precision: 80, esquiva: 5, roboVida: 0, regenMana: 3 }
      const baseStats: StatBlock = { ...BASE, ...raceConfig, ...classConfig }

      const activeStyle = Object.keys(classAbilities[charClass])[0]

      const character: Character = {
        name,
        race,
        class: charClass,
        level: 1,
        wallet: { gold: 500, silver: 0, copper: 0 },
        inventory: [],
        stash: [],
        equipment: createEmptyEquipment(),
        talentPoints: 1,
        talents: [],
        stats: baseStats,
        skills: {
          activeStyle,
          equipped: [],
          charges: {}
        },
        experience: 0,
        experienceToNext: 100
      }

      return { ...state, character, screen: 'game' }
    }

    case 'SELL_ITEM': {
      if (!state.character) return state
      const itemId = action.payload
      const stashIdx = state.character.stash.findIndex(st => st.id === itemId)
      if (stashIdx === -1) return state

      const item = state.character.stash[stashIdx]
      const salePrice = item.price ?? 1
      const newStash = state.character.stash.filter((_, i) => i !== stashIdx)

      let newGold = state.character.wallet.gold + salePrice
      let newSilver = state.character.wallet.silver
      let newCopper = state.character.wallet.copper

      if (newGold >= 100) {
        const silverFromGold = Math.floor(newGold / 100)
        newSilver += silverFromGold
        newGold = newGold % 100
      }
      if (newSilver >= 100) {
        const goldFromSilver = Math.floor(newSilver / 100)
        newGold += goldFromSilver
        newSilver = newSilver % 100
      }
      if (newCopper >= 100) {
        const silverFromCopper = Math.floor(newCopper / 100)
        newSilver += silverFromCopper
        newCopper = newCopper % 100
      }

      return {
        ...state,
        character: {
          ...state.character,
          stash: newStash,
          wallet: { gold: Math.max(0, newGold), silver: Math.max(0, newSilver), copper: Math.max(0, newCopper) }
        }
      }
    }

    case 'EQUIP_ULTIMATE': {
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          ultimateEquipped: action.payload,
        }
      }
    }

    case 'UNEQUIP_ULTIMATE': {
      if (!state.character) return state
      return {
        ...state,
        character: {
          ...state.character,
          ultimateEquipped: undefined,
        }
      }
    }

    case 'DEFEAT_PENALTY': {
      if (!state.character) return state
      const newEquipment = { ...state.character.equipment }
      for (const key of Object.keys(newEquipment) as (keyof Equipment)[]) {
        const item = newEquipment[key]
        if (!item) continue
        if (item.durability != null) {
          const reduced = Math.floor(item.durability * 0.9)
          newEquipment[key] = {
            ...item,
            durability: Math.max(0, Math.min(reduced, item.maxDurability ?? reduced))
          }
        }
      }
      const goldLost = Math.floor(state.character.wallet.gold * 0.05)
      return {
        ...state,
        character: {
          ...state.character,
          wallet: {
            ...state.character.wallet,
            gold: Math.max(0, state.character.wallet.gold - goldLost)
          },
          equipment: newEquipment
        }
      }
    }

    case 'ACKNOWLEDGE_LEVEL_UP':
      return { ...state, levelUpCount: 0 }

    case 'LOGOUT':
      return { character: null, combat: null, screen: 'login', expedition: null, levelUpCount: 0 }

    case 'SAVE_LOADOUT': {
      if (!state.character) return state
      const equippedSlots = Object.entries(state.character.equipment)
        .filter((entry): entry is [string, ItemDefinition] => entry[1] != null)
      const slotMap = Object.fromEntries(equippedSlots.map(([slot, item]) => [slot, item.id]))
      return {
        ...state,
        character: {
          ...state.character,
          loadouts: { ...state.character.loadouts, [action.payload.name]: slotMap },
        }
      }
    }

    case 'EQUIP_LOADOUT': {
      if (!state.character) return state
      const { name } = action.payload
      const loadout = state.character.loadouts?.[name]
      if (!loadout) return state

      let newStash = [...state.character.stash]
      const newEquipment = { ...state.character.equipment }

      for (const [slot, itemId] of Object.entries(loadout)) {
        const stashIdx = newStash.findIndex(st => st.id === itemId)
        if (stashIdx === -1) continue

        const currentItem = newEquipment[slot]
        if (currentItem) {
          const displaced: InventoryItem = {
            id: currentItem.id,
            name: currentItem.name,
            source: 'botin',
            rarity: currentItem.rarity,
            stats: currentItem.stats,
            slot: currentItem.slot,
            description: currentItem.description,
            durability: currentItem.durability,
            maxDurability: currentItem.maxDurability,
          }
          newStash = [...newStash, displaced]
        }

        const targetItem = newStash[stashIdx]
        newStash = newStash.filter((_, i) => i !== stashIdx)
        newEquipment[slot] = targetItem as ItemDefinition
      }

      return {
        ...state,
        character: {
          ...state.character,
          stash: newStash,
          equipment: newEquipment,
        }
      }
    }

    default:
      return state
  }
}

const ELO_K = 32

export function calculateElo(playerElo: number, opponentElo: number, won: boolean): number {
  const expected = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400))
  const score = won ? 1 : 0
  return Math.round(playerElo + ELO_K * (score - expected))
}

const SAVE_KEY = 'reinos-del-alba-save'
let saveTimer: ReturnType<typeof setTimeout> | null = null

function hasStorage(): boolean {
  return typeof localStorage !== 'undefined'
}

function normalizeSavedValue(raw: string | null): string | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === 'object' && 'state' in parsed) {
      return raw
    }
    return JSON.stringify({ state: { character: parsed, expedition: null }, version: 0 })
  } catch {
    return raw
  }
}

const THROTTLED_STORAGE = {
  getItem: (name: string): string | null => {
    if (!hasStorage()) return null
    return normalizeSavedValue(localStorage.getItem(name))
  },
  setItem: (name: string, value: string): void => {
    if (!hasStorage()) return
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      localStorage.setItem(name, value)
    }, 2000)
  },
  removeItem: (name: string): void => {
    if (!hasStorage()) return
    localStorage.removeItem(name)
  },
}

function serializeCurrentSave(): string {
  const state = zustandStore.getState()
  return JSON.stringify({
    state: {
      character: state.character,
      expedition: state.expedition,
    },
    version: 0,
  })
}

function writeImmediateSave(): void {
  if (!hasStorage()) return
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  localStorage.setItem(SAVE_KEY, serializeCurrentSave())
}

function isHydratedCharacterValid(character: unknown): character is Character {
  if (!character || typeof character !== 'object') return false
  const c = character as Record<string, unknown>
  const wallet = c.wallet as Record<string, unknown> | null | undefined
  return (
    typeof c.name === 'string' && c.name !== '' &&
    typeof c.level === 'number' && (c.level as number) >= 1 &&
    typeof c.class === 'string' && c.class !== '' &&
    typeof c.race === 'string' && c.race !== '' &&
    wallet != null &&
    typeof wallet.gold === 'number' &&
    typeof wallet.silver === 'number' &&
    typeof wallet.copper === 'number'
  )
}

const zustandStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...initialState,
      dispatch: (action: GameAction) => {
        const next = reducer(get(), action)
        set({ ...next, dispatch: get().dispatch }, true)
      },
    }),
    {
      name: SAVE_KEY,
      partialize: (state) => ({
        character: state.character,
        expedition: state.expedition,
      }),
      storage: createJSONStorage(() => THROTTLED_STORAGE),
      merge: (persisted, current) => {
        const saved = persisted as Partial<GameState> | null
        return {
          ...initialState,
          ...current,
          ...(saved ?? {}),
          dispatch: current.dispatch,
        }
      },
    }
  )
)

export function useGameStore(): StoreState {
  return zustandStore()
}

zustandStore.subscribe((state) => {
  if (state.character && !isHydratedCharacterValid(state.character)) {
    zustandStore.setState({ character: null, screen: 'login' })
  }
})

gameEventBus.subscribe('Victory', () => {
  writeImmediateSave()
})

export function dispatch(action: GameAction): void {
  zustandStore.getState().dispatch(action)
}

export function getState(): GameState {
  const { dispatch: _dispatch, ...state } = zustandStore.getState()
  return state
}

export function resetStore(): void {
  const currentDispatch = zustandStore.getState().dispatch
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  zustandStore.setState({ ...initialState, dispatch: currentDispatch }, true)
}

export function GameProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
