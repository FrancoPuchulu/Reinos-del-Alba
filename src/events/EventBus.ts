import type { CombatEventType } from '../types/combat'
import type { StatusEffectType } from '../types/items'

export interface GameEvent {
  type: CombatEventType | 'ItemEquipped' | 'ItemUnequipped' | 'LevelUp' | 'QuestComplete'
  turn?: number
  source?: string
  target?: string
  value?: number
  statusType?: StatusEffectType
  extra?: Record<string, unknown>
  timestamp: number
}

type EventListener = (event: GameEvent) => void

class EventBus {
  private listeners: Map<string, Set<EventListener>> = new Map()

  subscribe(eventType: string, callback: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)?.add(callback)
    return () => this.listeners.get(eventType)?.delete(callback)
  }

  emit(eventType: string, event: Partial<GameEvent>): void {
    const fullEvent: GameEvent = {
      type: event.type as CombatEventType,
      ...event,
      timestamp: Date.now()
    }
    const handlers = this.listeners.get(eventType)
    if (handlers) {
      for (const handler of handlers) {
        handler(fullEvent)
      }
    }
    const allHandlers = this.listeners.get('*')
    if (allHandlers) {
      for (const handler of allHandlers) {
        handler(fullEvent)
      }
    }
  }

  clear(): void {
    this.listeners.clear()
  }
}

export const gameEventBus = new EventBus()
