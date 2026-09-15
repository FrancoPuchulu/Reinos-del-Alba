import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, dispatch } from '@/store/GameStore'
import { GothicButton } from '@/components/common/GothicButton'
import { expeditions, type ExpeditionDef } from '@/data/gameData'
import { PVP_RIVALS, type PvPRival } from '@/data/pvpRivals'
import { getCharacterSprite } from '@/data/sprites'
import { setPendingPvpRival } from '@/game/pvpRivalState'
import type { Difficulty } from '@/types/game.types'
import { RARITY_COLORS } from '@/constants/theme'
import { formatTimeRemaining } from '@/engine/expeditions'

const ADVENTURE_EMOJIS: Record<string, string> = {
  'Aguja Brisaveloz': '🗡️',
  'Arena Rajavacío': '⚔️',
  'Bancal del Magister': '🧙',
  'Cavernas de Maisara': '🦇',
  'Frontal de la Muerte': '💀',
  'El Valle Cegador': '👁️',
  'Guarida de Nalorakk': '🐉',
  'Punto del Nexo': '🌀',
  'Trono del Alba': '👑',
}

const CATEGORY_EMOJIS: Record<string, string> = {
  misiones: '⚔️',
  mazmorras: '🏰',
  bandas: '🏴',
  pvp: '💀',
}

type Category = 'misiones' | 'mazmorras' | 'bandas' | 'pvp'

const CATEGORY_DEFINITIONS: { id: Category; label: string }[] = [
  { id: 'misiones', label: 'Misiones' },
  { id: 'mazmorras', label: 'Mazmorras' },
  { id: 'bandas', label: 'Bandas' },
  { id: 'pvp', label: 'PvP' },
]

function AdventureList({ category }: { category: Category }) {
  const { character } = useGameStore()
  const activeExpedition = useGameStore().expedition
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const expeditionTimeRef = useRef(0)
  const [, setTick] = useState(0)
  const [notification, setNotification] = useState<string | null>(null)
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!activeExpedition) return
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [activeExpedition])

  const showNotification = useCallback((msg: string) => {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current)
    setNotification(msg)
    notifTimerRef.current = setTimeout(() => setNotification(null), 4000)
  }, [])

  const handleStart = useCallback((adv: ExpeditionDef) => {
    if (!character) return
    if (!adv.solo) {
      const reqMin = parseInt(adv.players.split('-')[0], 10)
      if (reqMin > 1) {
        showNotification(`${adv.name} requiere ${adv.players} jugadores. Modo grupo no implementado.`)
        return
      }
    }
    if (character.level < adv.minLevel) {
      showNotification(`Nivel minimo requerido: ${adv.minLevel}`)
      return
    }
    expeditionTimeRef.current = Date.now()
    const duration = adv.levels[difficulty].time
    dispatch({
      type: 'START_EXPEDITION',
      payload: {
        adventureName: adv.name,
        category: category as 'misiones' | 'mazmorras' | 'bandas',
        difficulty,
        startTime: expeditionTimeRef.current,
        durationMinutes: duration,
      }
    })
  }, [character, difficulty, category, showNotification])

  if (category === 'pvp') {
    const handleChallenge = (rival: PvPRival) => {
      setPendingPvpRival(rival)
      dispatch({ type: 'SET_SCREEN', payload: 'battle' })
    }

    return (
      <div className="border-2 border-[var(--gothic-border)] bg-[#0c0a06] overflow-hidden">
        <div className="px-4 py-3 border-b-2 border-[var(--gothic-border)] bg-gradient-to-b from-[#180e08] to-[#0c0a06] text-center">
          <span className="text-2xl mr-2">💀</span>
          <h2 className="inline text-sm font-[var(--font-pixel)] tracking-wider uppercase" style={{ color: 'var(--gothic-gold-copper)', textShadow: '0 0 8px rgba(192,144,64,0.3)' }}>
            Escalafón de Deshonor
          </h2>
        </div>

        <div className="overflow-y-auto wow-scroll max-h-[calc(100vh-220px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {PVP_RIVALS.map((rival) => {
              const spriteUrl = getCharacterSprite(rival.spriteKey, 'front')
              const statEntries: { label: string; value: number; color: string }[] = [
                { label: 'HP', value: rival.stats.health, color: '#30a030' },
                { label: 'ATQ', value: rival.stats.attack, color: '#c03030' },
                { label: 'DEF', value: rival.stats.defense, color: '#808080' },
                { label: 'VEL', value: rival.stats.speed, color: '#40c0c0' },
              ]

              return (
                <motion.div
                  key={rival.id}
                  className="relative border-2 border-[var(--gothic-border)] bg-[#12100c] overflow-hidden"
                  whileHover={{ scale: 1.02, boxShadow: '0 0 16px rgba(192,144,64,0.25)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="flex items-stretch">
                    {/* Portrait */}
                    <div className="w-28 flex-shrink-0 flex items-center justify-center border-r-2 border-[var(--gothic-border)] bg-[#0a0806]"
                      style={{ background: 'radial-gradient(ellipse at center, #1a1210 0%, #0a0806 100%)' }}>
                      <img
                        src={spriteUrl}
                        alt={`${rival.name} portrait`}
                        className="h-24 w-24 object-contain drop-shadow-[0_0_8px_rgba(192,144,64,0.2)]"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-3 flex flex-col min-w-0">
                      {/* Header */}
                      <div className="mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--gothic-gold-copper)] font-[var(--font-pixel)] text-[10px] tracking-wider">
                            Nv.{rival.level}
                          </span>
                          <span className="text-[var(--gothic-text-dim)] text-[10px]">
                            Rango {rival.rankTier}
                          </span>
                        </div>
                        <h3 className="text-[var(--gothic-gold-copper)] font-[var(--font-pixel)] text-xs tracking-wider mt-0.5">
                          {rival.name}
                        </h3>
                        <p className="text-[var(--gothic-text-dim)] text-[10px] italic mt-0.5">
                          {rival.title}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-1.5 mb-2">
                        {statEntries.map((s) => (
                          <div key={s.label} className="text-center">
                            <span className="text-[9px] font-[var(--font-pixel)] tracking-wider uppercase block" style={{ color: s.color }}>
                              {s.label}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--gothic-text)]">
                              {s.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Quote */}
                      <p className="text-[var(--gothic-text-dim)] text-[10px] italic mb-2 line-clamp-2">
                        {rival.quote}
                      </p>

                      {/* Rewards + Action */}
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[9px] px-1.5 py-0.5 border border-[var(--gothic-border)] bg-[#0c0a06] text-[var(--gothic-gold-copper)] font-mono">
                            &#x1FA99; {rival.rewards.gold}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 border border-[var(--gothic-border)] bg-[#0c0a06] text-[var(--gothic-rarity-magic)] font-mono">
                            &#x2B50; {rival.rewards.experience}
                          </span>
                          {rival.rewards.itemLootName && (
                            <span
                              className="text-[9px] px-1.5 py-0.5 border border-[var(--gothic-border)] bg-[#0c0a06] font-mono"
                              style={{ color: `var(--gothic-rarity-${rival.rewards.itemRarity ?? 'common'})` }}
                            >
                              &#x1F4E6; {rival.rewards.itemLootName}
                            </span>
                          )}
                        </div>
                        <GothicButton
                          size="sm"
                          variant="wow-gold"
                          onClick={() => handleChallenge(rival)}
                          className="gothic-focus"
                        >
                          DESAFIAR
                        </GothicButton>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const list = expeditions[category]
  if (list.length === 0) {
    return <p className="text-[var(--wow-text-dim)] text-[10px] text-center py-4">No hay aventuras disponibles</p>
  }

  return (
    <div className="border-2 border-[var(--wow-border)] bg-[#0c0a06] overflow-hidden">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b-2 border-[var(--wow-border)] bg-gradient-to-b from-[#180e08] to-[#0c0a06] text-center">
        <span className="text-2xl mr-2">{CATEGORY_EMOJIS[category] ?? '📜'}</span>
        <h2 className="inline text-sm font-[var(--font-pixel)] tracking-wider uppercase" style={{ color: 'var(--gothic-gold-copper)', textShadow: '0 0 8px rgba(192,144,64,0.3)' }}>
          Guia de Aventura
        </h2>
      </div>

      {/* Difficulty Tabs */}
      <div className="flex justify-center gap-0 px-4 pt-3 pb-1">
        {(['normal', 'heroico', 'mitico'] as Difficulty[]).map((d, i, arr) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={`relative px-5 py-1.5 text-[9px] font-[var(--font-pixel)] tracking-wider uppercase transition-all duration-200 cursor-pointer border-2 ${
              difficulty === d
                ? 'bg-[#1a1210] border-[var(--gothic-gold-copper)] text-[var(--gothic-gold-copper)] z-10 shadow-[0_0_10px_rgba(192,144,64,0.3)]'
                : 'bg-[#0c0a06] border-[var(--gothic-border)] text-[var(--wow-text-dim)] hover:border-[#6a5040] hover:text-[var(--wow-text)]'
            } ${i === 0 ? 'rounded-l-md' : ''} ${i === arr.length - 1 ? 'rounded-r-md' : ''} -ml-0.5 first:ml-0`}
          >
            {d === 'normal' ? 'Normal' : d === 'heroico' ? 'Heroico' : 'Mitico'}
          </button>
        ))}
      </div>

      {/* Adventure Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {list.map((adv: ExpeditionDef) => {
          const duration = adv.levels[difficulty].time
          const isOnExpedition = activeExpedition?.adventureName === adv.name
          const emoji = ADVENTURE_EMOJIS[adv.name] ?? '📜'
          const locked = !!activeExpedition || (character?.level ?? 0) < adv.minLevel

          return (
            <motion.div
              key={adv.name}
              className={`relative group rounded-lg overflow-hidden border-2 ${
                isOnExpedition
                  ? 'border-[var(--wow-border-gold-bright)] shadow-[0_0_12px_rgba(192,144,64,0.4)]'
                  : `${locked ? 'border-[var(--gothic-border)]' : ''}`
              } ${locked ? 'opacity-70' : ''}`}
              style={{
                background: 'linear-gradient(160deg, #1a1210 0%, #0c0a06 40%, #14100c 100%)',
              }}
              whileHover={!locked && !isOnExpedition ? {
                scale: 1.02,
                boxShadow: '0 0 16px rgba(192,144,64,0.25)',
              } : undefined}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {!locked && !isOnExpedition && (
                <motion.div
                  className="absolute inset-0 rounded-lg pointer-events-none border-2"
                  animate={{
                    borderColor: ['var(--gothic-border)', 'var(--gothic-gold-copper)', 'var(--gothic-border)'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{ zIndex: 0 }}
                />
              )}
              {/* Background emoji as concept art */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-7xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 select-none">
                  {emoji}
                </span>
              </div>

              {/* Card content */}
              <div className="relative z-10 p-4 flex flex-col h-full min-h-[180px]">
                {/* Title */}
                <h4
                  className="text-center font-serif font-bold text-sm mb-2 tracking-wide"
                  style={{ color: 'var(--gothic-gold-copper)', textShadow: '0 1px 4px rgba(192,144,64,0.3), 0 0 12px rgba(192,144,64,0.15)' }}
                >
                  {adv.name}
                </h4>

                {/* Separator */}
                <div className="w-12 h-px mx-auto mb-2 bg-gradient-to-r from-transparent via-[var(--gothic-gold-copper)] to-transparent" />

                {/* Description / Lore */}
                <p className="text-[#a09080] text-[8px] leading-relaxed text-center mb-2 italic line-clamp-3 px-1">
                  {adv.description}
                </p>

                {/* Reward Preview */}
                <div className="border border-[var(--gothic-border)] bg-[#0c0a06]/60 p-2 mb-2 rounded">
                  <p className="text-[var(--gothic-gold-copper)] text-[7px] font-[var(--font-pixel)] tracking-wider uppercase text-center mb-1">Recompensas</p>
                  <div className="flex items-center justify-center gap-3 text-[8px] mb-1.5">
                    <span className="text-[#c0a030]">&#x1FA99; {adv.rewardPreview.gold.min}&#8211;{adv.rewardPreview.gold.max}</span>
                    <span className="text-[#4080c0]">&#x2B50; {adv.rewardPreview.xp.min}&#8211;{adv.rewardPreview.xp.max}</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1">
                    {adv.rewardPreview.possibleLoot.map((loot, i) => (
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

                {/* Info */}
                <div className="space-y-1 text-center mb-auto">
                  <p className="text-[var(--wow-text-dim)] text-[10px]">
                    {adv.solo ? 'Solitario' : `Jugadores: ${adv.players}`}
                  </p>
                  <p className="text-[var(--wow-text-dim)] text-[10px]">
                    Tiempo: {duration}min &middot; Nv.{adv.minLevel}+
                  </p>
                </div>

                {/* Action */}
                <div className="mt-3 flex justify-center">
                  {isOnExpedition && activeExpedition.bonusBossReady && activeExpedition.adventureName === adv.name ? (
                    <motion.button
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      onClick={() => {
                        dispatch({ type: 'START_BONUS_BATTLE' })
                      }}
                      className="relative px-5 py-2.5 font-[var(--font-pixel)] text-[10px] tracking-wider uppercase cursor-pointer border-2 rounded overflow-hidden transition-all duration-300 hover:scale-105"
                      style={{
                        borderColor: 'var(--gothic-gold-copper)',
                        color: 'var(--gothic-gold-copper)',
                        background: 'linear-gradient(135deg, #1a1210 0%, #0c0a06 50%, #1a1210 100%)',
                        boxShadow: '0 0 20px rgba(192,144,64,0.4), inset 0 1px 0 rgba(192,144,64,0.1)',
                        textShadow: '0 0 8px rgba(192,144,64,0.5)',
                      }}
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--gothic-gold-copper)]/10 to-transparent animate-[shimmer_2s_infinite]" />
                      <span className="relative z-10 flex items-center gap-2">
                        <span className="text-lg">⚔️</span>
                        ¡Ir a la batalla!
                      </span>
                    </motion.button>
                  ) : isOnExpedition ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                      <div className="flex items-center gap-2 px-4 py-1.5 border border-[var(--wow-border-gold)] bg-[#1a1210]/50 rounded">
                        <span className="inline-block w-2 h-2 rounded-full bg-[var(--gothic-gold-copper)] animate-pulse" />
                        <span className="text-[var(--wow-text-gold)] text-[9px] font-[var(--font-pixel)] tracking-wider uppercase">
                          En curso...
                        </span>
                      </div>
                      {(() => {
                        if (activeExpedition.adventureName !== adv.name) return null
                        const elapsed = Date.now() - activeExpedition.startTime
                        const total = activeExpedition.durationMinutes * 60 * 1000
                        const remaining = Math.max(0, total - elapsed)
                        const pct = Math.min(100, (elapsed / total) * 100)
                        return (
                          <div className="w-full">
                            <div className="relative h-2 border border-[var(--gothic-border)] bg-[#0c0a06] rounded overflow-hidden">
                              <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#8a6a30] to-[var(--gothic-gold-copper)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                              />
                            </div>
                            <p className="text-center text-[8px] text-[var(--wow-text-dim)] mt-1 font-mono">
                              {formatTimeRemaining(remaining)}
                            </p>
                          </div>
                        )
                      })()}
                    </div>
                  ) : (
                    <GothicButton
                      size="sm"
                      variant="wow-gold"
                      onClick={() => handleStart(adv)}
                      disabled={locked}
                    >
                      {activeExpedition ? 'Ocupado' : 'Enviar Heröe'}
                    </GothicButton>
                  )}
                </div>
              </div>

              {/* Bottom accent line */}
              <div
                className="h-0.5 w-full transition-all duration-300"
                style={{
                  background: isOnExpedition
                    ? 'linear-gradient(90deg, transparent, var(--gothic-gold-copper), transparent)'
                    : 'linear-gradient(90deg, transparent, var(--gothic-border), transparent)',
                }}
              />
            </motion.div>
          )
        })}
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-2.5 bg-[#1a1210] border-t-2 border-[#803020] text-center">
              <p className="text-[#c04030] text-[10px] font-[var(--font-pixel)] tracking-wider">
                {notification}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AdventureTab() {
  const [category, setCategory] = useState<Category>('misiones')

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="max-w-7xl mx-auto w-full p-4"
    >
      <div className="flex gap-0 mb-3 overflow-x-auto" role="tablist" aria-label="Categorias de aventura">
        {CATEGORY_DEFINITIONS.map((cat, i, arr) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`relative flex-1 shrink-0 px-3 py-2 text-[9px] font-[var(--font-pixel)] tracking-wider uppercase cursor-pointer border-2 ${
              category === cat.id
                ? 'border-transparent text-[var(--gothic-gold-copper)] z-10'
                : 'bg-[#0c0a06] border-[var(--gothic-border)] text-[var(--wow-text-dim)] hover:border-[#6a5040] hover:text-[var(--wow-text)]'
            } ${i === 0 ? 'rounded-tl-md' : ''} ${i === arr.length - 1 ? 'rounded-tr-md' : ''} -ml-0.5 first:ml-0`}
            aria-selected={category === cat.id}
            role="tab"
          >
            {category === cat.id && (
              <motion.div
                layoutId="category-tab-indicator"
                className={`absolute inset-0 border-2 border-[var(--gothic-gold-copper)] bg-[#1a1210] ${
                  i === 0 ? 'rounded-tl-md' : ''
                } ${i === arr.length - 1 ? 'rounded-tr-md' : ''}`}
                style={{ boxShadow: '0 -4px 12px rgba(192,144,64,0.25)' }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">{cat.label}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-label={`Aventuras de ${category}`}>
        <AdventureList category={category} />
      </div>
    </motion.div>
  )
}
