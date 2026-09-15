import type { Character } from '../types/game.types'
import { getState } from './GameStore'

const SAVE_KEY = 'reinos-del-alba-save'
const AUTOSAVE_COOLDOWN = 2000

let _lastAutosave = 0

export function saveGame(): boolean {
  try {
    const state = getState()
    if (!state.character) return false
    localStorage.setItem(SAVE_KEY, JSON.stringify(state.character))
    return true
  } catch (e) {
    console.error('[Persistence] Error saving game:', e)
    return false
  }
}

export function loadGame(): { character: Character } | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!isValidCharacter(parsed)) {
      console.warn('[Persistence] Invalid save data, discarding')
      localStorage.removeItem(SAVE_KEY)
      return null
    }
    return { character: migrateCharacter(parsed) }
  } catch (e) {
    console.error('[Persistence] Error loading game:', e)
    return null
  }
}

export function deleteSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY)
  } catch (e) {
    console.error('[Persistence] Error deleting save:', e)
  }
}

export function hasSavedGame(): boolean {
  try {
    return localStorage.getItem(SAVE_KEY) !== null
  } catch {
    return false
  }
}

export function autosave(): void {
  const now = Date.now()
  if (now - _lastAutosave < AUTOSAVE_COOLDOWN) return
  _lastAutosave = now
  saveGame()
}

/* eslint-disable @typescript-eslint/no-unnecessary-condition -- migration fallbacks are intentionally defensive for older saves */
function migrateCharacter(raw: Record<string, unknown>): Character {
  const c = raw as Record<string, unknown>
  const w = c.wallet as Record<string, unknown>
  const s = c.skills as Record<string, unknown>

  return {
    name: c.name as string,
    race: c.race as Character['race'],
    class: c.class as Character['class'],
    level: (c.level as number) ?? 1,
    wallet: {
      gold: (w.gold as number) ?? 0,
      silver: (w.silver as number) ?? 0,
      copper: (w.copper as number) ?? 0,
    },
    inventory: Array.isArray(c.inventory) ? c.inventory as Character['inventory'] : [],
    stash: Array.isArray(c.stash) ? c.stash as Character['stash'] : [],
    equipment: (c.equipment as Character['equipment']) ?? {},
    talentPoints: (c.talentPoints as number) ?? 0,
    talents: Array.isArray(c.talents) ? c.talents as string[] : [],
    stats: (c.stats as Character['stats']) ?? {},
    skills: {
      activeStyle: (s.activeStyle as string) ?? '',
      equipped: Array.isArray(s.equipped) ? s.equipped as string[] : [],
      charges: (s.charges as Record<string, number>) ?? {},
    },
    ultimateEquipped: (c.ultimateEquipped as string) ?? undefined,
    experience: (c.experience as number) ?? 0,
    experienceToNext: (c.experienceToNext as number) ?? 100,
    arenaRank: (c.arenaRank as Character['arenaRank']) ?? undefined,
    loadouts: (c.loadouts as Character['loadouts']) ?? undefined,
  }
}

export function isValidCharacter(data: unknown): data is Record<string, unknown> {
  if (!data || typeof data !== 'object') return false
  const c = data as Record<string, unknown>
  if (typeof c.name !== 'string' || !c.name) return false
  if (typeof c.level !== 'number' || c.level < 1) return false
  if (typeof c.race !== 'string' || !c.race) return false
  if (typeof c.class !== 'string' || !c.class) return false
  if (!c.wallet || typeof c.wallet !== 'object') return false
  const w = c.wallet as Record<string, unknown>
  if (typeof w.gold !== 'number' || typeof w.silver !== 'number' || typeof w.copper !== 'number') return false
  if (!Array.isArray(c.inventory)) return false
  if (!c.equipment || typeof c.equipment !== 'object') return false
  if (typeof c.talentPoints !== 'number' || c.talentPoints < 0) return false
  if (!Array.isArray(c.talents)) return false
  if (!c.stats || typeof c.stats !== 'object') return false
  if (!c.skills || typeof c.skills !== 'object') return false
  const s = c.skills as Record<string, unknown>
  if (typeof s.activeStyle !== 'string') return false
  if (!Array.isArray(s.equipped)) return false
  if (!s.charges || typeof s.charges !== 'object') return false
  if (typeof c.experience !== 'number') return false
  if (typeof c.experienceToNext !== 'number') return false
  return true
}
