import type { RaidBossConfig, RaidCombatState, RaidMember, RaidPhase } from '../types/game.types'

export function createRaidCombatState(bossConfig: RaidBossConfig, members: RaidMember[]): RaidCombatState {
  return {
    boss: {
      name: bossConfig.name,
      level: bossConfig.level,
      maxHp: bossConfig.maxHp,
      currentHp: bossConfig.maxHp,
      damage: bossConfig.damage,
      armor: bossConfig.armor,
      magicResist: bossConfig.magicResist,
      currentPhase: 0,
    },
    members: members.map(m => ({ ...m })),
    turn: 1,
    log: [],
    phase: 'combat',
  }
}

function getCurrentPhase(state: RaidCombatState, bossConfig: RaidBossConfig): RaidPhase {
  const hpPct = state.boss.currentHp / state.boss.maxHp
  for (let i = bossConfig.phases.length - 1; i >= 0; i--) {
    if (hpPct <= bossConfig.phases[i].hpThreshold || i === 0) {
      return bossConfig.phases[i]
    }
  }
  return bossConfig.phases[bossConfig.phases.length - 1]
}

function getPhaseIndex(state: RaidCombatState, bossConfig: RaidBossConfig): number {
  const hpPct = state.boss.currentHp / state.boss.maxHp
  for (let i = bossConfig.phases.length - 1; i >= 0; i--) {
    if (hpPct <= bossConfig.phases[i].hpThreshold || i === 0) return i
  }
  return bossConfig.phases.length - 1
}

function clampHp(member: RaidMember): void {
  member.currentHp = Math.max(0, Math.min(member.maxHp, member.currentHp))
}

export function processRaidTurn(
  state: RaidCombatState,
  bossConfig: RaidBossConfig,
  playerAction: 'attack' | 'defend' | 'heal'
): RaidCombatState {
  const next = {
    ...state,
    boss: { ...state.boss },
    members: state.members.map(m => ({ ...m })),
    log: [...state.log],
  }

  const phase = getCurrentPhase(next, bossConfig)
  const newPhaseIdx = getPhaseIndex(next, bossConfig)
  if (newPhaseIdx !== next.boss.currentPhase) {
    next.boss.currentPhase = newPhaseIdx
    next.log.push(`>>> FASE ${newPhaseIdx + 1}: ${phase.name} - ${phase.description}`)
  }

  // ── Player action ──
  if (playerAction === 'attack') {
    const dmg = 500 + Math.floor(Math.random() * 300)
    const mitigated = Math.min(dmg, Math.floor(dmg * (next.boss.armor / (next.boss.armor + 200))))
    const final = Math.max(1, dmg - mitigated)
    next.boss.currentHp = Math.max(0, next.boss.currentHp - final)
    next.log.push(`Tu ataque inflige ${final} de dano al jefe.`)
  } else if (playerAction === 'defend') {
    next.log.push('Te defiendes, reduciendo el dano recibido este turno.')
  } else {
    const healTarget: RaidMember | undefined = next.members
      .filter(m => m.currentHp > 0 && m.currentHp < m.maxHp)
      .sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp))
      .at(0)
    if (healTarget) {
      const heal = 600
      healTarget.currentHp = Math.min(healTarget.maxHp, healTarget.currentHp + heal)
      next.log.push(`Curas a ${healTarget.name} (+${heal} HP).`)
    } else {
      next.log.push('No hay aliados heridos que curar.')
    }
  }

  // ── Check boss defeat ──
  if (next.boss.currentHp <= 0) {
    next.phase = 'victory'
    next.log.push('¡El jefe ha sido derrotado! Victoria de la banda.')
    return next
  }

  // ── AI Allies by role ──
  const alive = next.members.filter(m => m.currentHp > 0)

  // Tanks: taunt (boss focuses tanks, tanks take reduced damage)
  const tanks = alive.filter(m => m.role === 'tank')
  for (const _tank of tanks) {
    const dmg = 300 + Math.floor(Math.random() * 200)
    next.boss.currentHp = Math.max(0, next.boss.currentHp - dmg)
  }

  // Healers: heal lowest HP members
  const healers = alive.filter(m => m.role === 'healer')
  const wounded = alive
    .filter(m => m.currentHp < m.maxHp)
    .sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp))
  for (const healer of healers) {
    const target = wounded.at(0)
    if (target) {
      const heal = healer.healPower + Math.floor(Math.random() * 100)
      target.currentHp = Math.min(target.maxHp, target.currentHp + heal)
    }
  }

  // DPS: deal damage
  const dps = alive.filter(m => m.role === 'dps')
  let totalDpsDmg = 0
  for (const d of dps) {
    const dmg = d.attackPower + Math.floor(Math.random() * 150)
    totalDpsDmg += dmg
  }
  next.boss.currentHp = Math.max(0, next.boss.currentHp - totalDpsDmg)

  const alliesTotalDmg = tanks.reduce((s, _t) => s + 300, 0) + totalDpsDmg
  next.log.push(`La banda inflige ${alliesTotalDmg} de dano total.`)

  // ── Check boss defeat after allies ──
  if (next.boss.currentHp <= 0) {
    next.phase = 'victory'
    next.log.push('¡El jefe ha sido derrotado! Victoria de la banda.')
    return next
  }

  // ── Boss action ──
  const bossDmg = phase.bossDamage + Math.floor(Math.random() * 400)
  if (phase.bossDamageType === 'aoe') {
    next.log.push(`El jefe usa ${phase.bossAbility}! Golpea a toda la banda por ~${bossDmg}.`)
    for (const m of next.members) {
      if (m.currentHp <= 0) continue
      const mitigated = Math.floor(bossDmg * (m.armor / (m.armor + 300)))
      const final = Math.max(1, bossDmg - mitigated)
      m.currentHp -= final
      clampHp(m)
    }
  } else if (phase.bossDamageType === 'physical') {
    const target = tanks.length > 0 ? tanks.at(Math.floor(Math.random() * tanks.length)) : alive.at(Math.floor(Math.random() * alive.length))
    if (target) {
      const mitigated = Math.floor(bossDmg * (target.armor / (target.armor + 300)))
      const final = Math.max(1, bossDmg - mitigated)
      target.currentHp -= final
      clampHp(target)
      next.log.push(`${phase.bossAbility} golpea a ${target.name} por ${final}.`)
    }
  } else {
    const target = alive.at(Math.floor(Math.random() * alive.length))
    if (target) {
      const mitigated = Math.floor(bossDmg * (target.magicResist / (target.magicResist + 300)))
      const final = Math.max(1, bossDmg - mitigated)
      target.currentHp -= final
      clampHp(target)
      next.log.push(`${phase.bossAbility} golpea a ${target.name} por ${final}.`)
    }
  }

  // ── Check defeat ──
  const aliveCount = next.members.filter(m => m.currentHp > 0).length
  if (aliveCount === 0) {
    next.phase = 'defeat'
    next.log.push('Todos los miembros de la banda han caído. Derrota.')
  }

  next.turn++
  return next
}
