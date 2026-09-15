import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FloatingDamage, SpellVFX, PlayerInputData } from './types'
import { STATUS_ICONS, DAMAGE_COLORS } from './types'
import { SpellVFXOverlay } from './SpellVFXOverlay'
import type { BattleState } from '../../game/enginebridge'
import type { StatusInstance, EnemyAffix } from '../../types/combat'
import type { Skill } from '../../types/game.types'
import { UltimateChargeBar } from '../combat/UltimateChargeBar'

const HpBar = React.memo(function HpBar({ current, max, label, level, sublabel, color, shield = 0, frenzy = false }: {
  current: number
  max: number
  label: string
  level: number
  sublabel: string
  color: 'player' | 'enemy'
  shield?: number
  frenzy?: boolean
}) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100))
  const barColor = pct > 50 ? '#30a030' : pct > 25 ? '#d0a030' : '#a01020'
  const ghostColor = pct > 50 ? '#1a3010' : pct > 25 ? '#3a2a10' : '#3a0a10'
  const shieldPct = Math.max(0, Math.min(100, (shield / max) * 100))
  const shieldLeft = pct
  const [flashCount, setFlashCount] = useState(0)
  const prevCurrentRef = useRef(current)

  useEffect(() => {
    if (current < prevCurrentRef.current) {
      setFlashCount(c => c + 1)
    }
    prevCurrentRef.current = current
  }, [current])

  return (
    <div
      className="flex-1 border-2 border-[#5a4030] bg-[#080604] p-2 min-w-0"
      role="meter"
      aria-label={`${label} HP: ${current} de ${max}${shield > 0 ? `, escudo: ${shield}` : ''}`}
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-live="polite"
    >
      <div className="flex items-baseline justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-[var(--font-pixel)] tracking-wider uppercase ${color === 'enemy' ? 'text-[#d03030]' : 'text-[var(--gothic-text)]'}`}>
            {label}
          </span>
          <span className="text-[10px] text-[var(--gothic-text-dim)]">Nv.{level}</span>
        </div>
      </div>
      <div className={`relative h-3 border-2 bg-[#080604] overflow-hidden ${frenzy ? 'animate-pulse border-orange-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'border-[var(--gothic-border)]'}`}>
        <div
          className="absolute inset-y-0 left-0 transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: ghostColor }}
        />
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
          className="absolute inset-y-0 left-0"
          style={{ backgroundColor: barColor }}
        />
        {shieldPct > 0 && (
          <motion.div
            animate={{ width: `${shieldPct}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
            className="absolute inset-y-0 bg-cyan-500"
            style={{ left: `${shieldLeft}%` }}
          />
        )}
        <AnimatePresence>
          {flashCount > 0 && (
            <motion.div
              key={`bar-flash-${flashCount}`}
              initial={{ opacity: 0.45 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="absolute inset-0 bg-red-500/40 pointer-events-none"
            />
          )}
        </AnimatePresence>
        <span className="absolute inset-0 flex items-center justify-center text-[8px] text-[var(--gothic-text)] font-mono tracking-wider z-10">
          {current} / {max}{shield > 0 ? ` +${shield}` : ''}
        </span>
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-[9px] text-[var(--gothic-text-dim)] uppercase tracking-wider">{sublabel}</span>
      </div>
    </div>
  )
})

const FloatingDamageNumber = React.memo(function FloatingDamageNumber({
  damage,
  onComplete,
}: {
  damage: FloatingDamage
  onComplete: (id: number) => void
}) {
  const color = DAMAGE_COLORS[damage.kind]
  const isCrit = damage.kind === 'critical'
  const isHeal = damage.kind === 'heal'
  const prefix = isHeal ? '+' : '-'

  return (
    <motion.span
      initial={{ opacity: 1, y: 0, scale: isCrit ? 1.4 : 1 }}
      animate={{ opacity: 0, y: -40, scale: isCrit ? 1.6 : 1.15 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      onAnimationComplete={() => onComplete(damage.id)}
      className={`absolute -top-1 left-1/2 -translate-x-1/2 font-[var(--font-pixel)] pointer-events-none z-20 whitespace-nowrap ${isCrit ? 'text-sm font-bold' : 'text-xs'}`}
      style={{
        color,
        textShadow: `0 0 6px ${color}80, 0 2px 0 #0a0408`,
      }}
    >
      {prefix}{damage.amount}
    </motion.span>
  )
})

interface CombatHeaderProps {
  enemy: BattleState['enemy']
  player: BattleState['player']
  visualPlayerHp: number
  enemyShake: { count: number; intensity: 1 | 2 }
  heroShake: { count: number; intensity: 1 | 2 }
  floatingDamages: FloatingDamage[]
  removeFloatingDamage: (id: number) => void
  vfxEffects: SpellVFX[]
  removeVfx: (id: number) => void
  playerStatuses: StatusInstance[]
  enemyStatuses: StatusInstance[]
  playerEmoji: string
  enemyEmoji: string
  playerSpriteUrl?: string
  isFrenzied: boolean
  playerData: PlayerInputData
  playerUltimateCharge: number
  enemyUltimateCharge: number
  ultimateSkill: Skill | null
  enemyUltimateSkill?: Skill | null
}

function renderStatuses(statuses: StatusInstance[]) {
  if (statuses.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1" role="status" aria-label="Efectos activos">
      {statuses.filter(s => s.duration > 0).map((s, i) => (
        <span key={i} className="text-[9px] px-1 py-0.5 border border-[var(--gothic-border)] bg-[#1a1210] rounded"
          title={`${s.type} (${s.duration} turnos)`}>
          {STATUS_ICONS[s.type]} {s.duration}
        </span>
      ))}
    </div>
  )
}

export function CombatHeader({
  enemy, player, visualPlayerHp, enemyShake, heroShake,
  floatingDamages, removeFloatingDamage,
  vfxEffects, removeVfx,
  playerStatuses, enemyStatuses,
  playerEmoji, enemyEmoji, playerSpriteUrl, isFrenzied,
  playerUltimateCharge, enemyUltimateCharge, ultimateSkill, enemyUltimateSkill,
}: CombatHeaderProps) {
  const prevEnemyHpRef = useRef(enemy.currentHp)
  const [enemyFlashCount, setEnemyFlashCount] = useState(0)

  useEffect(() => {
    if (enemy.currentHp < prevEnemyHpRef.current) {
      setEnemyFlashCount(c => c + 1)
    }
    prevEnemyHpRef.current = enemy.currentHp
  }, [enemy.currentHp])

  return (
    <div className="relative flex-1 flex flex-col p-3 sm:p-5">
      {/* Enemy side */}
      <div className="flex items-start gap-3 sm:gap-4 flex-col sm:flex-row">
        <HpBar
          current={enemy.currentHp}
          max={enemy.maxHp}
          label={enemy.name}
          level={enemy.level}
          sublabel={enemy.className}
          color="enemy"
          frenzy={isFrenzied}
        />
        {enemyUltimateSkill && (
          <div className="mt-1 w-full">
            <UltimateChargeBar
              charge={enemyUltimateCharge}
              resourceLabel={enemyUltimateSkill.ultimateResource ?? 'Poder'}
              side="enemy"
              isReady={enemyUltimateCharge >= 100}
            />
          </div>
        )}
        {(enemy.affixes ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {(enemy.affixes ?? []).map((affix: EnemyAffix) => (
              <span key={affix} className={`text-[9px] font-mono border px-1.5 uppercase tracking-wider ${
                affix === 'vampiric' ? 'border-red-800 text-red-400 bg-red-950' :
                affix === 'thorns' ? 'border-gray-600 text-gray-400 bg-gray-900' :
                'border-amber-600 text-amber-400 bg-amber-950'
              }`}>
                {affix}
              </span>
            ))}
          </div>
        )}
        {renderStatuses(enemyStatuses)}
        <motion.div
          key={`enemy-${enemyShake.count}`}
          initial={{ x: 0 }}
          animate={{ x: enemyShake.count > 0 ? (enemyShake.intensity === 2 ? [0, -10, 8, -6, 4, -2, 0] : [0, -5, 4, -3, 2, -1, 0]) : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-24 h-24 flex items-center justify-center shrink-0 border-2 border-[#d03030] bg-[#0a0a0a]"
          role="img" aria-label="Enemigo"
        >
          <span className="text-4xl">{enemyEmoji}</span>
          <AnimatePresence>
            {enemyFlashCount > 0 && (
              <motion.div
                key={`enemy-flash-${enemyFlashCount}`}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute inset-0 bg-red-500/50 pointer-events-none"
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {floatingDamages.filter(fd => fd.targetSide === 'enemy').map(fd => (
              <FloatingDamageNumber key={fd.id} damage={fd} onComplete={removeFloatingDamage} />
            ))}
          </AnimatePresence>
          <AnimatePresence>
            {vfxEffects.filter(v => v.targetSide === 'enemy').map(v => (
              <SpellVFXOverlay key={v.id} vfx={v} onComplete={removeVfx} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* VS divider */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-3 opacity-40">
          <div className="w-16 h-px bg-[var(--gothic-nature)]" />
          <span className="text-[var(--gothic-nature-light)] text-[10px] font-[var(--font-pixel)] tracking-wider uppercase" aria-hidden="true">VS</span>
          <div className="w-16 h-px bg-[var(--gothic-nature)]" />
        </div>
      </div>

      {/* Player side */}
      <div className="flex items-end gap-3 sm:gap-4 flex-col-reverse sm:flex-row">
        <motion.div
          key={`hero-${heroShake.count}`}
          initial={{ x: 0 }}
          animate={{ x: heroShake.count > 0 ? (heroShake.intensity === 2 ? [0, -10, 8, -6, 4, -2, 0] : [0, -5, 4, -3, 2, -1, 0]) : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-24 h-24 flex items-center justify-center shrink-0 border-2 border-[var(--gothic-nature-dark)] bg-[#0a0a0a]"
          role="img" aria-label="Jugador"
        >
          {playerSpriteUrl ? (
            <img src={playerSpriteUrl} alt="Jugador" className="w-full h-full object-contain" />
          ) : (
            <span className="text-4xl">{playerEmoji}</span>
          )}
          <AnimatePresence>
            {heroShake.count > 0 && (
              <motion.div
                key={`hero-flash-${heroShake.count}`}
                initial={{ opacity: 0.45 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute inset-0 bg-red-500/45 pointer-events-none"
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {floatingDamages.filter(fd => fd.targetSide === 'player').map(fd => (
              <FloatingDamageNumber key={fd.id} damage={fd} onComplete={removeFloatingDamage} />
            ))}
          </AnimatePresence>
          <AnimatePresence>
            {vfxEffects.filter(v => v.targetSide === 'player').map(v => (
              <SpellVFXOverlay key={v.id} vfx={v} onComplete={removeVfx} />
            ))}
          </AnimatePresence>
        </motion.div>
        <div className="flex-1 min-w-0">
          <HpBar
            current={visualPlayerHp}
            max={player.maxHp}
            label={player.name}
            level={player.level}
            sublabel={player.className}
            color="player"
          />
          {ultimateSkill && (
            <div className="mt-1 w-full">
              <UltimateChargeBar
                charge={playerUltimateCharge}
                resourceLabel={ultimateSkill.ultimateResource ?? 'Poder'}
                side="player"
                isReady={playerUltimateCharge >= 100}
              />
            </div>
          )}
          {renderStatuses(playerStatuses)}
        </div>
      </div>
    </div>
  )
}
