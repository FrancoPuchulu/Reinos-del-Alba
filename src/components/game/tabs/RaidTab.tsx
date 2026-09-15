import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/GameStore'
import { GothicButton } from '@/components/common/GothicButton'
import { GothicFrame } from '@/components/ui/GothicFrame'
import type { RaidBossConfig, RaidCombatState, RaidMember } from '@/types/game.types'
import { RARITY_COLORS } from '@/constants/theme'
import { RAID_BOSSES, generateRaidMembers, validateComposition } from '@/config/raids-config'
import { createRaidCombatState, processRaidTurn } from '@/engine/raidCombat'

const ROLE_COLORS: Record<string, string> = {
  tank: '#3080d0',
  healer: '#30a030',
  dps: '#c03030',
}

function RaidFrame({ member }: { member: RaidMember }) {
  const hpPct = member.maxHp > 0 ? (member.currentHp / member.maxHp) * 100 : 0
  const dead = member.currentHp <= 0
  return (
    <div className={`flex items-center gap-1 px-1 py-0.5 border text-[7px] ${dead ? 'opacity-30 grayscale' : ''}`}
      style={{ borderColor: ROLE_COLORS[member.role] + '60', backgroundColor: '#0c0a06' }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ROLE_COLORS[member.role] }} />
      <span className="truncate flex-1 text-[var(--gothic-text)]">{member.name}</span>
      <div className="w-10 h-1 bg-[#1a1210] border border-[#2a1c14] shrink-0">
        <div className="h-full transition-all" style={{ width: `${hpPct}%`, backgroundColor: hpPct > 50 ? '#30a030' : hpPct > 25 ? '#c0a030' : '#a01020' }} />
      </div>
      <span className="text-[var(--gothic-text-dim)] w-7 text-right shrink-0">{member.currentHp}</span>
    </div>
  )
}

function BossDisplay({ state, bossConfig }: { state: RaidCombatState; bossConfig: RaidBossConfig }) {
  const hpPct = state.boss.maxHp > 0 ? (state.boss.currentHp / state.boss.maxHp) * 100 : 0
  const phase = bossConfig.phases[state.boss.currentPhase] ?? bossConfig.phases[0]
  return (
    <div className="border-2 border-[#a02020] bg-[#1a0a0a] p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[#e04040] text-[11px] font-[var(--font-pixel)] tracking-wider">{state.boss.name}</span>
        <span className="text-[var(--gothic-text-dim)] text-[8px]">Nv. {state.boss.level}</span>
      </div>
      <div className="w-full h-3 bg-[#0c0a06] border border-[#4a2020] mb-1">
        <motion.div className="h-full" style={{ backgroundColor: '#a02020' }}
          animate={{ width: `${hpPct}%` }} transition={{ duration: 0.4 }} />
      </div>
      <div className="flex justify-between text-[8px]">
        <span className="text-[#e04040]">{Math.max(0, state.boss.currentHp)} / {state.boss.maxHp}</span>
        <span className="text-[var(--gothic-gold-copper)]">{phase.name}</span>
      </div>
    </div>
  )
}

function CombatLog({ log }: { log: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const recent = log.slice(-12)
  return (
    <div ref={ref} className="h-28 overflow-y-auto wow-scroll bg-[#0c0a06] border border-[#2a1c14] p-1.5 space-y-0.5">
      {recent.map((msg, i) => (
        <p key={i} className={`text-[8px] ${msg.startsWith('>>>') ? 'text-[var(--gothic-gold-copper)] font-bold' : 'text-[var(--gothic-text-dim)]'}`}>{msg}</p>
      ))}
    </div>
  )
}

function LobbyView({ onSelectBoss }: { onSelectBoss: (boss: RaidBossConfig) => void }) {
  return (
    <div className="space-y-3">
      <div className="text-center mb-2">
        <h3 className="text-[var(--gothic-gold-copper)] text-xs font-[var(--font-pixel)] tracking-wider uppercase">Bandas PvE - 25 Jugadores</h3>
        <p className="text-[var(--gothic-text-dim)] text-[9px] mt-1">Requisito: 2 Tanques / 5 Healers / 18 DPS</p>
      </div>
      {RAID_BOSSES.map(boss => (
        <div key={boss.id} className="border border-[var(--gothic-border)] bg-[#1a1210] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <span className="text-[#e04040] text-[10px] font-[var(--font-pixel)]">{boss.name}</span>
              <span className="text-[var(--gothic-text-dim)] text-[8px] ml-2">Nv. {boss.level} — {boss.phases.length} fases</span>
            </div>
            <GothicButton variant="gold" size="sm" onClick={() => onSelectBoss(boss)}>Entrar</GothicButton>
          </div>
          {/* Description */}
          <p className="text-[#a09080] text-[8px] leading-relaxed italic">{boss.description}</p>
          {/* Reward Preview */}
          <div className="border border-[var(--gothic-border)] bg-[#0c0a06]/60 p-2 rounded">
            <p className="text-[var(--gothic-gold-copper)] text-[7px] font-[var(--font-pixel)] tracking-wider uppercase text-center mb-1">Recompensas</p>
            <div className="flex items-center justify-center gap-3 text-[8px] mb-1.5">
              <span className="text-[#c0a030]">&#x1FA99; {boss.rewardPreview.gold.min.toLocaleString()}&#8211;{boss.rewardPreview.gold.max.toLocaleString()}</span>
              <span className="text-[#4080c0]">&#x2B50; {boss.rewardPreview.xp.min.toLocaleString()}&#8211;{boss.rewardPreview.xp.max.toLocaleString()}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {boss.rewardPreview.possibleLoot.map((loot, i) => (
                <span key={i} className="text-[7px] px-1.5 py-0.5 border rounded-sm"
                  style={{
                    borderColor: RARITY_COLORS[loot.rarity as keyof typeof RARITY_COLORS] + '80',
                    color: RARITY_COLORS[loot.rarity as keyof typeof RARITY_COLORS],
                  }}>
                  {loot.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function PreRaidView({ boss, onStart }: { boss: RaidBossConfig; onStart: () => void }) {
  const members = generateRaidMembers()
  const validation = validateComposition(members)
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[#e04040] text-[11px] font-[var(--font-pixel)]">{boss.name}</h3>
        <GothicButton variant="gold" size="sm" onClick={onStart} disabled={!validation.valid}>Iniciar Raid</GothicButton>
      </div>
      {/* Boss Description */}
      <div className="border border-[var(--gothic-border)] bg-[#0c0a06]/60 p-2.5 rounded">
        <p className="text-[var(--gothic-gold-copper)] text-[7px] font-[var(--font-pixel)] tracking-wider uppercase mb-1">&#x1F4DC; Amenaza</p>
        <p className="text-[#a09080] text-[8px] leading-relaxed italic">{boss.description}</p>
      </div>
      {/* Reward Preview */}
      <div className="border border-[var(--gothic-border)] bg-[#0c0a06]/60 p-2.5 rounded">
        <p className="text-[var(--gothic-gold-copper)] text-[7px] font-[var(--font-pixel)] tracking-wider uppercase text-center mb-1">&#x1F3C6; Recompensas</p>
        <div className="flex items-center justify-center gap-4 text-[9px] mb-2">
          <span className="text-[#c0a030]">&#x1FA99; {boss.rewardPreview.gold.min.toLocaleString()}&#8211;{boss.rewardPreview.gold.max.toLocaleString()}</span>
          <span className="text-[#4080c0]">&#x2B50; {boss.rewardPreview.xp.min.toLocaleString()}&#8211;{boss.rewardPreview.xp.max.toLocaleString()}</span>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {boss.rewardPreview.possibleLoot.map((loot, i) => (
            <span key={i} className="text-[8px] px-2 py-0.5 border rounded-sm"
              style={{
                borderColor: RARITY_COLORS[loot.rarity as keyof typeof RARITY_COLORS] + '80',
                color: RARITY_COLORS[loot.rarity as keyof typeof RARITY_COLORS],
              }}>
              {loot.name}
            </span>
          ))}
        </div>
      </div>
      {/* Phases info */}
      <div className="border border-[var(--gothic-border)] bg-[#0c0a06]/60 p-2.5 rounded">
        <p className="text-[var(--gothic-gold-copper)] text-[7px] font-[var(--font-pixel)] tracking-wider uppercase mb-1">&#x2694; Fases del Combate</p>
        <div className="space-y-1">
          {boss.phases.map((phase, i) => (
            <div key={i} className="flex items-start gap-2 text-[8px]">
              <span className="text-[#e04040] shrink-0">{i + 1}.</span>
              <span className="text-[#a09080] italic">{phase.description}</span>
            </div>
          ))}
        </div>
      </div>
      {validation.errors.length > 0 && (
        <div className="border border-[#a01020] bg-[#1a0a0a] p-2">
          {validation.errors.map((e, i) => <p key={i} className="text-[#a01020] text-[8px]">&#9888; {e}</p>)}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 text-[8px]">
        {(['tank', 'healer', 'dps'] as const).map(role => (
          <div key={role} className="border p-2" style={{ borderColor: ROLE_COLORS[role] + '40' }}>
            <span className="font-[var(--font-pixel)] uppercase" style={{ color: ROLE_COLORS[role] }}>{role === 'tank' ? 'Tanques' : role === 'healer' ? 'Healers' : 'DPS'}</span>
            <span className="text-[var(--gothic-text-dim)] ml-1">({members.filter(m => m.role === role).length})</span>
          </div>
        ))}
      </div>
      <div className="max-h-60 overflow-y-auto wow-scroll space-y-0.5">
        {members.map(m => <RaidFrame key={m.id} member={m} />)}
      </div>
    </div>
  )
}

function CombatView({ state, bossConfig, onAction, onEnd: _onEnd }: {
  state: RaidCombatState; bossConfig: RaidBossConfig
  onAction: (action: 'attack' | 'defend' | 'heal') => void; onEnd: () => void
}) {
  const tanks = state.members.filter(m => m.role === 'tank')
  const healers = state.members.filter(m => m.role === 'healer')
  const dps = state.members.filter(m => m.role === 'dps')

  return (
    <div className="space-y-3">
      <BossDisplay state={state} bossConfig={bossConfig} />

      {/* Raid frames by role */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        {[
          { label: 'Tanques', members: tanks, color: ROLE_COLORS.tank },
          { label: 'Healers', members: healers, color: ROLE_COLORS.healer },
          { label: 'DPS', members: dps, color: ROLE_COLORS.dps },
        ].map(group => (
          <div key={group.label}>
            <p className="text-[8px] font-[var(--font-pixel)] uppercase mb-1" style={{ color: group.color }}>{group.label} ({group.members.filter(m => m.currentHp > 0).length}/{group.members.length})</p>
            <div className="space-y-0.5 max-h-36 overflow-y-auto wow-scroll">
              {group.members.map(m => <RaidFrame key={m.id} member={m} />)}
            </div>
          </div>
        ))}
      </div>

      {/* Player actions */}
      <div className="flex gap-2 justify-center">
        <GothicButton variant="gold" size="sm" onClick={() => onAction('attack')}>Atacar</GothicButton>
        <GothicButton variant="wow" size="sm" onClick={() => onAction('defend')}>Defender</GothicButton>
        <GothicButton variant="secondary" size="sm" onClick={() => onAction('heal')}>Curar Aliado</GothicButton>
      </div>

      <div className="flex items-center justify-between text-[8px] text-[var(--gothic-text-dim)]">
        <span>Turno {state.turn}</span>
        <span>Vivos: {state.members.filter(m => m.currentHp > 0).length}/25</span>
      </div>

      <CombatLog log={state.log} />
    </div>
  )
}

export default function RaidTab() {
  const { character } = useGameStore()
  const [screen, setScreen] = useState<'lobby' | 'pre' | 'combat' | 'result'>('lobby')
  const [selectedBoss, setSelectedBoss] = useState<RaidBossConfig | null>(null)
  const [combatState, setCombatState] = useState<RaidCombatState | null>(null)

  const handleSelectBoss = useCallback((boss: RaidBossConfig) => {
    setSelectedBoss(boss)
    setScreen('pre')
  }, [])

  const handleStart = useCallback(() => {
    if (!selectedBoss) return
    const members = generateRaidMembers()
    // Insert player as first DPS
    if (character) {
      members.push({
        id: 'player',
        name: character.name,
        role: 'dps',
        maxHp: 4000,
        currentHp: 4000,
        attackPower: 600,
        healPower: 0,
        armor: 120,
        magicResist: 100,
      })
    }
    setCombatState(createRaidCombatState(selectedBoss, members))
    setScreen('combat')
  }, [selectedBoss, character])

  const handleAction = useCallback((action: 'attack' | 'defend' | 'heal') => {
    if (!combatState || !selectedBoss || combatState.phase !== 'combat') return
    const next = processRaidTurn(combatState, selectedBoss, action)
    setCombatState(next)
    if (next.phase !== 'combat') setScreen('result')
  }, [combatState, selectedBoss])

  const handleEnd = useCallback(() => {
    setScreen('lobby')
    setCombatState(null)
    setSelectedBoss(null)
  }, [])

  if (!character) return null

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <GothicFrame title="Raids PvE">
        <AnimatePresence mode="wait">
          {screen === 'lobby' && (
            <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LobbyView onSelectBoss={handleSelectBoss} />
            </motion.div>
          )}
          {screen === 'pre' && selectedBoss && (
            <motion.div key="pre" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PreRaidView boss={selectedBoss} onStart={handleStart} />
            </motion.div>
          )}
          {screen === 'combat' && combatState && selectedBoss && (
            <motion.div key="combat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CombatView state={combatState} bossConfig={selectedBoss} onAction={handleAction} onEnd={handleEnd} />
            </motion.div>
          )}
          {screen === 'result' && combatState && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6">
              <span className="text-4xl">{combatState.phase === 'victory' ? '\u{1F451}' : '\u{1F480}'}</span>
              <h3 className={`text-lg font-[var(--font-pixel)] mt-2 ${combatState.phase === 'victory' ? 'text-[var(--gothic-gold-copper)]' : 'text-[#a01020]'}`}>
                {combatState.phase === 'victory' ? 'VICTORIA DE LA BANDA' : 'DERROTA'}
              </h3>
              <p className="text-[var(--gothic-text-dim)] text-[10px] mt-1">Turnos: {combatState.turn} — Supervivientes: {combatState.members.filter(m => m.currentHp > 0).length}/25</p>
              <CombatLog log={combatState.log} />
              <div className="mt-4">
                <GothicButton variant="secondary" onClick={handleEnd}>Volver al Refugio</GothicButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </GothicFrame>
    </div>
  )
}
