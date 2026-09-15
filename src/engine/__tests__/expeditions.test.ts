import { afterEach, describe, expect, it, vi } from 'vitest'
import { calculateRewards, isExpeditionComplete } from '../expeditions'
import type { ActiveExpedition, Rarity } from '../../types/game.types'

const VALID_RARITIES: Rarity[] = ['normal', 'magico', 'epico', 'unico']

function expedition(overrides?: Partial<ActiveExpedition>): ActiveExpedition {
  return {
    adventureName: 'Aguja Brisaveloz',
    category: 'misiones',
    difficulty: 'normal',
    startTime: Date.now(),
    durationMinutes: 10,
    ...overrides,
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('expeditions', () => {
  it('isExpeditionComplete returns false before duration elapses', () => {
    vi.setSystemTime(100_000)
    const active = expedition({ startTime: 0, durationMinutes: 5 })

    expect(isExpeditionComplete(active)).toBe(false)
  })

  it('isExpeditionComplete returns true when duration elapses', () => {
    vi.setSystemTime(300_000)
    const active = expedition({ startTime: 0, durationMinutes: 5 })

    expect(isExpeditionComplete(active)).toBe(true)
  })

  it('calculateRewards returns positive rewards', () => {
    const rewards = calculateRewards(expedition(), 'Guerrero', 1, 0)

    expect(rewards.gold).toBeGreaterThan(0)
    expect(rewards.experience).toBeGreaterThan(0)
  })

  it('calculateRewards scales with difficulty', () => {
    const normal = calculateRewards(expedition({ difficulty: 'normal' }), 'Guerrero', 1, 0)
    const heroico = calculateRewards(expedition({ difficulty: 'heroico' }), 'Guerrero', 1, 0)
    const mitico = calculateRewards(expedition({ difficulty: 'mitico' }), 'Guerrero', 1, 0)

    expect(heroico.gold).toBeGreaterThan(normal.gold)
    expect(mitico.gold).toBeGreaterThan(heroico.gold)
    expect(heroico.experience).toBeGreaterThan(normal.experience)
    expect(mitico.experience).toBeGreaterThan(heroico.experience)
  })

  it('calculateRewards assigns valid item rarities', () => {
    for (let i = 0; i < 50; i++) {
      const rewards = calculateRewards(expedition(), 'Guerrero', 50, 0)
      expect(rewards.item).not.toBeNull()
      expect(VALID_RARITIES).toContain(rewards.item?.rarity)
    }
  })
})
