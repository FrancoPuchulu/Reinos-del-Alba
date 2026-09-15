import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, dispatch } from '@/store/GameStore'
import { classAbilities, ULTIMATE_SKILLS } from '@/data/gameData'
import { getCharacterSpritePair } from '@/data/sprites'
import type { EquipmentSlot } from '@/types/items'
import type { Class, ItemDefinition } from '@/types/game.types'
import { calculateTotalStats } from '@/utils/stats'
import { RARITY_COLORS } from '@/constants/theme'

const RARITY_LABELS: Record<string, string> = {
  normal: 'Comun',
  magico: 'Magico',
  epico: 'Epico',
  unico: 'Unico',
}

const SLOT_LABELS: Record<string, string> = {
  armaPrincipal: 'Arma Principal',
  armaSecundaria: 'Arma Secundaria',
  armaDistancia: 'Arma Distancia',
  armadura: 'Armadura',
  casco: 'Casco',
  hombros: 'Hombros',
  pantalones: 'Pantalones',
  guantes: 'Guantes',
  botas: 'Botas',
  amuleto: 'Amuleto',
  anillo: 'Anillo',
}

const STAT_LABELS: Record<string, string> = {
  fuerza: 'FUE',
  inteligencia: 'INT',
  agilidad: 'AGI',
  vitalidad: 'VIT',
  armadura: 'Armadura',
  resistenciaMagica: 'Res. Magica',
  probCritico: 'Prob. Critico',
  'dañoCritico': 'Daño Critico',
  velocidad: 'Velocidad',
  precision: 'Precision',
  esquiva: 'Esquiva',
  roboVida: 'Robo Vida',
  regenMana: 'Regen Mana',
}

function ItemTooltip({ item }: { item: ItemDefinition }) {
  const rarityColor = RARITY_COLORS[item.rarity] ?? 'var(--gothic-border)'
  const dur = item.durability
  const maxDur = item.maxDurability
  const isBroken = dur != null && dur === 0
  const hasStats = item.stats && Object.values(item.stats).some(v => v)

  return (
    <div
      className="border-2 rounded-none p-2.5 w-56"
      style={{
        backgroundColor: '#0c0a06',
        borderColor: rarityColor,
        boxShadow: `0 0 8px rgba(0,0,0,0.8), 0 0 12px ${rarityColor}25`,
      }}
    >
      <div className="pb-1.5 mb-1.5" style={{ borderBottom: `1px solid ${rarityColor}40` }}>
        <h4 className="text-xs font-[var(--font-pixel)]" style={{ color: rarityColor }}>
          {item.name}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[8px] text-[var(--gothic-text-dim)] uppercase">
            {SLOT_LABELS[item.slot] ?? item.slot}
          </span>
          <span className="text-[8px] uppercase" style={{ color: rarityColor }}>
            {RARITY_LABELS[item.rarity] ?? item.rarity}
          </span>
          {dur != null && maxDur != null && (
            <span className={`text-[8px] font-mono ${isBroken ? 'text-[#a01020]' : 'text-[var(--gothic-text-dim)]'}`}>
              Dur {dur}/{maxDur}
            </span>
          )}
        </div>
        {item.levelRequired != null && item.levelRequired > 0 && (
          <p className="text-[8px] text-[var(--gothic-text-dim)] mt-0.5">
            Req. Nivel {item.levelRequired}
          </p>
        )}
      </div>

      {hasStats && (
        <div className="space-y-0.5">
          {Object.entries(item.stats).map(([statName, value]) => {
            if (!value) return null
            const isPositive = value > 0
            return (
              <p key={statName} className={`text-[10px] font-mono ${isPositive ? 'text-[#30a030]' : 'text-[#a01020]'}`}>
                {isPositive ? '+' : ''}{value} {STAT_LABELS[statName] ?? statName.toUpperCase()}
              </p>
            )
          })}
        </div>
      )}

      {item.damage && (
        <p className="text-[10px] font-mono text-[var(--gothic-gold-copper)] mt-0.5">
          Daño: {item.damage.min} - {item.damage.max}
        </p>
      )}

      {item.effects && item.effects.length > 0 && (
        <div className="mt-1 pt-1 space-y-0.5" style={{ borderTop: `1px solid ${rarityColor}40` }}>
          {item.effects.map((fx, i) => (
            <p key={i} className="text-[9px] font-mono text-[#c0a030]">
              &#9733; {fx.type}{fx.value != null ? ` (${fx.value})` : ''}
            </p>
          ))}
        </div>
      )}

      {item.description && (
        <p className="mt-1.5 pt-1.5 text-[9px] text-[var(--gothic-text-dim)] leading-tight italic" style={{ borderTop: `1px solid ${rarityColor}40` }}>
          &quot;{item.description}&quot;
        </p>
      )}

      {item.price != null && item.price > 0 && (
        <p className="mt-1 text-[8px] text-[var(--gothic-text-dim)]">
          Valor: <span className="text-[var(--gothic-gold-copper)]">{item.price}</span> oro
        </p>
      )}
    </div>
  )
}

function getSlotIcon(slot: EquipmentSlot): string {
  const icons: Partial<Record<EquipmentSlot, string>> = {
    casco: '🪖',
    armadura: '🛡️',
    hombros: '🦾',
    amuleto: '📿',
    armaPrincipal: '⚔️',
    guantes: '🧤',
    anillo: '💍',
    botas: '👢',
  }
  return icons[slot] ?? '📦'
}

function PaperDollSlot({ label, item, slot }: { label: string; item: ItemDefinition | null; slot: EquipmentSlot }) {
  const [isHovered, setIsHovered] = useState(false)
  const rarityColor = item ? RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] : undefined

  return (
    <div
      className={`relative w-[64px] h-[64px] flex flex-col items-center justify-center cursor-pointer transition-all ${
        item
          ? 'bg-[#1a1210]'
          : 'border border-[var(--wow-border)] bg-[#0c0a06]/60 hover:bg-[#14100c] transition-colors'
      } gothic-focus`}
      style={item ? { border: `2px solid ${rarityColor}` } : {}}
      onClick={() => item && dispatch({ type: 'UNEQUIP_ITEM', payload: slot })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' && item) dispatch({ type: 'UNEQUIP_ITEM', payload: slot }) }}
    >
      <span className={`text-lg ${item ? 'opacity-50' : 'filter grayscale contrast-50 opacity-30'}`}>{getSlotIcon(slot)}</span>
      <span className="text-[10px] text-[var(--gothic-text-dim)] tracking-wider mt-0.5">{label}</span>
      {item && (
        <span
          className="text-[10px] absolute bottom-0.5 truncate max-w-[60px] px-0.5"
          style={{ color: rarityColor }}
        >
          {item.name}
        </span>
      )}

      <AnimatePresence>
        {item && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-layer-tooltip bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none"
          >
            <ItemTooltip item={item} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function PaperDoll() {
  const { character } = useGameStore()
  if (!character) return null

  const leftSlots: [string, EquipmentSlot][] = [
    ['Casco', 'casco'],
    ['Armadura', 'armadura'],
    ['Guantes', 'guantes'],
    ['Botas', 'botas'],
  ]
  const rightSlots: [string, EquipmentSlot][] = [
    ['Hombros', 'hombros'],
    ['Amuleto', 'amuleto'],
    ['Anillo', 'anillo'],
    ['Pantalones', 'pantalones'],
  ]

  return (
    <div className="flex items-start justify-center gap-1.5">
      <div className="flex flex-col gap-1">
        {leftSlots.map(([label, slot]) => (
          <PaperDollSlot key={slot} label={label} item={character.equipment[slot]} slot={slot} />
        ))}
      </div>

      <div className="flex flex-col items-center justify-center h-full min-h-[180px]">
        {(() => {
          const sprites = getCharacterSpritePair(character.race, character.class)
          return sprites.front ? (
            <img src={sprites.front} alt={`${character.race} ${character.class}`} className="w-full h-44 max-h-52 object-contain" />
          ) : (
            <span className="text-4xl opacity-60">⚔</span>
          )
        })()}
      </div>

      <div className="flex flex-col gap-1">
        {rightSlots.map(([label, slot]) => (
          <PaperDollSlot key={slot} label={label} item={character.equipment[slot]} slot={slot} />
        ))}
      </div>
    </div>
  )
}

export function WeaponPaperDoll() {
  const { character } = useGameStore()
  if (!character) return null

  const weaponSlots: [string, EquipmentSlot][] = [
    ['Arma Principal', 'armaPrincipal'],
    ['Arma Secundaria', 'armaSecundaria'],
    ['Arma Distancia', 'armaDistancia'],
  ]

  return (
    <div className="flex gap-1.5 mt-1.5 w-full">
      {weaponSlots.map(([label, slot]) => {
        const equipped = character.equipment[slot]
        const rarityColor = equipped ? RARITY_COLORS[equipped.rarity] : undefined
        return (
          <WeaponDollSlot
            key={slot}
            label={label}
            equipped={equipped}
            slot={slot}
            rarityColor={rarityColor}
          />
        )
      })}
    </div>
  )
}

function WeaponDollSlot({ label, equipped, slot, rarityColor }: { label: string; equipped: ItemDefinition | null; slot: EquipmentSlot; rarityColor: string | undefined }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`relative flex-1 h-[52px] flex flex-col items-center justify-center cursor-pointer transition-all ${
        equipped
          ? 'bg-[#1a1210]'
          : 'border border-[var(--wow-border)] bg-[#0c0a06]/60 hover:bg-[#14100c] transition-colors'
      }`}
      style={equipped ? { border: `2px solid ${rarityColor}` } : {}}
      onClick={() => equipped && dispatch({ type: 'UNEQUIP_ITEM', payload: slot })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' && equipped) dispatch({ type: 'UNEQUIP_ITEM', payload: slot }) }}
    >
      <span className={`text-sm ${equipped ? 'opacity-50' : 'filter grayscale contrast-50 opacity-30'}`}>⚔</span>
      <span className="text-[10px] text-[var(--gothic-text-dim)] tracking-wider">{label}</span>
      {equipped && (
        <span className="text-[10px] truncate max-w-full px-0.5" style={{ color: rarityColor }}>
          {equipped.name}
        </span>
      )}

      <AnimatePresence>
        {equipped && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-layer-tooltip bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none"
          >
            <ItemTooltip item={equipped} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function CharacterStats() {
  const { character } = useGameStore()
  if (!character) return null

  const totalStats = calculateTotalStats(character)
  const damageMin = character.equipment.armaPrincipal?.damage?.min ?? 5
  const damageMax = character.equipment.armaPrincipal?.damage?.max ?? 10
  const threat = Math.floor(((totalStats.fuerza ?? 10) / 3 + (totalStats.vitalidad ?? 10) / 3))

  const statRows: { label: string; value: string | number; color: string }[] = [
    { label: 'FUE', value: totalStats.fuerza ?? 0, color: '#c03030' },
    { label: 'INT', value: totalStats.inteligencia ?? 0, color: '#3060c0' },
    { label: 'AGI', value: totalStats.agilidad ?? 0, color: '#c0c030' },
    { label: 'VIT', value: totalStats.vitalidad ?? 0, color: '#30a030' },
    { label: 'Dano', value: `${damageMin}-${damageMax}`, color: '#ff4040' },
    { label: 'Amenaza', value: threat, color: '#c0a030' },
    { label: 'Armadura', value: totalStats.armadura ?? 0, color: '#808080' },
    { label: 'Velocidad', value: `${(totalStats.velocidad ?? 100)}%`, color: '#40c0c0' },
  ]

  return (
    <div className="w-full border-2 border-[var(--gothic-border)] bg-[#1a1210] p-2">
      <div className="grid grid-cols-2 gap-x-4">
        {statRows.map((r, i) => (
          <div key={r.label} className={`flex items-center justify-between text-[10px] px-1.5 py-1.5 border-b border-white/[0.04] last:border-b-0 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
            <span style={{ color: r.color }} className="font-[var(--font-pixel)] text-[10px] tracking-wider uppercase">{r.label}</span>
            <span className="text-[var(--gothic-text)] font-mono">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ExperienceBar() {
  const { character } = useGameStore()
  if (!character) return null

  const xpForNext = character.experienceToNext
  const currentXp = character.experience
  const pct = xpForNext > 0 ? Math.min((currentXp / xpForNext) * 100, 100) : 0

  return (
    <div className="w-full my-2">
      <div className="relative w-full h-4 border border-[var(--wow-border-gold-bright)] bg-[var(--wow-bg)] overflow-hidden">
        <motion.div
          className="h-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            background: 'linear-gradient(90deg, #6a4a20 0%, #8a6a30 50%, var(--gothic-gold-copper) 100%)',
            boxShadow: '0 0 8px rgba(192,144,64,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono tracking-wider text-[var(--wow-text)] pointer-events-none select-none" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
          XP: {currentXp} / {xpForNext} ({Math.floor(pct)}%)
        </span>
      </div>
    </div>
  )
}

export function LevelUpNotification() {
  const { levelUpCount, character } = useGameStore()
  const [visible, setVisible] = useState(false)
  const prevCountRef = useRef(levelUpCount)

  useEffect(() => {
    if (levelUpCount > prevCountRef.current && levelUpCount > 0 && character) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        dispatch({ type: 'ACKNOWLEDGE_LEVEL_UP' })
      }, 3000)
      return () => clearTimeout(timer)
    }
    prevCountRef.current = levelUpCount
  }, [levelUpCount, character])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="level-up"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-layer-notification flex items-center justify-center pointer-events-none"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
              transition={{ duration: 0.6, times: [0, 0.6, 1] }}
              className="mb-2"
            >
              <span className="text-5xl">⬆</span>
            </motion.div>
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-2xl font-[var(--font-pixel)] uppercase tracking-widest"
              style={{
                color: 'var(--gothic-gold-copper)',
                textShadow: '0 0 20px rgba(192, 168, 96, 0.6), 0 0 40px rgba(192, 168, 96, 0.3)',
              }}
            >
              ¡LEVEL UP!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="text-sm font-[var(--font-pixel)] text-[var(--gothic-text)] mt-2 tracking-wider"
            >
              Nivel {character?.level ?? 0}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className="text-[10px] text-[var(--gothic-text-dim)] mt-1 font-mono"
            >
              +1 Punto de Talento
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function CharacterHeader() {
  const { character } = useGameStore()
  if (!character) return null

  return (
    <div className="text-center pb-2 border-b border-[var(--gothic-border)]">
      <h2 className="text-[var(--gothic-gold-copper)] font-[var(--font-pixel)] text-sm tracking-wider uppercase">
        {character.name}
      </h2>
      <p className="text-[var(--gothic-text-dim)] text-[10px] mt-0.5">
        Nivel {character.level} {character.race} {character.class}
      </p>
      <p className="text-[var(--gothic-gold-copper)] text-[10px] mt-0.5">
        &#9679; {character.wallet.gold} Oro
      </p>
    </div>
  )
}

export function SkillsPanel() {
  const { character } = useGameStore()
  if (!character) return null

  const styles = classAbilities[character.class]
  if (!styles) return null
  const activeStyle = styles[character.skills.activeStyle] ?? Object.values(styles)[0]
  if (!activeStyle) return null

  const allStyleSkills = Object.values(styles).flatMap(s => s.skills)
  const equipped = character.skills.equipped
  const ultimateSkill = character.class ? ULTIMATE_SKILLS[character.class as Class] : undefined
  const isUltEquipped = ultimateSkill && character.ultimateEquipped === ultimateSkill.id
  const hasUlt = ultimateSkill != null

  return (
    <div className="w-full border-2 border-[var(--gothic-border)] bg-[#1a1210] mt-2">
      <div className="flex items-center justify-between px-2 py-1 border-b border-[var(--gothic-border)] bg-[#201810]">
        <h3 className="text-[var(--gothic-gold-copper)] text-[10px] font-[var(--font-pixel)] tracking-wider uppercase">Habilidades</h3>
        <span className="text-[var(--gothic-text-dim)] text-[10px]">{equipped.length}/4{hasUlt ? ' +Ult' : ''}</span>
      </div>
      <div className="p-1 space-y-0.5">
        {equipped.length === 0 && !hasUlt && (
          <p className="text-[var(--gothic-text-dim)] text-[10px] text-center py-1">
            Equipa habilidades desde el Libro
          </p>
        )}
        {allStyleSkills.filter(s => equipped.includes(s.id)).map((skill) => (
          <div key={skill.id} className="flex justify-between items-center px-1.5 py-0.5 bg-[#201810] text-[10px]">
            <span className="text-[var(--gothic-gold-copper)]">{skill.name}</span>
            <span className="text-[var(--gothic-text-dim)] text-[10px]">
              {character.skills.charges[skill.id] ?? skill.maxCharges}/{skill.maxCharges}
            </span>
          </div>
        ))}
        {hasUlt && (
          <div
            className={`flex justify-between items-center px-1.5 py-0.5 text-[10px] transition-all ${
              isUltEquipped ? 'bg-[#2a1a0a] border border-amber-700/50' : 'bg-[#1a1210]'
            }`}
          >
            <span className={isUltEquipped ? 'text-amber-500' : 'text-[var(--gothic-text-dim)]'}>
              &#9733; {ultimateSkill?.name}
            </span>
            <span className={`text-[9px] ${isUltEquipped ? 'text-amber-700' : 'text-[var(--gothic-text-dim)]'}`}>
              {isUltEquipped ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
