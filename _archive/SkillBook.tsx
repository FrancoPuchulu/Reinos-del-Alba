import { motion } from 'framer-motion'
import { useGameStore, dispatch } from '@/store/GameStore'
import { GothicButton } from '@/components/common/GothicButton'
import { GothicFrame } from '@/components/ui/GothicFrame'
import { ULTIMATE_SKILLS } from '@/data/gameData'
import { calculateSkillDamage } from '@/engine/skills'
import { calculateTotalStats } from '@/utils/stats'
import type { Class, Skill, StatBlock } from '@/types/game.types'

const RESOURCE_COLORS: Record<string, string> = {
  'Ira': '#c03030',
  'Maná Ancestral': '#3060c0',
  'Energía Vital': '#30a030',
  'Infernalidad': '#8030b0',
}

const STATUS_LABELS: Record<string, string> = {
  sangrado: '🩸 Sangrado',
  quemadura: '🔥 Quemadura',
  veneno: '☠ Veneno',
  congelacion: '❄ Congelación',
  aturdimiento: '⚡ Aturdimiento',
  silencio: '🔇 Silencio',
  ceguera: '👁 Ceguera',
  debuff_armadura: '🛡 -Armadura',
  debuff_resistenciaMagica: '✨ -Res. Mágica',
}

const CLASS_EMOJIS: Record<Class, string> = {
  Guerrero: '⚔️',
  Mago: '🔮',
  Druida: '🌿',
  Brujo: '💀',
}

const SPECIAL_EFFECTS: Record<string, string> = {
  'guerrero-ira-del-campeon': '⚔️ Aplica Sangrado (Rend) durante 3 turnos',
  'mago-aniquilacion-arcan': '✨ Reduce Resistencia Mágica un 30% por 3 turnos',
  'druida-tempestad-ancestral': '🌿 Cura al druida por 50% del daño infligido',
  'brujo-colmillo-infernal': '💀 Drena 80% del daño como vida + Sangrado',
}

function UltimateCard({ skill, isEquipped, onToggle, characterStats, weaponDamage }: {
  skill: Skill
  isEquipped: boolean
  onToggle: () => void
  characterStats: StatBlock
  weaponDamage: { min: number; max: number }
}) {
  const resourceColor = RESOURCE_COLORS[skill.ultimateResource ?? ''] ?? '#c09040'
  const calculated = calculateSkillDamage(skill, characterStats, weaponDamage)
  const specialEffect = SPECIAL_EFFECTS[skill.id]

  return (
    <motion.div
      className={`relative border-2 rounded overflow-hidden ${
        isEquipped
          ? 'border-amber-500 shadow-[0_0_12px_rgba(234,179,8,0.3)]'
          : 'border-[var(--gothic-border)]'
      }`}
      whileHover={{ scale: 1.02, boxShadow: '0 0 16px rgba(192,144,64,0.25)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {isEquipped && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      )}

      <div className="p-4 bg-gradient-to-b from-[#1a1210] to-[#0c0a06]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-14 h-14 rounded border-2 flex items-center justify-center shrink-0"
            style={{ borderColor: resourceColor, backgroundColor: `${resourceColor}15` }}
          >
            <span className="text-2xl font-[var(--font-pixel)]" style={{ color: resourceColor }}>
              ★
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-[var(--font-pixel)] tracking-wider" style={{ color: 'var(--gothic-gold-copper)' }}>
              {skill.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-[var(--font-pixel)] tracking-wider uppercase" style={{ color: resourceColor }}>
                {skill.ultimateResource}
              </span>
              <span className="text-[9px] text-[var(--gothic-text-dim)]">•</span>
              <span className="text-[9px] text-[var(--gothic-text-dim)] uppercase tracking-wider">
                Definitiva
              </span>
            </div>
          </div>
        </div>

        {/* Effect / Description */}
        <p className="text-[11px] text-[#aaa89a] leading-relaxed mb-3">
          {skill.effect}
        </p>

        {/* Damage Formula */}
        <div className="bg-[#0a0a08] border border-[var(--gothic-border)] rounded p-2.5 mb-3">
          <div className="text-[9px] text-[#6a8a3a] uppercase mb-1.5 font-bold tracking-wider">Fórmula de Daño</div>
          <div className="text-[10px] text-[var(--gothic-text)] space-y-0.5">
            <div>Base: <span className="text-[var(--gothic-gold-copper)] font-bold">{skill.baseDamage ?? 0}</span></div>
            {skill.scalingStat && skill.scalingFactor && (
              <div>
                <span className="capitalize">{skill.scalingStat}</span> ×{skill.scalingFactor}:{' '}
                <span className="text-[var(--gothic-gold-copper)]">+{Math.floor((characterStats[skill.scalingStat] ?? 0) * skill.scalingFactor)}</span>
              </div>
            )}
            {skill.weaponMultiplier && skill.weaponMultiplier > 0 && (
              <div>
                Arma ×{skill.weaponMultiplier}:{' '}
                <span className="text-[var(--gothic-gold-copper)]">+{Math.floor(((weaponDamage.min + weaponDamage.max) / 2) * skill.weaponMultiplier)}</span>
              </div>
            )}
            <div className="border-t border-[var(--gothic-border)] pt-1 mt-1 flex justify-between">
              <span className="text-[var(--gothic-text-dim)]">Daño estimado:</span>
              <span className="text-[#c07040] font-bold">{calculated.min} — {calculated.max}</span>
            </div>
          </div>
        </div>

        {/* Status Effect */}
        {skill.statusType && skill.statusChance && (
          <div className="bg-[#0a0a08] border border-[var(--gothic-border)] rounded p-2.5 mb-3">
            <div className="text-[9px] text-[#6a8a3a] uppercase mb-1.5 font-bold tracking-wider">Efecto Secundario</div>
            <div className="text-[10px] text-[var(--gothic-text)]">
              <span className="text-[#c07040]">{STATUS_LABELS[skill.statusType] ?? skill.statusType}</span>
              {' '}— {skill.statusChance}% de prob., {skill.statusDuration ?? 1} turnos
            </div>
          </div>
        )}

        {/* Special Effect */}
        {specialEffect && (
          <div className="bg-[#0a0a08] border border-amber-800/30 rounded p-2.5 mb-3">
            <div className="text-[9px] text-amber-600 uppercase mb-1 font-bold tracking-wider">Efecto Especial</div>
            <div className="text-[10px] text-amber-400/80">{specialEffect}</div>
          </div>
        )}

        {/* Charge Mechanic Info */}
        <div className="bg-[#0a0a08] border border-[var(--gothic-border)] rounded p-2 mb-3">
          <div className="text-[9px] text-[#6a8a3a] uppercase mb-1 font-bold tracking-wider">Mecánica de Carga</div>
          <div className="text-[10px] text-[var(--gothic-text)]">
            +20% por turno • 100% en 5 turnos • Se reinicia al usar
          </div>
        </div>

        {/* Action Button */}
        <GothicButton
          variant={isEquipped ? 'blood' : 'wow-gold'}
          size="sm"
          fullWidth
          onClick={onToggle}
        >
          {isEquipped ? '✕ Desequipar Definitiva' : '★ Equipar Definitiva'}
        </GothicButton>
      </div>
    </motion.div>
  )
}

export default function SkillBook() {
  const { character } = useGameStore()

  if (!character) return null

  const ultimateSkill = ULTIMATE_SKILLS[character.class as Class]
  if (!ultimateSkill) return null

  const isEquipped = character.ultimateEquipped === ultimateSkill.id
  const totalStats = calculateTotalStats(character)
  const weaponDamage = character.equipment.armaPrincipal?.damage ?? { min: 5, max: 10 }

  const handleToggle = () => {
    if (isEquipped) {
      dispatch({ type: 'UNEQUIP_ULTIMATE' })
    } else {
      dispatch({ type: 'EQUIP_ULTIMATE', payload: ultimateSkill.id })
    }
  }

  return (
    <div className="p-4">
      <GothicFrame title="Libro de Habilidades — Definitivas">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{CLASS_EMOJIS[character.class as Class] ?? '⚔️'}</span>
              <span className="text-[var(--gothic-gold-copper)] text-xs font-[var(--font-pixel)] tracking-wider">
                Definitivas de {character.class}
              </span>
            </div>
            <p className="text-[var(--gothic-text-dim)] text-[10px] mt-1">
              Selecciona 1 habilidad definitiva para el combate. Se carga +20% por turno.
            </p>
          </div>
          <div className="text-right">
            <div className="text-[var(--gothic-gold-copper)] text-[10px] font-[var(--font-pixel)] tracking-wider">
              {isEquipped ? '1/1 Equipada' : '0/1 Equipada'}
            </div>
            <p className="text-[var(--gothic-text-dim)] text-[9px] mt-0.5">
              Recurso: {ultimateSkill.ultimateResource ?? 'Poder'}
            </p>
          </div>
        </div>

        {/* Ultimate Card */}
        <div className="max-w-lg mx-auto">
          <UltimateCard
            skill={ultimateSkill}
            isEquipped={isEquipped}
            onToggle={handleToggle}
            characterStats={totalStats}
            weaponDamage={weaponDamage}
          />
        </div>

        {/* Info */}
        <div className="mt-4 pt-3 border-t border-[var(--gothic-border-dim)]">
          <p className="text-[var(--gothic-text-dim)] text-[10px] text-center">
            La habilidad definitiva se carga durante el combate. Al alcanzar 100%, aparece como una 5ª habilidad en la barra de combate.
          </p>
          <p className="text-[var(--gothic-text-dim)] text-[10px] text-center mt-1">
            Usa la tecla <kbd className="px-1 py-0.5 bg-[#1a1210] border border-[var(--gothic-border)] rounded text-[9px] font-mono">5</kbd> para ejecutarla cuando esté lista.
          </p>
        </div>
      </GothicFrame>
    </div>
  )
}
