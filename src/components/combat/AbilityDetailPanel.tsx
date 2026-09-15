import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Skill, StatBlock } from '../../types/game.types'
import { calculateSkillDamage } from '../../engine/skills'

interface AbilityDetailPanelProps {
  skill: Skill | null
  charges: { currentCharges: number; maxCharges: number } | null
  playerStats: StatBlock
  weaponDamage: { min: number; max: number }
  isAnimating: boolean
  isBattleOver: boolean
  onExecute: (skillIndex: number) => void
  skillIndex: number
}

const STAT_LABELS: Record<string, string> = {
  fuerza: 'Fuerza',
  agilidad: 'Agilidad',
  inteligencia: 'Inteligencia',
  vitalidad: 'Vitalidad',
  armadura: 'Armadura',
  resistenciaMagica: 'Res. Mágica',
  probCritico: 'Prob. Crítico',
  'dañoCritico': 'Daño Crítico',
  velocidad: 'Velocidad',
  precision: 'Precisión',
  esquiva: 'Esquiva',
  roboVida: 'Robo de Vida',
  regenMana: 'Regen. Maná',
}

export function AbilityDetailPanel({
  skill,
  charges,
  playerStats,
  weaponDamage,
  isAnimating,
  isBattleOver,
  onExecute,
  skillIndex,
}: AbilityDetailPanelProps) {
  const calc = useMemo(() => {
    if (!skill) return null
    return calculateSkillDamage(skill, playerStats, weaponDamage)
  }, [skill, playerStats, weaponDamage])

  const canExecute = skill && charges && charges.currentCharges > 0 && !isAnimating && !isBattleOver
  const isDisabled = !canExecute

  return (
    <AnimatePresence mode="wait">
      {skill ? (
        <motion.div
          key={skill.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.15 }}
          className="w-full sm:w-[260px] p-3 bg-[#0c0a06] border-l-2 border-[var(--gothic-nature)] flex flex-col gap-2 overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-2 pb-2 border-b border-[var(--gothic-border)]">
            <div className="w-10 h-10 rounded border-2 border-[var(--gothic-nature)] bg-[#1a1a0a] flex items-center justify-center shrink-0">
              <span className="text-lg font-[var(--font-pixel)] text-[var(--gothic-nature-light)]">
                {skill.name.charAt(0)}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-[var(--font-pixel)] text-[var(--gothic-text)] tracking-wider truncate">
                {skill.name}
              </h3>
              <span className="text-[9px] text-[#6a8a3a] uppercase">
                Habilidad de combate
              </span>
            </div>
          </div>

          {/* Effect / Lore */}
          <div className="text-[11px] text-[#8a8a7a] italic leading-tight px-1">
            "{skill.effect}"
          </div>

          {/* Stats row */}
          <div className="flex gap-3 text-[10px] text-[var(--gothic-text-dim)]">
            {charges && (
              <span>Cargas: <span className={charges.currentCharges > 0 ? 'text-[#30a030]' : 'text-[#a01020]'}>{charges.currentCharges}/{charges.maxCharges}</span></span>
            )}
            {skill.cost != null && skill.cost > 0 && (
              <span>Maná: <span className="text-[#3060c0]">{skill.cost}</span></span>
            )}
          </div>

          {/* Damage breakdown */}
          {calc && (
            <div className="bg-[#0a0a08] border border-[var(--gothic-border)] rounded p-2">
              <div className="text-[9px] text-[#6a8a3a] uppercase mb-1 font-bold">Fórmula de Daño</div>
              <div className="text-[10px] text-[var(--gothic-text)] space-y-0.5">
                <div>Base: <span className="text-[var(--gothic-gold-copper)]">{skill.baseDamage ?? 0}</span></div>
                {skill.scalingStat && skill.scalingFactor && (
                  <div>
                    {STAT_LABELS[skill.scalingStat] ?? skill.scalingStat} ×{skill.scalingFactor}:{' '}
                    <span className="text-[var(--gothic-gold-copper)]">+{Math.floor((playerStats[skill.scalingStat as keyof StatBlock] ?? 0) * skill.scalingFactor)}</span>
                  </div>
                )}
                {skill.weaponMultiplier && skill.weaponMultiplier > 0 && (
                  <div>
                    Arma ×{skill.weaponMultiplier}:{' '}
                    <span className="text-[var(--gothic-gold-copper)]">+{Math.floor(((weaponDamage.min + weaponDamage.max) / 2) * skill.weaponMultiplier)}</span>
                  </div>
                )}
                <div className="pt-1 mt-1 border-t border-[var(--gothic-border)] font-bold">
                  Total: <span className="text-[var(--gothic-nature-light)]">{calc.min}–{calc.max}</span>
                  <span className="text-[#6a8a3a] ml-1">(prom: {calc.average})</span>
                </div>
              </div>
            </div>
          )}

          {/* Status effect info */}
          {skill.statusType && skill.statusChance && (
            <div className="bg-[#0a0a08] border border-[var(--gothic-border)] rounded p-2">
              <div className="text-[9px] text-[#6a8a3a] uppercase mb-1 font-bold">Efecto de Estado</div>
              <div className="text-[10px] text-[var(--gothic-text)]">
                <span className="text-[#c07040] capitalize">{skill.statusType}</span>
                {' '}— {skill.statusChance}% de probabilidad, {skill.statusDuration ?? 1} turnos
              </div>
            </div>
          )}

          {/* Execute button */}
          <motion.button
            onClick={() => {
              if (canExecute) onExecute(skillIndex)
            }}
            disabled={isDisabled}
            whileHover={isDisabled ? undefined : { scale: 1.02, borderColor: '#d4a017' }}
            whileTap={isDisabled ? undefined : { scale: 0.97 }}
            className={`
              mt-auto py-2 px-3 text-[11px] font-[var(--font-pixel)] tracking-widest uppercase
              border-2 rounded transition-colors
              ${isDisabled
                ? 'border-[#2a2a1a] bg-[#0a0a08] text-[#4a4a2a] cursor-not-allowed opacity-50'
                : 'border-[var(--gothic-nature)] bg-[#0a1a0a] text-[var(--gothic-nature-light)] hover:bg-[#1a2a1a] cursor-pointer'
              }
            `}
          >
            ⚔ Ejecutar Habilidad
          </motion.button>

          {isDisabled && charges && charges.currentCharges <= 0 && (
            <div className="text-[9px] text-[#a01020] text-center -mt-1">
              Sin cargas disponibles
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full sm:w-[260px] p-3 bg-[#0c0a06] border-l-2 border-[var(--gothic-nature)] flex items-center justify-center"
        >
          <div className="text-center text-[10px] text-[#4a4a3a]">
            <div className="text-lg mb-1 opacity-30">🔍</div>
            <div>Selecciona una habilidad</div>
            <div className="mt-1 text-[9px]">Clic izquierdo para inspeccionar</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
