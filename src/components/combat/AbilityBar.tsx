import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Skill } from '../../types/game.types'

interface AbilityBarProps {
  abilities: { name: string; currentCharges: number; maxCharges: number }[]
  fullSkills?: Skill[]
  selectedActionIndex: number
  isAnimating: boolean
  isBattleOver: boolean
  onExecute: (index: number) => void
  onSelect?: (index: number) => void
  ultimateSkill?: Skill | null
  ultimateCharge?: number
}

interface TooltipState {
  visible: boolean
  x: number
  y: number
  skill: Skill | null
  abilityIndex: number
}

const STAT_LABELS: Record<string, string> = {
  fuerza: 'Fuerza',
  agilidad: 'Agilidad',
  inteligencia: 'Inteligencia',
  vitalidad: 'Vitalidad',
  armadura: 'Armadura',
  resistenciaMagica: 'Res. Magica',
  probCritico: 'Prob. Critico',
  'dañoCritico': 'Daño Critico',
  velocidad: 'Velocidad',
  precision: 'Precisión',
  esquiva: 'Esquiva',
  roboVida: 'Robo de Vida',
  regenMana: 'Regen. Mana',
}

function buildTooltipLines(skill: Skill, charges: { currentCharges: number; maxCharges: number }, isUltimate?: boolean): string[] {
  const lines: string[] = []
  lines.push(skill.name)
  lines.push(skill.effect)
  lines.push('')

  if (skill.baseDamage != null) {
    const parts: string[] = [`${skill.baseDamage} daño base`]
    if (skill.scalingStat && skill.scalingFactor) {
      parts.push(`${skill.scalingFactor}x ${STAT_LABELS[skill.scalingStat] ?? skill.scalingStat}`)
    }
    if (skill.weaponMultiplier && skill.weaponMultiplier > 0) {
      parts.push(`${skill.weaponMultiplier}x arma`)
    }
    lines.push(`Daño: ${parts.join(' + ')}`)
  }

  if (skill.cost != null && skill.cost > 0) {
    lines.push(`Coste: ${skill.cost} maná`)
  }

  if (skill.statusType && skill.statusChance) {
    const statusLabel = skill.statusType.charAt(0).toUpperCase() + skill.statusType.slice(1)
    lines.push(`${statusLabel} ${skill.statusChance}% (${skill.statusDuration ?? 1} turnos)`)
  }

  if (isUltimate) {
    lines.push(`Carga: ${charges.currentCharges}%`)
    if (charges.currentCharges >= 100) {
      lines.push('¡LISTO PARA USAR!')
    }
  } else {
    lines.push(`Usos: ${charges.currentCharges}/${charges.maxCharges}`)
  }

  return lines
}

export function AbilityBar({
  abilities,
  fullSkills,
  selectedActionIndex,
  isAnimating,
  isBattleOver,
  onExecute,
  onSelect,
  ultimateSkill,
  ultimateCharge = 0,
}: AbilityBarProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false, x: 0, y: 0, skill: null, abilityIndex: -1,
  })
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current)
    }
  }, [])

  const handleMouseEnter = useCallback((index: number, e: React.MouseEvent) => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current)
    const isUltSlot = ultimateSkill != null && index === abilities.length
    const skill = isUltSlot ? ultimateSkill : (fullSkills?.[index] ?? null)
    tooltipTimerRef.current = setTimeout(() => {
      setTooltip({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        skill,
        abilityIndex: index,
      })
    }, 200)
  }, [fullSkills, ultimateSkill, abilities.length])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltip(prev => prev.visible ? { ...prev, x: e.clientX, y: e.clientY } : prev)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current)
    tooltipTimerRef.current = setTimeout(() => {
      setTooltip(prev => ({ ...prev, visible: false }))
    }, 100)
  }, [])

  const handleClick = useCallback((index: number) => {
    if (onSelect) {
      onSelect(index)
    }
  }, [onSelect])

  const handleDoubleClick = useCallback((index: number) => {
    onExecute(index)
  }, [onExecute])

  const tooltipLines = tooltip.skill
    ? buildTooltipLines(
        tooltip.skill,
        tooltip.abilityIndex === abilities.length && ultimateSkill
          ? { currentCharges: ultimateCharge, maxCharges: 100 }
          : (abilities[tooltip.abilityIndex] ?? { currentCharges: 0, maxCharges: 0 }),
        tooltip.abilityIndex === abilities.length
      )
    : []

  return (
    <div ref={barRef} className="w-full sm:w-[280px] p-2 grid grid-cols-2 gap-1.5 relative bg-[#0a0a0a]">
      {abilities.map((ability, index) => {
        const isSelected = selectedActionIndex === index
        const hasCharges = ability.currentCharges > 0
        const disabled = isAnimating || isBattleOver || !hasCharges

        return (
          <motion.button
            key={index}
            onClick={() => handleClick(index)}
            onDoubleClick={() => handleDoubleClick(index)}
            onMouseEnter={(e) => handleMouseEnter(index, e)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            aria-label={`${ability.name}, ${ability.currentCharges} de ${ability.maxCharges} usos`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !disabled) onExecute(index)
            }}
            whileHover={disabled ? undefined : { scale: 1.03, borderColor: '#d4a017' }}
            whileTap={disabled ? undefined : { scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className={`
              relative flex flex-col justify-between p-2 rounded border-2 cursor-pointer select-none
              min-h-[3rem]
              ${isSelected
                ? 'border-[var(--gothic-nature-light)] bg-[#1a4a1a] text-[var(--gothic-text)]'
                : 'border-[var(--gothic-nature)] bg-[#0a0a0a] text-[#a0a090]'
              }
              ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : ''}
              focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--gothic-nature-light)]
            `}
          >
            {isSelected && (
              <span className="absolute -left-0.5 top-1/2 -translate-y-1/2 text-[var(--gothic-nature-light)] font-bold text-xs animate-pulse" aria-hidden="true">
                ▶
              </span>
            )}
            <span className="text-[10px] font-[var(--font-pixel)] tracking-wider pl-2 truncate">{ability.name}</span>
            <div className="flex justify-between items-center pl-2">
              <span className="text-[9px] text-[#6a8a3a]">
                PP {ability.currentCharges}/{ability.maxCharges}
              </span>
              {fullSkills?.[index]?.statusType && (
                <span className="text-[8px] text-[#c07040]" title={`Aplica ${fullSkills[index].statusType}`}>
                  ★
                </span>
              )}
            </div>
          </motion.button>
        )
      })}

      {ultimateSkill && (
        <motion.button
          onClick={() => handleClick(abilities.length)}
          onDoubleClick={() => handleDoubleClick(abilities.length)}
          onMouseEnter={(e) => handleMouseEnter(abilities.length, e)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          disabled={isAnimating || isBattleOver || ultimateCharge < 100}
          aria-label={`${ultimateSkill.name}, carga ${Math.floor(ultimateCharge)}%`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isAnimating && !isBattleOver && ultimateCharge >= 100) onExecute(abilities.length)
          }}
          whileHover={ultimateCharge >= 100 && !isAnimating && !isBattleOver ? { scale: 1.05, borderColor: '#d4a017' } : undefined}
          whileTap={ultimateCharge >= 100 && !isAnimating && !isBattleOver ? { scale: 0.95 } : undefined}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          className={`
            relative flex flex-col justify-between p-2 rounded border-2 cursor-pointer select-none
            min-h-[3rem] col-span-2
            ${ultimateCharge >= 100
              ? 'border-amber-500 bg-[#2a1a0a] text-amber-400 shadow-[0_0_12px_rgba(234,179,8,0.3)]'
              : ultimateCharge >= 60
                ? 'border-amber-800 bg-[#1a1208] text-amber-700'
                : 'border-[var(--gothic-border)] bg-[#0a0a0a] text-[#4a4a3a]'
            }
            ${isAnimating || isBattleOver || ultimateCharge < 100 ? 'opacity-50 grayscale cursor-not-allowed' : ''}
            focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-400
          `}
        >
          {selectedActionIndex === abilities.length && (
            <span className="absolute -left-0.5 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-xs animate-pulse" aria-hidden="true">
              ▶
            </span>
          )}
          {ultimateCharge >= 100 && (
            <motion.span
              className="absolute inset-0 rounded border-2 border-amber-400 pointer-events-none"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <span className="text-[10px] font-[var(--font-pixel)] tracking-wider pl-2 truncate">★ {ultimateSkill.name}</span>
          <div className="flex justify-between items-center pl-2">
            <span className={`text-[9px] ${ultimateCharge >= 100 ? 'text-amber-400' : 'text-amber-800'}`}>
              ULTIMATE {Math.floor(ultimateCharge)}%
            </span>
            <span className="text-[8px] text-amber-600">★</span>
          </div>
        </motion.button>
      )}

      <AnimatePresence>
        {tooltip.visible && tooltip.skill && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed z-layer-tooltip pointer-events-none"
            style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
          >
            <div className="px-3 py-2 text-xs font-[var(--font-body)] text-[var(--gothic-text)] bg-[#0c0a06] border-2 border-[var(--gothic-border)] rounded max-w-[220px] whitespace-pre-line shadow-lg shadow-black/60">
              {tooltipLines.map((line, i) => (
                <div key={i} className={
                  i === 0 ? 'font-bold text-[var(--gothic-gold-copper)] text-[11px]' :
                  i === 1 ? 'text-[#8a8a7a] italic mt-0.5' :
                  line === '' ? 'h-1' :
                  'text-[#a0a090]'
                }>
                  {line}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
