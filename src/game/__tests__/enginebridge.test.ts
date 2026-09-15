import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EngineBridge } from '../enginebridge'
import { gameEventBus } from '../../events/EventBus'
import { ULTIMATE_SKILLS } from '../../data/gameData'
import type { Skill } from '../../types/game.types'

const playerData = {
  id: 'player',
  name: 'Hero',
  clase: 'Guerrero',
  level: 1,
  stats: {
    fuerza: 18,
    agilidad: 10,
    inteligencia: 10,
    vitalidad: 15,
    armadura: 5,
    resistenciaMagica: 5,
    probCritico: 0,
    dañoCritico: 50,
    velocidad: 10,
    precision: 100,
    esquiva: 0,
  },
  weaponDamage: { min: 5, max: 10 },
  habilidades: [{
    id: 'berserker-golpe-mortal',
    nombre: 'Golpe Mortal',
    cargas: 5,
    cargasMaximas: 5,
  }],
}

const enemyData = {
  id: 'enemy',
  name: 'Training Dummy',
  clase: 'Dummy',
  level: 1,
  stats: {
    fuerza: 5,
    agilidad: 5,
    inteligencia: 5,
    vitalidad: 8,
    armadura: 0,
    resistenciaMagica: 0,
    probCritico: 0,
    dañoCritico: 50,
    velocidad: 5,
    precision: 0,
    esquiva: 0,
  },
  abilities: [],
}

beforeEach(() => {
  gameEventBus.clear()
})

describe('EngineBridge', () => {
  it('startNewBattle creates matching engine and UI state', () => {
    const result = EngineBridge.startNewBattle(playerData, enemyData)

    expect(result.engineState.allies).toHaveLength(1)
    expect(result.engineState.enemies).toHaveLength(1)
    expect(result.uiState.player.name).toBe(playerData.name)
    expect(result.uiState.enemy.name).toBe(enemyData.name)
    expect(result.uiState.player.currentHp).toBe(result.uiState.player.maxHp)
    expect(result.uiState.enemy.currentHp).toBe(result.uiState.enemy.maxHp)
  })

  it('startNewBattle stores an ultimate skill in UI state', () => {
    const ultimate: Skill = ULTIMATE_SKILLS.Guerrero
    const result = EngineBridge.startNewBattle(playerData, enemyData, undefined, ultimate)

    expect(result.uiState.ultimateSkill).toEqual(ultimate)
    expect(result.uiState.ultimateSkill?.isUltimate).toBe(true)
  })

  it('selectAction executes a skill and advances the turn', () => {
    const battle = EngineBridge.startNewBattle(playerData, enemyData)
    const result = EngineBridge.selectAction(battle.engineState, battle.uiState, 0)

    expect(result.engineState.turn).toBeGreaterThan(battle.engineState.turn)
    expect(result.engineState.log.length).toBeGreaterThan(0)
  })

  it('selectAction keeps enemy HP within expected bounds', () => {
    const battle = EngineBridge.startNewBattle(playerData, enemyData)
    const result = EngineBridge.selectAction(battle.engineState, battle.uiState, 0)

    expect(result.uiState.enemy.currentHp).toBeLessThanOrEqual(result.uiState.enemy.maxHp)
    expect(result.uiState.enemy.currentHp).toBeGreaterThanOrEqual(0)
  })

  it('consumeItem uses a health potion', () => {
    const battle = EngineBridge.startNewBattle(playerData, enemyData, { pocionVida: 2, pocionMana: 2 })
    const result = EngineBridge.consumeItem(battle.engineState, battle.uiState, 'pocion-vida')

    expect(result.uiState.potions.pocionVida).toBe(1)
    expect(result.uiState.potions.pocionMana).toBe(2)
  })

  it('selectAction emits combat events', () => {
    const emitSpy = vi.spyOn(gameEventBus, 'emit')
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const battle = EngineBridge.startNewBattle(playerData, enemyData)

    EngineBridge.selectAction(battle.engineState, battle.uiState, 0)

    expect(emitSpy).toHaveBeenCalled()
    emitSpy.mockRestore()
    randomSpy.mockRestore()
  })
})
