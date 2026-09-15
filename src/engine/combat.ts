import type { StatBlock, StatusEffectType } from '../types/items'
import type { Skill, Class } from '../types/game'
import type {
  CombatState, CombatEnemy, CombatAction, DamageResult,
  StatusInstance, CombatLogEntry, CombatActor, EnemyAbility,
  CombatFormat, CombatType
} from '../types/combat'
import { isTargetAlias } from '../types/combat'
import { calculateSkillDamage } from './skills'
import { gameEventBus } from '../events/EventBus'
import { applyEnemyAI } from './enemyAI'
import { classAbilities } from '../data/gameData'
import { roll } from './utils'
import {
  BASE_HIT_CHANCE, MIN_HIT_CHANCE, MAX_EVASION,
  CRIT_CAP, MAX_CRIT_DAMAGE, DEFAULT_CRIT_CHANCE, DEFAULT_CRIT_DAMAGE, EQUIP_CRIT_BONUS,
  MITIGATION_CAP, MITIGATION_DENOMINATOR, BLOCKED_THRESHOLD, MIN_DAMAGE,
  DEFAULT_PRECISION, DEFAULT_EVASION, DEFAULT_REGEN_MANA,
  HEALTH_POTION_HEAL, MANA_POTION_RESTORE,
  DEFEND_ARMOR_MULTIPLIER,
  EXTRA_TURN_CHANCE,
  DEFAULT_STATUS_DAMAGE, STATUS_DAMAGE_MULTIPLIER, STATUS_DURATION_DEFAULT,
  SKILL_BUFF_VALUES, SKILL_DEBUFF_VALUES,
  VAMPIRIC_HEAL_MULTIPLIER, THORNS_AFFIX_MULTIPLIER,
  EQUIP_LIFE_STEAL_BONUS,
  PLAYER_BASE_HP, PLAYER_HP_PER_VITALIDAD, PLAYER_HP_PER_LEVEL,
  PLAYER_BASE_MANA, PLAYER_MANA_PER_INTEL, PLAYER_MANA_PER_LEVEL,
  PLAYER_DEFAULT_ARMOR, PLAYER_DEFAULT_FUERZA, PLAYER_ARMOR_FUERZA_SCALE,
  PLAYER_MAGIC_RESIST_INTEL_SCALE, PLAYER_DEFAULT_MAGIC_RESIST,
  PLAYER_DEFAULT_VITALIDAD, PLAYER_DEFAULT_INTEL,
  ENEMY_BASE_HP, ENEMY_HP_PER_VITALIDAD, ENEMY_HP_PER_LEVEL,
  ENEMY_BASE_MANA, ENEMY_MIN_DAMAGE_BASE, ENEMY_MAX_DAMAGE_BASE,
  ENEMY_DAMAGE_PER_LEVEL_MAX, ENEMY_ARMOR_STRENGTH_SCALE, ENEMY_DEFAULT_ARMOR,
  ENEMY_BASE_XP, ENEMY_XP_PER_LEVEL, ENEMY_BASE_GOLD, ENEMY_GOLD_PER_LEVEL,
  ENEMY_DEFAULT_VITALIDAD, ENEMY_DEFAULT_FUERZA,
} from '../game/combat-config'

function hitChance(attackerPrecision: number, defenderEvasion: number): number {
  const base = Math.min(BASE_HIT_CHANCE, Math.max(MIN_HIT_CHANCE, attackerPrecision))
  const eva = Math.min(MAX_EVASION, Math.max(0, defenderEvasion))
  return Math.min(BASE_HIT_CHANCE, Math.max(MIN_HIT_CHANCE, base - eva))
}

function isCritical(probCritico: number): boolean {
  return roll(100) <= Math.min(CRIT_CAP, probCritico)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function hasActiveStatus(
  statuses: Record<string, StatusInstance[]>,
  actorId: string,
  type: StatusEffectType
): boolean {
  return (statuses[actorId] ?? []).some(s => s.type === type && s.duration > 0)
}

export function createCombatState(
  allies: CombatActor[],
  enemies: CombatEnemy[],
  combatType: CombatType = 'pve',
  format: CombatFormat = '1v1'
): CombatState {
  const alliesStatusRecord: Record<string, StatusInstance[]> = {}
  for (const ally of allies) {
    alliesStatusRecord[ally.id] = []
  }
  const enemiesStatusRecord: Record<string, StatusInstance[]> = {}
  for (const enemy of enemies) {
    enemiesStatusRecord[enemy.id] = []
  }
  return {
    phase: 'playerTurn',
    turn: 1,
    allies,
    enemies,
    statuses: { allies: alliesStatusRecord, enemies: enemiesStatusRecord },
    log: [{ turn: 1, message: '¡Comienza el combate!', type: 'system' }],
    selectedAbility: null,
    combatType,
    format,
    extraTurnActive: false,
    enemyUltimateCharge: 0,
  }
}

function cloneCombatState(state: CombatState): CombatState {
  return {
    ...state,
    allies: state.allies.map(a => ({ ...a })),
    enemies: state.enemies.map(e => ({
      ...e,
      abilities: e.abilities.map(a => ({ ...a })),
    })),
    statuses: {
      allies: Object.fromEntries(
        Object.entries(state.statuses.allies).map(([k, v]) => [k, v.map(s => ({ ...s }))])
      ),
      enemies: Object.fromEntries(
        Object.entries(state.statuses.enemies).map(([k, v]) => [k, v.map(s => ({ ...s }))])
      ),
    },
    log: [...state.log],
    extraTurnActive: state.extraTurnActive,
    enemyUltimateCharge: state.enemyUltimateCharge ?? 0,
  }
}

function findActorById(state: CombatState, id: string): { actor: CombatActor | CombatEnemy; side: 'ally' | 'enemy' } | null {
  const ally = state.allies.find(a => a.id === id)
  if (ally) return { actor: ally, side: 'ally' }
  const enemy = state.enemies.find(e => e.id === id)
  if (enemy) return { actor: enemy, side: 'enemy' }
  return null
}

function resolveTargetAlias(
  alias: string,
  state: CombatState
): { actor: CombatActor | CombatEnemy; side: 'ally' | 'enemy' } | null {
  if (alias === 'player') {
    if (state.allies.length === 0) return null
    return { actor: state.allies[0], side: 'ally' }
  }
  if (!isTargetAlias(alias)) return null
  if (alias.startsWith('ally_')) {
    const idx = Number(alias.split('_')[1]) - 1
    if (idx < 0 || idx >= state.allies.length) return null
    return { actor: state.allies[idx], side: 'ally' }
  }
  const idx = Number(alias.split('_')[1]) - 1
  if (idx < 0 || idx >= state.enemies.length) return null
  return { actor: state.enemies[idx], side: 'enemy' }
}

function getActorName(actor: CombatActor | CombatEnemy): string {
  if ('abilities' in actor) return actor.name
  return actor.name
}

function isAllyActor(actor: CombatActor | CombatEnemy): actor is CombatActor {
  return 'weaponDamage' in actor
}

function getActorStats(actor: CombatActor | CombatEnemy, statuses?: StatusInstance[]): StatBlock {
  let stats: StatBlock
  if (isAllyActor(actor)) {
    stats = { ...actor.stats, ...actor.totalStats }
  } else {
    stats = { ...actor.stats }
  }

  if (statuses && statuses.length > 0) {
    for (const status of statuses) {
      if (status.duration <= 0) continue
      const pct = status.value ?? 0
      switch (status.type) {
        case 'buff_fuerza':
          stats.fuerza = Math.floor((stats.fuerza ?? 0) * (1 + pct / 100))
          break
        case 'buff_inteligencia':
          stats.inteligencia = Math.floor((stats.inteligencia ?? 0) * (1 + pct / 100))
          break
        case 'buff_esquiva':
          stats.esquiva = Math.min(MAX_EVASION, (stats.esquiva ?? 0) + pct)
          break
        case 'debuff_armadura':
          stats.armadura = Math.max(0, Math.floor((stats.armadura ?? 0) * (1 + pct / 100)))
          break
        case 'debuff_resistenciaMagica':
          stats.resistenciaMagica = Math.max(0, Math.floor((stats.resistenciaMagica ?? 0) * (1 + pct / 100)))
          break
      }
    }
  }

  return stats
}

function getActorDamage(actor: CombatActor | CombatEnemy): { min: number; max: number } {
  if (isAllyActor(actor)) return actor.weaponDamage
  return actor.damage
}

export function calculateDamage(
  action: CombatAction,
  state: CombatState,
  skill: Skill | null
): { results: DamageResult[]; log: CombatLogEntry[]; newState: CombatState } {
  const log: CombatLogEntry[] = []
  const results: DamageResult[] = []
  const newState = cloneCombatState(state)

  const source = findActorById(newState, action.sourceId)
  if (!source) return { results, log, newState }

  const isHeal = action.healing === true

  const sourceSideStatuses = source.side === 'ally' ? newState.statuses.allies : newState.statuses.enemies
  const sourceHasCeguera = !isHeal && hasActiveStatus(sourceSideStatuses, source.actor.id, 'ceguera')
  const sourceActorStatuses = sourceSideStatuses[source.actor.id] ?? []

  const sourceStats = getActorStats(source.actor, sourceActorStatuses)
  const sourceDamage = getActorDamage(source.actor)

  for (const rawTargetId of action.targetIds) {
    const target = resolveTargetAlias(rawTargetId, newState)
    if (!target) continue

    const targetName = getActorName(target.actor)

    const targetSideStatuses = target.side === 'ally' ? newState.statuses.allies : newState.statuses.enemies
    const targetActorStatuses = targetSideStatuses[target.actor.id] ?? []

    const attackerPrecision = sourceHasCeguera
      ? (sourceStats.precision ?? DEFAULT_PRECISION) * 0.5
      : (sourceStats.precision ?? DEFAULT_PRECISION)
    const targetEvasion = getActorStats(target.actor, targetActorStatuses).esquiva ?? DEFAULT_EVASION
    const missChance = 100 - hitChance(attackerPrecision, targetEvasion)
    if (!isHeal && roll(100) <= missChance) {
      const reason = sourceHasCeguera ? ' (ceguera)' : ''
      log.push({
        turn: state.turn,
        message: `${source.actor.name} falla el ataque${reason} contra ${targetName}`,
        type: 'miss'
      })
      results.push({
        amount: 0,
        type: 'physical',
        critical: false,
        blocked: false,
        mitigated: 0,
        statusApplied: null,
        finalDamage: 0
      })
      continue
    }

    let baseDamage: number
    let damageType: 'physical' | 'magical' = 'physical'

    if (skill) {
      const totalStats: StatBlock = { ...('stats' in source.actor ? source.actor.stats : {}), ...('totalStats' in source.actor ? source.actor.totalStats : {}) }
      const wd = isAllyActor(source.actor) ? source.actor.weaponDamage : { min: 3, max: 8 }
      const calculated = calculateSkillDamage(skill, totalStats, wd)
      baseDamage = roll(calculated.max - calculated.min + 1) + calculated.min - 1
      if (skill.isUltimate) {
        baseDamage = Math.max(30, baseDamage)
      }
      const magicScaling = ['inteligencia', 'regenMana', 'resistenciaMagica']
      damageType = (skill.scalingStat && magicScaling.includes(skill.scalingStat)) ? 'magical' : 'physical'
    } else {
      baseDamage = roll(sourceDamage.max - sourceDamage.min + 1) + sourceDamage.min - 1
    }

    const equipCritBonus = isAllyActor(source.actor)
      ? (source.actor as CombatActor).equipmentEffectTypes?.includes('critBonus') ? EQUIP_CRIT_BONUS : 0
      : 0
    const probCrit = (sourceStats.probCritico ?? DEFAULT_CRIT_CHANCE) + equipCritBonus
    const dañoCrit = Math.min(MAX_CRIT_DAMAGE, sourceStats.dañoCritico ?? DEFAULT_CRIT_DAMAGE)
    const crit = isCritical(probCrit)
    if (crit) {
      baseDamage = Math.floor(baseDamage * (1 + dañoCrit / 100))
    }

    const targetStats = getActorStats(target.actor, targetActorStatuses)
    const targetArmor = targetStats.armadura ?? 0
    const targetMagicResist = targetStats.resistenciaMagica ?? 0

    const mitigation = damageType === 'magical' ? targetMagicResist : targetArmor
    const mitigated = Math.floor(baseDamage * clamp(mitigation / (mitigation + MITIGATION_DENOMINATOR), 0, MITIGATION_CAP))
    const finalRawDamage = Math.max(MIN_DAMAGE, baseDamage - mitigated)
    const blocked = mitigated > baseDamage * BLOCKED_THRESHOLD

    let finalDamage: number
    if (isHeal) {
      finalDamage = -Math.max(1, baseDamage)
    } else {
      finalDamage = finalRawDamage
    }

    const equipLifeSteal = isAllyActor(source.actor)
      ? (source.actor as CombatActor).equipmentEffectTypes?.includes('lifeSteal') ? EQUIP_LIFE_STEAL_BONUS : 0
      : 0
    const lifeSteal = (sourceStats.roboVida ?? 0) + equipLifeSteal
    if (lifeSteal > 0 && !isHeal && source.side === 'ally') {
      const healAmount = Math.floor(Math.abs(finalDamage) * lifeSteal / 100)
      const sourceActor = newState.allies.find(a => a.id === source.actor.id)
      if (sourceActor) {
        sourceActor.currentHp = Math.min(sourceActor.maxHp, sourceActor.currentHp + healAmount)
      }
    }

    let statusApplied: StatusInstance | null = null
    const skillStatusType = skill?.statusType as StatusEffectType | undefined
    if (!isHeal && skill?.statusChance && skillStatusType && roll(100) <= skill.statusChance) {
      statusApplied = {
        type: skillStatusType,
        duration: skill.statusDuration ?? 2,
        source: action.sourceId,
        value: Math.floor(Math.abs(finalDamage) * STATUS_DAMAGE_MULTIPLIER),
        skippedTurn: (skillStatusType === 'congelacion' || skillStatusType === 'aturdimiento')
      }
      const targetSideStatuses = target.side === 'ally' ? newState.statuses.allies : newState.statuses.enemies
      const targetKey = target.actor.id
      targetSideStatuses[targetKey] ??= []
      targetSideStatuses[targetKey] = [...targetSideStatuses[targetKey], statusApplied]
      log.push({
        turn: state.turn,
        message: skill?.isUltimate
          ? `⚡ ${targetName} sufre ${skillStatusType} durante ${skill.statusDuration ?? 2} turnos`
          : `${targetName} sufre ${skillStatusType}`,
        type: 'status'
      })
      gameEventBus.emit('StatusApplied', {
        type: 'StatusApplied', source: action.sourceId,
        target: targetKey, statusType: skillStatusType,
        turn: state.turn
      })
    }

    if (skill && !isHeal) {
      const sourceSideStatuses2 = source.side === 'ally' ? newState.statuses.allies : newState.statuses.enemies
      const targetSideStatuses2 = target.side === 'ally' ? newState.statuses.allies : newState.statuses.enemies

      switch (skill.id) {
        case 'proteccion-muro-acero':
        case 'healer-piel-corteza': {
          const buff: StatusInstance = { type: 'debuff_armadura', duration: STATUS_DURATION_DEFAULT, source: action.sourceId, value: SKILL_BUFF_VALUES.armorBuff }
          sourceSideStatuses2[source.actor.id] ??= []
          sourceSideStatuses2[source.actor.id] = [...sourceSideStatuses2[source.actor.id], buff]
          log.push({ turn: state.turn, message: `${source.actor.name} obtiene +30% armadura por ${STATUS_DURATION_DEFAULT} turnos`, type: 'buff' })
          break
        }
        case 'hielo-barrera': {
          const buff: StatusInstance = { type: 'debuff_resistenciaMagica', duration: STATUS_DURATION_DEFAULT, source: action.sourceId, value: SKILL_BUFF_VALUES.resistanceBuff }
          sourceSideStatuses2[source.actor.id] ??= []
          sourceSideStatuses2[source.actor.id] = [...sourceSideStatuses2[source.actor.id], buff]
          log.push({ turn: state.turn, message: `${source.actor.name} obtiene +25% resistencia mágica por ${STATUS_DURATION_DEFAULT} turnos`, type: 'buff' })
          break
        }
        case 'proteccion-muro-de-espinas': {
          const buff: StatusInstance = { type: 'thorns', duration: STATUS_DURATION_DEFAULT, source: action.sourceId, value: Math.floor(Math.abs(finalDamage) * SKILL_BUFF_VALUES.thornsMultiplier) }
          sourceSideStatuses2[source.actor.id] ??= []
          sourceSideStatuses2[source.actor.id] = [...sourceSideStatuses2[source.actor.id], buff]
          log.push({ turn: state.turn, message: `${source.actor.name} activa Espinas (refleja daño) por ${STATUS_DURATION_DEFAULT} turnos`, type: 'buff' })
          break
        }
        case 'evocador-vinculo': {
          const buff: StatusInstance = { type: 'debuff_armadura', duration: STATUS_DURATION_DEFAULT, source: action.sourceId, value: SKILL_BUFF_VALUES.armorLink }
          sourceSideStatuses2[source.actor.id] ??= []
          sourceSideStatuses2[source.actor.id] = [...sourceSideStatuses2[source.actor.id], buff]
          log.push({ turn: state.turn, message: `${source.actor.name} absorbe parte del daño recibido por ${STATUS_DURATION_DEFAULT} turnos`, type: 'buff' })
          break
        }
        case 'evocador-portal': {
          const buff: StatusInstance = { type: 'buff_esquiva', duration: STATUS_DURATION_DEFAULT, source: action.sourceId, value: SKILL_BUFF_VALUES.evasionBuff }
          sourceSideStatuses2[source.actor.id] ??= []
          sourceSideStatuses2[source.actor.id] = [...sourceSideStatuses2[source.actor.id], buff]
          log.push({ turn: state.turn, message: `${source.actor.name} gana +${SKILL_BUFF_VALUES.evasionBuff} esquiva por ${STATUS_DURATION_DEFAULT} turnos`, type: 'buff' })
          break
        }
        case 'armas-rompeguardia':
        case 'maldicion-fragilidad': {
          const debuff: StatusInstance = { type: 'debuff_armadura', duration: STATUS_DURATION_DEFAULT, source: action.sourceId, value: SKILL_DEBUFF_VALUES.armorDebuff }
          targetSideStatuses2[target.actor.id] ??= []
          targetSideStatuses2[target.actor.id] = [...targetSideStatuses2[target.actor.id], debuff]
          log.push({ turn: state.turn, message: `${targetName} pierde 30% armadura por ${STATUS_DURATION_DEFAULT} turnos`, type: 'status' })
          break
        }
        case 'maldicion-lenguas': {
          const debuff: StatusInstance = { type: 'debuff_resistenciaMagica', duration: STATUS_DURATION_DEFAULT, source: action.sourceId, value: SKILL_DEBUFF_VALUES.resistanceDebuff }
          targetSideStatuses2[target.actor.id] ??= []
          targetSideStatuses2[target.actor.id] = [...targetSideStatuses2[target.actor.id], debuff]
          log.push({ turn: state.turn, message: `${targetName} pierde 20% resistencia mágica por ${STATUS_DURATION_DEFAULT} turnos`, type: 'status' })
          break
        }
        case 'feral-rugido': {
          const buff: StatusInstance = { type: 'buff_fuerza', duration: STATUS_DURATION_DEFAULT, source: action.sourceId, value: SKILL_BUFF_VALUES.statBuff }
          sourceSideStatuses2[source.actor.id] ??= []
          sourceSideStatuses2[source.actor.id] = [...sourceSideStatuses2[source.actor.id], buff]
          log.push({ turn: state.turn, message: `${source.actor.name} obtiene +25% fuerza por ${STATUS_DURATION_DEFAULT} turnos`, type: 'buff' })
          break
        }
        case 'lunar-eclipse': {
          const buff: StatusInstance = { type: 'buff_inteligencia', duration: STATUS_DURATION_DEFAULT, source: action.sourceId, value: SKILL_BUFF_VALUES.statBuff }
          sourceSideStatuses2[source.actor.id] ??= []
          sourceSideStatuses2[source.actor.id] = [...sourceSideStatuses2[source.actor.id], buff]
          log.push({ turn: state.turn, message: `${source.actor.name} obtiene +25% inteligencia por ${STATUS_DURATION_DEFAULT} turnos`, type: 'buff' })
          break
        }
      }
    }

    const result: DamageResult = {
      amount: baseDamage,
      type: damageType,
      critical: crit,
      blocked,
      mitigated,
      statusApplied,
      finalDamage: Math.abs(finalDamage)
    }
    results.push(result)

    if (isHeal) {
      target.actor.currentHp = Math.min(target.actor.maxHp, target.actor.currentHp + Math.abs(finalDamage))
      log.push({
        turn: state.turn,
        message: `${source.actor.name} cura ${Math.abs(finalDamage)} a ${targetName}`,
        type: 'heal'
      })
      gameEventBus.emit('Heal', {
        type: 'Heal', source: action.sourceId,
        target: target.actor.id, value: Math.abs(finalDamage),
        turn: state.turn,
        extra: { damageType: 'heal' as const }
      })
    } else {
      target.actor.currentHp = Math.max(0, target.actor.currentHp - finalDamage)
      const isUlt = skill?.isUltimate === true
      const msgType: CombatLogEntry['type'] = crit ? 'critical' : isUlt ? 'critical' : 'damage'
      const ultPrefix = isUlt ? '⚡ ' : ''
      const statusSuffix = statusApplied ? ` y aplica ${statusApplied.type}` : ''
      log.push({
        turn: state.turn,
        message: crit
          ? `¡Golpe crítico! ${ultPrefix}${source.actor.name} inflige ${finalDamage} de daño${damageType === 'magical' ? ' mágico' : ' físico'} a ${targetName}${statusSuffix}`
          : `${ultPrefix}${source.actor.name} inflige ${finalDamage} de daño${damageType === 'magical' ? ' mágico' : ' físico'} a ${targetName}${statusSuffix}`,
        type: msgType
      })
      if (crit) {
        gameEventBus.emit('CriticalHit', {
          type: 'CriticalHit', source: action.sourceId,
          target: target.actor.id, value: finalDamage, turn: state.turn,
          extra: { damageType }
        })
      }
      gameEventBus.emit('Attack', {
        type: 'Attack', source: action.sourceId,
        target: target.actor.id, value: finalDamage, turn: state.turn,
        extra: { damageType }
      })

      if (skill?.isUltimate && skill.id === 'druida-tempestad-ancestral' && finalDamage > 0) {
        const healAmount = Math.floor(Math.abs(finalDamage) * 0.5)
        const caster = newState.allies.find(a => a.id === source.actor.id)
        if (caster) {
          caster.currentHp = Math.min(caster.maxHp, caster.currentHp + healAmount)
          log.push({
            turn: state.turn,
            message: `🌿 ${caster.name} recupera ${healAmount} HP gracias a la Tempestad Ancestral`,
            type: 'heal'
          })
          gameEventBus.emit('Heal', {
            type: 'Heal', source: action.sourceId,
            target: caster.id, value: healAmount, turn: state.turn,
            extra: { damageType: 'heal' as const }
          })
        }
      }
    }

    // --- Enemy affixes ---
    if (!isHeal && finalDamage > 0) {
      // Vampiric: source enemy heals 25% of damage dealt
      const sourceAsEnemy = (source.side === 'enemy' && 'abilities' in source.actor)
        ? source.actor as CombatEnemy : null
      if (sourceAsEnemy?.affixes?.includes('vampiric')) {
        const vampHeal = Math.floor(Math.abs(finalDamage) * VAMPIRIC_HEAL_MULTIPLIER)
        const healed = newState.enemies.find(e => e.id === sourceAsEnemy.id)
        if (healed) {
          healed.currentHp = Math.min(healed.maxHp, healed.currentHp + vampHeal)
          log.push({
            turn: state.turn,
            message: `${healed.name} absorbe vida y recupera ${vampHeal} HP`,
            type: 'heal'
          })
        }
      }

      // Thorns: target enemy reflects 20% of damage back to source
      const targetAsEnemy = (target.side === 'enemy' && 'abilities' in target.actor)
        ? target.actor as CombatEnemy : null
      if (targetAsEnemy?.affixes?.includes('thorns')) {
        const thornsDmg = Math.floor(Math.abs(finalDamage) * THORNS_AFFIX_MULTIPLIER)
        const attacker = findActorById(newState, action.sourceId)
        if (attacker && thornsDmg > 0) {
          attacker.actor.currentHp = Math.max(0, attacker.actor.currentHp - thornsDmg)
          log.push({
            turn: state.turn,
            message: `Las espinas de ${targetAsEnemy.name} infligen ${thornsDmg} de daño a ${getActorName(attacker.actor)}`,
            type: 'damage'
          })
          if (attacker.actor.currentHp <= 0) {
            log.push({
              turn: state.turn,
              message: `${getActorName(attacker.actor)} ha muerto`,
              type: 'death'
            })
            gameEventBus.emit('Death', { type: 'Death', target: attacker.actor.id, turn: state.turn })
          }
        }
      }
    }

    if (target.actor.currentHp <= 0) {
      log.push({
        turn: state.turn,
        message: `${targetName} ha muerto`,
        type: 'death'
      })
      gameEventBus.emit('Death', { type: 'Death', target: target.actor.id, turn: state.turn })
    }
  }

  return { results, log, newState }
}

function areAllDead(actors: { currentHp: number }[]): boolean {
  return actors.every(a => a.currentHp <= 0)
}

function emitCombatEnd(state: CombatState, result: 'victory' | 'defeat'): void {
  if (state.combatType === 'pvp') {
    const eventType = result === 'victory' ? 'ArenaVictory' : 'ArenaDefeat'
    gameEventBus.emit(eventType, { type: eventType, turn: state.turn })
  } else {
    const eventType = result === 'victory' ? 'Victory' : 'Defeat'
    gameEventBus.emit(eventType, { type: eventType, turn: state.turn })
  }
}

export function processTurn(
  state: CombatState,
  playerAction: CombatAction
): CombatState {
  let currentState = cloneCombatState(state)
  currentState.phase = 'animating'

  const playerHasSilencio = hasActiveStatus(currentState.statuses.allies, currentState.allies[0]?.id ?? '', 'silencio')

  if (playerAction.type === 'skill' && playerHasSilencio) {
    currentState.log.push({
      turn: currentState.turn,
      message: '¡Silencio! No puedes usar habilidades. Se realiza un ataque básico.',
      type: 'status'
    })
    const basicAction: CombatAction = {
      type: 'attack',
      sourceId: playerAction.sourceId,
      targetIds: playerAction.targetIds
    }
    const { log, newState: afterPlayer } = calculateDamage(basicAction, currentState, null)
    currentState = { ...afterPlayer, log: [...afterPlayer.log, ...log] }
  } else if (playerAction.type === 'item') {
    const itemType = playerAction.abilityId ?? ''
    const player = currentState.allies[0]
    if (itemType === 'pocion-vida') {
      const healAmount = HEALTH_POTION_HEAL
      const actualHeal = Math.min(healAmount, player.maxHp - player.currentHp)
      player.currentHp = Math.min(player.maxHp, player.currentHp + healAmount)
      currentState.log.push({
        turn: currentState.turn,
        message: `${player.name} usa Poción de Vida y recupera ${actualHeal} HP`,
        type: 'heal'
      })
    } else if (itemType === 'pocion-mana') {
      const manaRestore = MANA_POTION_RESTORE
      const actualRestore = Math.min(manaRestore, player.maxMana - player.currentMana)
      player.currentMana = Math.min(player.maxMana, player.currentMana + manaRestore)
      currentState.log.push({
        turn: currentState.turn,
        message: `${player.name} usa Poción de Maná y recupera ${actualRestore} maná`,
        type: 'heal'
      })
    }
  } else if (playerAction.type === 'defend') {
    const player = currentState.allies[0]
    const bonusArmor = Math.floor(player.armor * DEFEND_ARMOR_MULTIPLIER)
    player.armor = player.armor + bonusArmor
    player.magicResist = player.magicResist + Math.floor(bonusArmor * 0.5)
    currentState.log.push({
      turn: currentState.turn,
      message: `${player.name} adopta una postura defensiva (+50% armadura este turno)`,
      type: 'buff'
    })
  } else {
    const skill = playerAction.type === 'skill' ? findSkillForAction(playerAction, currentState) : null

    const { log, newState: afterPlayer } = calculateDamage(playerAction, currentState, skill)
    currentState = { ...afterPlayer, log: [...afterPlayer.log, ...log] }
  }

  const aliveEnemies = currentState.enemies.filter(e => e.currentHp > 0)
  if (aliveEnemies.length === 0) {
    currentState.phase = 'victory'
    currentState.log.push({ turn: currentState.turn, message: '¡Victoria! Todos los enemigos han sido derrotados.', type: 'system' })
    emitCombatEnd(currentState, 'victory')
    return currentState
  }

  if (areAllDead(currentState.allies)) {
    currentState.phase = 'defeat'
    currentState.log.push({ turn: currentState.turn, message: 'Derrota... Todos los aliados han caído.', type: 'system' })
    emitCombatEnd(currentState, 'defeat')
    return currentState
  }

  if (!currentState.extraTurnActive) {
    const player = currentState.allies[0]
    if (player.equipmentEffectTypes?.includes('extraTurn')) {
      if (roll(100) <= EXTRA_TURN_CHANCE) {
        currentState.extraTurnActive = true
        currentState.log.push({ turn: currentState.turn, message: '¡Turno extra!', type: 'buff' })
        return { ...currentState, phase: 'playerTurn' }
      }
    }
  } else {
    currentState.extraTurnActive = false
  }

  for (const enemy of aliveEnemies) {
    const enemyStatuses = currentState.statuses.enemies[enemy.id] ?? []
    const enemySkipped = enemyStatuses.some(
      s => s.skippedTurn && s.duration > 0
    )

    if (enemySkipped) {
      currentState.log.push({
        turn: currentState.turn,
        message: `${enemy.name} está incapacitado y pierde su turno`,
        type: 'status'
      })
      continue
    }

    const enemyHasSilencio = enemyStatuses.some(s => s.type === 'silencio' && s.duration > 0)

    currentState.enemyUltimateCharge = Math.min(100, (currentState.enemyUltimateCharge ?? 0) + 20)

    let enemyAction: CombatAction
    let enemySkill: Skill | null

    if (currentState.enemyUltimateCharge >= 100 && enemy.ultimateSkill && !enemyHasSilencio) {
      const aliveAllies = currentState.allies.filter(a => a.currentHp > 0)
      const lowest = aliveAllies.length > 0 ? aliveAllies.reduce((a, b) => a.currentHp < b.currentHp ? a : b) : currentState.allies[0]
      const targetIdx = currentState.allies.indexOf(lowest)
      enemyAction = {
        type: 'skill',
        sourceId: enemy.id,
        targetIds: [`ally_${targetIdx + 1}`],
        abilityId: enemy.ultimateSkill.id,
      }
      enemySkill = enemy.ultimateSkill
      currentState.enemyUltimateCharge = 0
      currentState.log.push({
        turn: currentState.turn,
        message: `⚡ ${enemy.name} desata ${enemy.ultimateSkill.name}!`,
        type: 'critical',
      })
    } else {
      enemyAction = applyEnemyAI(enemy, currentState)
      enemySkill = enemyAction.type === 'skill' ? findEnemyAbility(enemyAction.abilityId ?? '', enemy) : null
    }

    if (enemyHasSilencio && enemyAction.type === 'skill') {
      currentState.log.push({
        turn: currentState.turn,
        message: `¡Silencio! ${enemy.name} no puede usar habilidades. Ataca con un golpe básico.`,
        type: 'status'
      })
      enemyAction = { type: 'attack', sourceId: enemy.id, targetIds: enemyAction.targetIds }
      enemySkill = null
    }

    const { log: enemyLog, newState: afterEnemy } = calculateDamage(enemyAction, currentState, enemySkill)
    currentState = { ...afterEnemy, log: [...afterEnemy.log, ...enemyLog] }

    if (areAllDead(currentState.allies)) {
      currentState.phase = 'defeat'
      currentState.log.push({ turn: currentState.turn, message: 'Derrota... Todos los aliados han caído.', type: 'system' })
      emitCombatEnd(currentState, 'defeat')
      return currentState
    }
  }

  currentState = processStatusEffects(currentState)

  for (const ally of currentState.allies) {
    if (ally.currentHp > 0) {
      const regenMana = ally.stats.regenMana ?? DEFAULT_REGEN_MANA
      ally.currentMana = Math.min(ally.maxMana, ally.currentMana + regenMana)
    }
  }

  return { ...currentState, turn: currentState.turn + 1, phase: 'playerTurn' }
}

function findSkillForAction(action: CombatAction, _state: CombatState): Skill | null {
  if (!action.abilityId) return null
  for (const classKey of Object.keys(classAbilities) as Class[]) {
    const styles = classAbilities[classKey]
    for (const styleKey of Object.keys(styles)) {
      const skill = styles[styleKey].skills.find(s => s.id === action.abilityId)
      if (skill) return skill
    }
  }
  return null
}

function findEnemyAbility(abilityId: string, enemy: CombatEnemy): Skill | null {
  const ability = enemy.abilities.find(a => a.id === abilityId)
  if (!ability) return null
  return {
    id: ability.id,
    name: ability.name,
    effect: '',
    unlockLevel: 1,
    maxCharges: 99,
    baseDamage: ability.baseDamage,
    scalingStat: ability.scalingStat,
    scalingFactor: ability.scalingFactor,
    statusChance: ability.statusChance,
    statusType: ability.statusType,
    statusDuration: ability.statusDuration
  }
}

function processStatusEffects(state: CombatState): CombatState {
  const newState = cloneCombatState(state)

  const processActorStatuses = (
    statuses: StatusInstance[],
    actor: { currentHp: number }
  ): StatusInstance[] => {
    let hp = actor.currentHp
    const remaining: StatusInstance[] = []
    for (const status of statuses) {
      let damage = 0
      switch (status.type) {
        case 'veneno': damage = status.value ?? DEFAULT_STATUS_DAMAGE.veneno; break
        case 'sangrado': damage = status.value ?? DEFAULT_STATUS_DAMAGE.sangrado; break
        case 'quemadura': damage = status.value ?? DEFAULT_STATUS_DAMAGE.quemadura; break
        case 'congelacion':
        case 'aturdimiento':
          if (status.skippedTurn) {
            if (status.duration > 1) {
              remaining.push({
                ...status,
                duration: status.duration - 1,
                skippedTurn: true
              })
            }
          } else {
            remaining.push({
              ...status,
              skippedTurn: true
            })
          }
          continue
        case 'silencio':
        case 'ceguera':
          break
        case 'buff_fuerza':
        case 'buff_inteligencia':
        case 'buff_esquiva':
        case 'debuff_armadura':
        case 'debuff_resistenciaMagica':
        case 'thorns':
          break
      }
      if (damage > 0) {
        hp = Math.max(0, hp - damage)
      }
      if (status.duration > 1) {
        remaining.push({ ...status, duration: status.duration - 1 })
      }
    }
    actor.currentHp = hp
    return remaining
  }

  for (const allyId of Object.keys(newState.statuses.allies)) {
    const ally = newState.allies.find(a => a.id === allyId)
    if (ally) {
      newState.statuses.allies[allyId] = processActorStatuses(
        newState.statuses.allies[allyId],
        ally
      )
    }
  }

  for (const enemyId of Object.keys(newState.statuses.enemies)) {
    const enemy = newState.enemies.find(e => e.id === enemyId)
    if (enemy) {
      newState.statuses.enemies[enemyId] = processActorStatuses(
        newState.statuses.enemies[enemyId],
        enemy
      )
    }
  }

  return newState
}

export function createEnemy(
  id: string,
  name: string,
  level: number,
  stats: StatBlock,
  abilities: EnemyAbility[],
  isBoss?: boolean
): CombatEnemy {
  const fuerza = stats.fuerza ?? ENEMY_DEFAULT_FUERZA
  const vitalidad = stats.vitalidad ?? ENEMY_DEFAULT_VITALIDAD
  const hp = ENEMY_BASE_HP + vitalidad * ENEMY_HP_PER_VITALIDAD + level * ENEMY_HP_PER_LEVEL
  return {
    id, name, level, stats,
    maxHp: hp, currentHp: hp,
    maxMana: ENEMY_BASE_MANA, currentMana: ENEMY_BASE_MANA,
    abilities,
    damage: { min: ENEMY_MIN_DAMAGE_BASE + level, max: ENEMY_MAX_DAMAGE_BASE + level * ENEMY_DAMAGE_PER_LEVEL_MAX },
    armor: (stats.armadura ?? ENEMY_DEFAULT_ARMOR) + Math.floor(fuerza * ENEMY_ARMOR_STRENGTH_SCALE),
    magicResist: stats.resistenciaMagica ?? ENEMY_DEFAULT_ARMOR,
    experienceReward: ENEMY_BASE_XP + level * ENEMY_XP_PER_LEVEL,
    goldReward: ENEMY_BASE_GOLD + level * ENEMY_GOLD_PER_LEVEL,
    itemDrops: [],
    isBoss
  }
}

export function createPlayerActor(
  id: string,
  name: string,
  stats: StatBlock,
  weaponDamage: { min: number; max: number },
  level: number,
  equipmentEffectTypes?: string[],
  hpMod?: number,
  mpMod?: number
): CombatActor {
  const vitalidad = stats.vitalidad ?? PLAYER_DEFAULT_VITALIDAD
  const inteligencia = stats.inteligencia ?? PLAYER_DEFAULT_INTEL
  const hp = Math.floor((PLAYER_BASE_HP + vitalidad * PLAYER_HP_PER_VITALIDAD + level * PLAYER_HP_PER_LEVEL) * (hpMod ?? 1))
  const mana = Math.floor((PLAYER_BASE_MANA + inteligencia * PLAYER_MANA_PER_INTEL + level * PLAYER_MANA_PER_LEVEL) * (mpMod ?? 1))
  return {
    id,
    name,
    maxHp: hp,
    currentHp: hp,
    maxMana: mana,
    currentMana: mana,
    stats,
    totalStats: {},
    armor: (stats.armadura ?? PLAYER_DEFAULT_ARMOR) + Math.floor((stats.fuerza ?? PLAYER_DEFAULT_FUERZA) * PLAYER_ARMOR_FUERZA_SCALE),
    magicResist: (stats.resistenciaMagica ?? PLAYER_DEFAULT_MAGIC_RESIST) + Math.floor(inteligencia * PLAYER_MAGIC_RESIST_INTEL_SCALE),
    damage: weaponDamage,
    weaponDamage,
    equipmentEffectTypes
  }
}
