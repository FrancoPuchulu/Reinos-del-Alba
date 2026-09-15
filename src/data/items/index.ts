import type { Class } from '../../types/game'
import type { ItemDefinition } from '../../types/items'
import { GuerreroItems } from './Guerrero'
import { MagoItems } from './Mago'
import { DruidaItems } from './Druida'
import { BrujoItems } from './Brujo'

const itemsByClass: Record<string, ItemDefinition[]> = {
  Guerrero: GuerreroItems,
  Mago: MagoItems,
  Druida: DruidaItems,
  Brujo: BrujoItems
}

export function getItemsForClass(charClass: Class): ItemDefinition[] {
  return itemsByClass[charClass] ?? []
}

export function getAllItems(): ItemDefinition[] {
  return Object.values(itemsByClass).flat()
}

export function getItemById(id: string): ItemDefinition | undefined {
  return getAllItems().find(item => item.id === id)
}

export function getItemsBySlot(slot: string, charClass: Class): ItemDefinition[] {
  return getItemsForClass(charClass).filter(item => item.slot === slot)
}
