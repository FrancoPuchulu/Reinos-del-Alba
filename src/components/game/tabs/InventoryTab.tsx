import { useState } from 'react'
import { useGameStore, dispatch } from '@/store/GameStore'
import { GothicButton } from '@/components/common/GothicButton'
import { GothicFrame } from '@/components/ui/GothicFrame'
import { InventorySlot } from '@/components/common/InventorySlot'
import { classAbilities, ULTIMATE_SKILLS } from '@/data/gameData'
import type { Skill, Class } from '@/types/game'
import type { InventoryItem } from '@/types/game.types'
import { PaperDoll, WeaponPaperDoll, CharacterStats, ExperienceBar } from './shared'
import { LoadoutSelector } from './LoadoutSelector'

function SkillBook() {
  const { character } = useGameStore()
  const [selectedStyle, setSelectedStyle] = useState(character?.skills.activeStyle ?? '')

  const styles = character ? classAbilities[character.class] : null
  const styleKeys = styles ? Object.keys(styles) : []

  const effectiveStyle = (styleKeys.length > 0 && styleKeys.includes(selectedStyle))
    ? selectedStyle
    : (styleKeys[0] ?? '')

  if (!character || !styles) return null

  const style = styles[effectiveStyle]

  const equipped = character.skills.equipped
  const maxSlots = 4

  const handleToggleSkill = (skillId: string) => {
    if (character.level < (style.skills.find(s => s.id === skillId)?.unlockLevel ?? 999)) return
    const newEquipped = equipped.includes(skillId)
      ? equipped.filter(id => id !== skillId)
      : equipped.length < maxSlots
        ? [...equipped, skillId]
        : equipped
    dispatch({ type: 'UPDATE_CHARACTER', payload: { skills: { ...character.skills, equipped: newEquipped } } })
  }

  const allStyleSkills = Object.values(styles).flatMap(s => s.skills)
  const equippedSkills = equipped.map(id => allStyleSkills.find(s => s.id === id)).filter(Boolean)

  return (
    <div className="w-full">
      <div className="text-center mb-3 pb-2 border-b-2 border-[var(--gothic-border)]">
        <h3 className="text-[var(--gothic-gold-copper)] text-[11px] uppercase tracking-wider font-[var(--font-pixel)]" style={{ textShadow: '0 0 6px rgba(192,144,64,0.3)' }}>
          &#9733; Libro de Habilidades &#9733;
        </h3>
        <p className="text-[var(--gothic-text-dim)] text-[9px] mt-0.5">{style.summary}</p>
      </div>

      <div className="flex gap-1 mb-3">
        {styleKeys.map(key => (
          <GothicButton
            key={key}
            onClick={() => setSelectedStyle(key)}
            variant={effectiveStyle === key ? 'wow-gold' : 'wow'}
            size="sm"
            className="flex-1"
          >
            {styles[key].name}
          </GothicButton>
        ))}
      </div>

      <p className="text-[var(--gothic-text-dim)] text-[8px] font-[var(--font-pixel)] tracking-wider uppercase mb-1.5 text-center">
        Habilidades Activas ({equipped.length}/{maxSlots})
      </p>
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {Array.from({ length: maxSlots }).map((_, i) => {
          const skill = equippedSkills[i]
          return (
            <div
              key={i}
              className={`group relative flex flex-col items-center justify-center h-[58px] border-2 transition-all ${
                skill
                  ? 'border-[var(--gothic-gold-copper)] bg-[#201810] shadow-[0_0_8px_rgba(192,144,64,0.25)]'
                  : 'border-dashed border-[var(--gothic-border)] bg-[#0c0a06]/60'
              }`}
              onClick={() => skill && handleToggleSkill(skill.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' && skill) handleToggleSkill(skill.id) }}
            >
              {skill ? (
                <>
                  <span className="text-[8px] text-[var(--gothic-gold-copper)] font-[var(--font-pixel)] text-center leading-tight px-0.5">
                    {skill.name}
                  </span>
                  <span className="text-[7px] text-[var(--gothic-text-dim)] mt-0.5">
                    {character.skills.charges[skill.id] ?? skill.maxCharges}/{skill.maxCharges}
                  </span>
                  <span className="absolute top-0 right-0.5 text-[8px] text-[#a01020] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    &#10005;
                  </span>
                </>
              ) : (
                <span className="text-lg text-[var(--gothic-border)]">+</span>
              )}
            </div>
          )
        })}
      </div>

      {/* 5th slot: Habilidad Definitiva */}
      {(() => {
        const ultimateSkill = character.class ? ULTIMATE_SKILLS[character.class as Class] : undefined
        if (!ultimateSkill) return null
        const isEquipped = character.ultimateEquipped === ultimateSkill.id
        const RESOURCE_COLORS: Record<string, string> = {
          'Ira': '#c03030',
          'Maná Ancestral': '#3060c0',
          'Energía Vital': '#30a030',
          'Infernalidad': '#8030b0',
        }
        const resourceColor = RESOURCE_COLORS[ultimateSkill.ultimateResource ?? ''] ?? '#c09040'
        return (
          <div className="mb-3">
            <p className="text-[8px] font-[var(--font-pixel)] tracking-wider uppercase mb-1 text-center"
              style={{ color: resourceColor }}>
              &#9733; Habilidad Definitiva &#9733;
            </p>
            <div
              className={`relative flex flex-col items-center justify-center h-[64px] border-2 transition-all cursor-pointer ${
                isEquipped
                  ? 'border-amber-500 bg-[#2a1a0a] shadow-[0_0_12px_rgba(234,179,8,0.3)]'
                  : 'border-amber-800/50 bg-[#1a150a] border-dashed'
              }`}
              onClick={() => {
                if (isEquipped) {
                  dispatch({ type: 'UNEQUIP_ULTIMATE' })
                } else {
                  dispatch({ type: 'EQUIP_ULTIMATE', payload: ultimateSkill.id })
                }
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (isEquipped) dispatch({ type: 'UNEQUIP_ULTIMATE' })
                  else dispatch({ type: 'EQUIP_ULTIMATE', payload: ultimateSkill.id })
                }
              }}
            >
              {isEquipped && (
                <span className="absolute -top-px -right-px w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center text-[7px] text-[#1a1210] font-bold leading-none z-10">&#10003;</span>
              )}
              <span className="text-[8px] text-amber-500 font-[var(--font-pixel)] text-center leading-tight px-0.5">
                &#9733; {ultimateSkill.name}
              </span>
              <span className="text-[7px] mt-0.5" style={{ color: resourceColor }}>
                {ultimateSkill.ultimateResource ?? 'Poder'}
              </span>
              <span className="text-[7px] text-amber-700 mt-0.5">
                {isEquipped ? 'Equipada' : 'Toque para equipar'}
              </span>
            </div>
          </div>
        )
      })()}

      <p className="text-[var(--gothic-text-dim)] text-[8px] font-[var(--font-pixel)] tracking-wider uppercase mb-1.5">
        Habilidades Disponibles
      </p>
      <div className="space-y-0.5 max-h-[180px] overflow-y-auto wow-scroll pr-1">
        {style.skills.map((skill: Skill) => {
          const isEquipped = equipped.includes(skill.id)
          const isLocked = character.level < skill.unlockLevel
          return (
            <div
              key={skill.id}
              className={`flex items-center justify-between px-2 py-1.5 border-2 text-[10px] transition-all ${
                isLocked
                  ? 'border-[#2a1c14] bg-[#1a1210] opacity-50'
                  : isEquipped
                    ? 'border-[var(--gothic-gold-copper)] bg-[#201810] cursor-pointer hover:border-[#a01020]'
                    : 'border-[var(--gothic-border)] bg-[#1a1210] cursor-pointer hover:border-[var(--gothic-gold-copper)]'
              }`}
              onClick={() => handleToggleSkill(skill.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') handleToggleSkill(skill.id) }}
            >
              <div className="flex-1 min-w-0">
                <span className={`${isLocked ? 'text-[var(--gothic-text-dim)]' : 'text-[var(--gothic-gold-copper)]'}`}>
                  {skill.name}
                </span>
                <span className="text-[var(--gothic-text-dim)] ml-2 text-[8px]">{skill.effect}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {isLocked ? (
                  <span className="text-[var(--gothic-text-dim)] text-[8px]">Nv.{skill.unlockLevel}</span>
                ) : isEquipped ? (
                  <span className="text-[#a01020] text-[8px]">Quitar</span>
                ) : (
                  <span className="text-[var(--gothic-gold-copper)] text-[8px]">Equipar</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AlijoPanel() {
  const { character } = useGameStore()
  if (!character) return null

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-[var(--gothic-text-dim)] text-[9px] font-[var(--font-pixel)] tracking-wider uppercase">
          Alijo <span className="text-[var(--gothic-gold)]">({character.stash.length}/48)</span>
        </h4>
        <span className="text-[9px] font-[var(--font-pixel)]">
          <span className="text-[var(--gothic-gold)]">&#9679;</span>{' '}
          <span className="text-[var(--gothic-text)]">{character.wallet.gold}</span>{' '}
          <span className="text-[var(--gothic-text-dim)]">Oro</span>
        </span>
      </div>
      <div className="grid grid-cols-8 gap-1 p-2 border-2 border-[var(--gothic-border)] bg-[#1a1210]">
        {Array.from({ length: 48 }).map((_, slotIndex) => {
          const item = character.stash[slotIndex] as InventoryItem | undefined
          return (
            <div
              key={slotIndex}
              className={item != null ? '' : 'border-dashed opacity-40'}
            >
              <InventorySlot item={item ?? null} size="sm" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function InventoryTab() {
  const { character } = useGameStore()
  if (!character) return null

  return (
    <div className="h-full w-full overflow-y-auto wow-scroll p-5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center pb-2 border-b border-[var(--gothic-border)]">
          <h2 className="text-[var(--gothic-gold-copper)] font-[var(--font-pixel)] text-sm tracking-wider uppercase">
            {character.name}
          </h2>
          <p className="text-[var(--gothic-text-dim)] text-[10px] mt-0.5">
            Nivel {character.level} {character.race} {character.class}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full items-start mt-4">

          {/* Column 1: PaperDoll + Stats + Loadouts */}
          <GothicFrame title="Equipamiento" className="flex flex-col items-center gap-3">
            <PaperDoll />
            <WeaponPaperDoll />
            <ExperienceBar />
            <div className="w-full border-t border-[var(--gothic-border-dim)] pt-3 mt-1">
              <CharacterStats />
            </div>
            <div className="w-full border-t border-[var(--gothic-border-dim)] pt-3 mt-1">
              <LoadoutSelector />
            </div>
          </GothicFrame>

          {/* Column 2: SkillBook */}
          <div className="p-4 border-2 border-[var(--wow-border)] bg-[var(--wow-bg-panel)]">
            <SkillBook />
            <div className="mt-4 pt-3 border-t border-[var(--wow-border)]">
              <button
                onClick={() => dispatch({ type: 'LOGOUT' })}
                aria-label="Cerrar sesion"
                className="w-full py-1.5 text-center text-[9px] tracking-widest uppercase border-2 border-[var(--gothic-border)] bg-[#1a1210] text-[var(--gothic-text-dim)] hover:text-[#a01020] hover:border-[#a01020] transition-all cursor-pointer font-[var(--font-pixel)]"
              >
                Cerrar Sesion
              </button>
            </div>
          </div>

          {/* Column 3: Alijo */}
          <GothicFrame title="Alijo" className="w-full">
            <AlijoPanel />
          </GothicFrame>
        </div>
      </div>
    </div>
  )
}
