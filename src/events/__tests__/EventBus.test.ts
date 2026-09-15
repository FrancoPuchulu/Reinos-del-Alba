import { beforeEach, describe, expect, it, vi } from 'vitest'
import { gameEventBus } from '../EventBus'

beforeEach(() => {
  gameEventBus.clear()
})

describe('gameEventBus', () => {
  it('subscribe and emit execute a listener', () => {
    const listener = vi.fn()
    gameEventBus.subscribe('Attack', listener)

    gameEventBus.emit('Attack', { type: 'Attack', turn: 1 })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ type: 'Attack', turn: 1 }))
  })

  it('unsubscribe stops future events', () => {
    const listener = vi.fn()
    const unsubscribe = gameEventBus.subscribe('Attack', listener)

    unsubscribe()
    gameEventBus.emit('Attack', { type: 'Attack', turn: 1 })

    expect(listener).not.toHaveBeenCalled()
  })

  it('emit without listeners does not throw', () => {
    expect(() => gameEventBus.emit('Attack', { type: 'Attack', turn: 1 })).not.toThrow()
  })

  it('wildcard receives all events', () => {
    const listener = vi.fn()
    gameEventBus.subscribe('*', listener)

    gameEventBus.emit('Attack', { type: 'Attack', turn: 1 })
    gameEventBus.emit('Heal', { type: 'Heal', turn: 2 })

    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener).toHaveBeenNthCalledWith(1, expect.objectContaining({ type: 'Attack' }))
    expect(listener).toHaveBeenNthCalledWith(2, expect.objectContaining({ type: 'Heal' }))
  })
})
