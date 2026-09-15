import type { CombatEnemy, CombatAction, CombatState } from '../types/combat'
import { roll } from './utils'

function selectTarget(state: CombatState): string {
  const aliveAllies = state.allies.filter(a => a.currentHp > 0)
  if (aliveAllies.length === 0) return 'ally_1'
  const lowest = aliveAllies.reduce((a, b) => a.currentHp < b.currentHp ? a : b)
  const aliveIndex = state.allies.indexOf(lowest)
  return `ally_${aliveIndex + 1}` as string
}

export function applyEnemyAI(
  enemy: CombatEnemy,
  state: CombatState
): CombatAction {
  const availableAbilities = enemy.abilities
  const target = selectTarget(state)
  const targetAlly = state.allies[Number(target.split('_')[1]) - 1]
  const hpPercent = targetAlly.currentHp / targetAlly.maxHp
  const enemyHpPercent = enemy.currentHp / enemy.maxHp

  if (availableAbilities.length === 0) {
    return {
      type: 'attack',
      sourceId: enemy.id,
      targetIds: [target]
    }
  }

  const scoredAbilities = availableAbilities.map(ability => {
    let priority: number

    switch (ability.id) {
      case 'heal':
        priority = enemyHpPercent < 0.3 ? 90 : enemyHpPercent < 0.6 ? 50 : 10
        break
      case 'strong_attack':
      case 'power_strike':
        priority = hpPercent > 0.5 ? 70 : 40
        break
      case 'debuff':
      case 'weaken':
        priority = 50
        break
      case 'dot_poison':
      case 'bleed':
        priority = state.turn < 5 ? 60 : 30
        break
      case 'aoe':
        priority = state.enemies.filter(e => e.id !== enemy.id && e.currentHp > 0).length >= 1 ? 55 : 20
        break
      case 'stun':
        priority = 40
        break
      case 'finisher':
        priority = hpPercent < 0.3 ? 85 : 20
        break
      default:
        priority = 50
    }

    const variance = roll(20) - 10
    return { ability, priority: Math.max(0, priority + variance) }
  })

  scoredAbilities.sort((a, b) => b.priority - a.priority)
  const chosen = scoredAbilities[0]

  if (chosen.priority < 20 || roll(100) > chosen.priority + 20) {
    return {
      type: 'attack',
      sourceId: enemy.id,
      targetIds: [target]
    }
  }

  return {
    type: 'skill',
    sourceId: enemy.id,
    targetIds: [target],
    abilityId: chosen.ability.id
  }
}

export function createDefaultAbilities(level: number) {
  return [
    {
      id: 'attack',
      name: 'Ataque',
      baseDamage: 5 + level,
      scalingStat: 'fuerza' as const,
      scalingFactor: 0.5,
    },
    {
      id: 'strong_attack',
      name: 'Golpe Fuerte',
      baseDamage: 10 + level * 2,
      scalingStat: 'fuerza' as const,
      scalingFactor: 0.8,
    }
  ]
}
