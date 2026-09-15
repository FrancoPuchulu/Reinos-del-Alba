import { describe, it, expect, vi, beforeEach } from 'vitest'
import { dispatch, getState, resetStore } from '../GameStore'
import { createEmptyEquipment } from '../../engine/equipment'
import type { InventoryItem, EquipmentSlot } from '../../types/game.types'
import type { Character } from '../../types/game'

vi.mock('../persistence', () => ({
  autosave: vi.fn(),
  loadGame: vi.fn().mockReturnValue(null),
  saveGame: vi.fn().mockReturnValue(true),
  deleteSave: vi.fn(),
  hasSavedGame: vi.fn().mockReturnValue(false),
}))

function createTestItem(id: string, slot: string, overrides?: Partial<InventoryItem>): InventoryItem {
  return {
    id, name: `Item ${id}`, source: 'test', rarity: 'normal',
    stats: { fuerza: 5 }, slot, equipped: false, ...overrides
  }
}

function requireChar(): Character {
  const char = getState().character
  if (!char) throw new Error('Expected character to exist')
  return char
}

beforeEach(() => {
  resetStore()
})

describe('SET_CHARACTER', () => {
  it('sets character and switches to game screen', () => {
    const char = getState().character
    expect(char).toBeNull()

    const testChar = {
      name: 'Test', race: 'Humano' as const, class: 'Guerrero' as const,
      level: 1, gold: 100, wallet: { gold: 100, silver: 0, copper: 0 },
      inventory: [], stash: [], equipment: createEmptyEquipment(),
      talentPoints: 0, talents: [], stats: {}, skills: { activeStyle: 'berserker', equipped: [], charges: {} },
      experience: 0, experienceToNext: 100
    }
    dispatch({ type: 'SET_CHARACTER', payload: testChar })
    expect(getState().character).toBe(testChar)
    expect(getState().screen).toBe('game')
  })
})

describe('CREATE_CHARACTER', () => {
  it('creates a character with correct base stats for Guerrero', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Thorin', race: 'Enano', class: 'Guerrero' } })
    const char = requireChar()
    expect(char.name).toBe('Thorin')
    expect(char.race).toBe('Enano')
    expect(char.class).toBe('Guerrero')
    expect(char.level).toBe(1)
    expect(char.wallet.gold).toBe(500)
    expect(char.wallet).toEqual({ gold: 500, silver: 0, copper: 0 })
    expect(char.talentPoints).toBe(1)
    expect(char.talents).toEqual([])
    expect(char.stats.fuerza).toBe(18)
    expect(char.stats.vitalidad).toBe(15)
    expect(getState().screen).toBe('game')
  })

  it('creates a character with correct base stats for Mago', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Gandalf', race: 'Gnomo', class: 'Mago' } })
    const char = requireChar()
    expect(char.stats.inteligencia).toBe(18)
    expect(char.stats.regenMana).toBe(8)
    expect(char.skills.activeStyle).toBe('fuego')
  })
})

describe('ADD_GOLD', () => {
  it('adds gold to character and wallet with silver conversion', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    dispatch({ type: 'ADD_GOLD', payload: 100 })
    expect(requireChar().wallet.gold).toBe(0)
    // wallet now holds the gold: 500+100=600 -> 6 silver, 0 gold
    expect(requireChar().wallet.silver).toBe(6)
    expect(requireChar().wallet.copper).toBe(0)
  })

  it('adds small gold without conversion', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    // wallet starts at 500, add 30 = 530, which converts: 5 silver + 30 gold
    dispatch({ type: 'ADD_GOLD', payload: 30 })
    expect(requireChar().wallet.gold).toBe(30)
    expect(requireChar().wallet.silver).toBe(5)
  })

  it('does nothing without a character', () => {
    dispatch({ type: 'ADD_GOLD', payload: 100 })
    expect(getState().character).toBeNull()
  })
})

describe('ADD_EXPERIENCE', () => {
  it('adds experience without leveling up', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    dispatch({ type: 'ADD_EXPERIENCE', payload: 50 })
    expect(requireChar().experience).toBe(50)
    expect(requireChar().level).toBe(1)
  })

  it('levels up when experience exceeds threshold', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    dispatch({ type: 'ADD_EXPERIENCE', payload: 150 })
    const char = requireChar()
    expect(char.level).toBe(2)
    expect(char.experience).toBe(50)
    expect(char.talentPoints).toBe(2)
  })

  it('handles multiple level ups in one dispatch', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    dispatch({ type: 'ADD_EXPERIENCE', payload: 400 })
    const char = requireChar()
    expect(char.level).toBe(3)
    expect(char.experience).toBe(100)
    expect(char.talentPoints).toBe(3)
  })

  it('does nothing without a character', () => {
    dispatch({ type: 'ADD_EXPERIENCE', payload: 100 })
    expect(getState().character).toBeNull()
  })
})

describe('LEARN_TALENT', () => {
  it('learns a talent when requirements are met', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    dispatch({ type: 'LEARN_TALENT', payload: { id: 'vigor', cost: 1 } })
    const char = requireChar()
    expect(char.talents).toContain('vigor')
    expect(char.talentPoints).toBe(0)
    expect(char.stats.fuerza).toBe(20)
  })

  it('rejects talent when insufficient points', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    dispatch({ type: 'LEARN_TALENT', payload: { id: 'vigor', cost: 5 } })
    expect(requireChar().talents).not.toContain('vigor')
    expect(requireChar().talentPoints).toBe(1)
  })

  it('rejects talent with unmet prerequisites', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    dispatch({ type: 'LEARN_TALENT', payload: { id: 'furia-enfocada', cost: 3 } })
    expect(requireChar().talents).not.toContain('furia-enfocada')
  })

  it('rejects duplicate talent', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    dispatch({ type: 'LEARN_TALENT', payload: { id: 'vigor', cost: 1 } })
    dispatch({ type: 'LEARN_TALENT', payload: { id: 'vigor', cost: 1 } })
    expect(requireChar().talentPoints).toBe(0)
  })

  it('rejects nonexistent talent', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    dispatch({ type: 'LEARN_TALENT', payload: { id: 'nonexistent', cost: 1 } })
    expect(requireChar().talents).toEqual([])
  })
})

describe('EQUIP_ITEM', () => {
  it('equips an item from inventory', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    const item = createTestItem('sword-1', 'armaPrincipal')
    dispatch({ type: 'ADD_ITEM_TO_INVENTORY', payload: item })
    dispatch({ type: 'EQUIP_ITEM', payload: 'sword-1' })
    const char = requireChar()
    expect(char.equipment.armaPrincipal).not.toBeNull()
    expect(char.equipment.armaPrincipal?.name).toBe('Item sword-1')
  })

  it('does nothing without a character', () => {
    dispatch({ type: 'EQUIP_ITEM', payload: 'sword-1' })
    expect(getState().character).toBeNull()
  })
})

describe('UNEQUIP_ITEM', () => {
  it('unequips an item from a slot', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    const item = createTestItem('shield-1', 'armadura')
    dispatch({ type: 'ADD_ITEM_TO_INVENTORY', payload: item })
    dispatch({ type: 'EQUIP_ITEM', payload: 'shield-1' })
    expect(requireChar().equipment.armadura).not.toBeNull()
    dispatch({ type: 'UNEQUIP_ITEM', payload: 'armadura' as EquipmentSlot })
    expect(requireChar().equipment.armadura).toBeNull()
  })

  it('does nothing when slot is empty', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    dispatch({ type: 'UNEQUIP_ITEM', payload: 'armadura' as EquipmentSlot })
    expect(requireChar().equipment.armadura).toBeNull()
  })
})

describe('DEFEAT_PENALTY', () => {
  it('reduces gold by 5%', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    dispatch({ type: 'DEFEAT_PENALTY' })
    const char = requireChar()
    expect(char.wallet.gold).toBe(475)
  })

  it('reduces equipment durability', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    const item = createTestItem('armor-1', 'armadura', { durability: 100, maxDurability: 100 })
    dispatch({ type: 'ADD_ITEM_TO_INVENTORY', payload: item })
    dispatch({ type: 'EQUIP_ITEM', payload: 'armor-1' })
    dispatch({ type: 'DEFEAT_PENALTY' })
    const equipped = requireChar().equipment.armadura
    expect(equipped).not.toBeNull()
    expect(equipped?.durability).toBe(90)
  })

  it('does nothing without a character', () => {
    dispatch({ type: 'DEFEAT_PENALTY' })
    expect(getState().character).toBeNull()
  })
})

describe('LOGOUT', () => {
  it('resets to initial state', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    expect(getState().character).not.toBeNull()
    dispatch({ type: 'LOGOUT' })
    expect(getState().character).toBeNull()
    expect(getState().screen).toBe('login')
    expect(getState().expedition).toBeNull()
    expect(getState().combat).toBeNull()
  })
})

describe('START_EXPEDITION', () => {
  it('starts an expedition', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    const expedition = {
      adventureName: 'Aguja Brisaveloz',
      category: 'misiones' as const,
      difficulty: 'normal' as const,
      startTime: Date.now(),
      durationMinutes: 10
    }
    dispatch({ type: 'START_EXPEDITION', payload: expedition })
    expect(getState().expedition).toEqual(expedition)
  })

  it('ignores if expedition already active', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    const exp1 = { adventureName: 'A', category: 'misiones' as const, difficulty: 'normal' as const, startTime: 0, durationMinutes: 10 }
    const exp2 = { adventureName: 'B', category: 'misiones' as const, difficulty: 'heroico' as const, startTime: 0, durationMinutes: 15 }
    dispatch({ type: 'START_EXPEDITION', payload: exp1 })
    dispatch({ type: 'START_EXPEDITION', payload: exp2 })
    expect(getState().expedition?.adventureName).toBe('A')
  })
})

describe('FINISH_EXPEDITION', () => {
  it('clears the expedition', () => {
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: 'Hero', race: 'Humano', class: 'Guerrero' } })
    dispatch({ type: 'START_EXPEDITION', payload: {
      adventureName: 'Aguja Brisaveloz', category: 'misiones', difficulty: 'normal',
      startTime: Date.now(), durationMinutes: 10
    }})
    expect(getState().expedition).not.toBeNull()
    dispatch({ type: 'FINISH_EXPEDITION' })
    expect(getState().expedition).toBeNull()
  })
})
