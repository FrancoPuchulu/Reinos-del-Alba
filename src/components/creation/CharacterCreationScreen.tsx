import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GothicButton } from '@/components/common/GothicButton'
import { GothicInput } from '@/components/common/GothicInput'
import { GothicPanel } from '@/components/common/GothicPanel'
import { GAME_CONFIG } from '@/config/game'
import { raceProfiles, classAbilities } from '@/data/gameData'
import { BASE_STATS_CLASES } from '@/game/config'
import { getCharacterSprite } from '@/data/sprites'
import type { Race, Class } from '@/types/game'
import { dispatch } from '@/store/GameStore'

const CLASSES: Class[] = ['Guerrero', 'Mago', 'Druida', 'Brujo']

const RACES_ORDER: { faction: string; races: Race[] }[] = [
  { faction: 'Ejercito del Alba', races: ['Humano', 'Enano', 'Gnomo', 'AltoElfo'] },
  { faction: 'Legion del Inframundo', races: ['Orco', 'Minotauro', 'NoMuerto', 'Goblin'] },
]

const CLASS_COLORS: Record<Class, string> = {
  Guerrero: '#c03030',
  Mago: '#3060c0',
  Druida: '#30a030',
  Brujo: '#9040c0',
}

const STAT_ROWS: { key: string; label: string; icon: string; from: string; to: string }[] = [
  { key: 'fuerza', label: 'FUE', icon: '⚔', from: 'from-orange-600', to: 'to-amber-500' },
  { key: 'agilidad', label: 'DES', icon: '➶', from: 'from-emerald-600', to: 'to-green-400' },
  { key: 'vitalidad', label: 'VIT', icon: '♥', from: 'from-red-600', to: 'to-rose-500' },
  { key: 'inteligencia', label: 'INT', icon: '✦', from: 'from-blue-600', to: 'to-cyan-400' },
  { key: 'armadura', label: 'ARM', icon: '🛡', from: 'from-slate-500', to: 'to-slate-300' },
  { key: 'regenMana', label: 'MAN', icon: '✦', from: 'from-purple-600', to: 'to-violet-400' },
]

function resolveStats(classId: string | null): Record<string, number> | null {
  if (!classId) return null
  const match = BASE_STATS_CLASES[classId as Class]
  const { hpMod: _h, mpMod: _m, damageType: _d, ...statBlock } = match
  return statBlock as Record<string, number>
}

const RACE_EMOJIS: Record<Race, string> = {
  Orco: '💀', Minotauro: '🐂', NoMuerto: '☠', Goblin: '👺',
  Humano: '🧑', Enano: '⛰', Gnomo: '🔧', AltoElfo: '🧝',
}

function FactionPanel({
  faction,
  races,
  selectedRace,
  onSelectRace,
}: {
  faction: string
  races: Race[]
  selectedRace: Race | null
  onSelectRace: (race: Race) => void
}) {
  return (
    <GothicPanel variant="iron" animate={false} noPadding className="flex-shrink-0 w-48 lg:w-full">
      <div className="px-2 py-1.5">
        <h3 className="text-[var(--gothic-text-dim)] text-[10px] font-[var(--font-pixel)] tracking-wider uppercase text-center border-b border-[var(--gothic-border)] pb-1 mb-1 opacity-80">
          {faction}
        </h3>
        <div className="flex flex-wrap lg:flex-col gap-0.5">
          {races.map((race) => {
            const profile = raceProfiles[race]
            const isSelected = selectedRace === race
            return (
              <motion.button
                key={race}
                onClick={() => onSelectRace(race)}
                className={`
                  flex items-center gap-2 px-2 py-1.5 text-left transition-all duration-100 rounded flex-shrink-0 border-2
                  ${isSelected
                    ? 'bg-[var(--gothic-bg-panel)] border-[var(--gothic-border)] text-[var(--gothic-text)]'
                    : 'bg-[var(--gothic-bg-input)] border-[var(--gothic-border-dim)] text-[var(--gothic-text-dim)] hover:border-[var(--gothic-gold)]'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-pressed={isSelected}
              >
                <div
                  className="w-5 h-5 flex items-center justify-center text-[10px] font-bold border-2 rounded flex-shrink-0"
                  style={{
                    backgroundColor: profile.color + '33',
                    borderColor: isSelected ? profile.color : 'var(--gothic-border)',
                    color: profile.color,
                  }}
                >
                  {RACE_EMOJIS[race]}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-[var(--font-pixel)] tracking-wider block leading-tight truncate">{race}</span>
                  <span className="text-[10px] text-[var(--gothic-text-dim)] truncate block leading-tight opacity-70">{profile.description}</span>
                </div>
                {isSelected && <span className="text-[var(--gothic-text-dim)] text-[10px]">&#10003;</span>}
              </motion.button>
            )
          })}
        </div>
      </div>
    </GothicPanel>
  )
}

export function CharacterCreationScreen() {
  const [selectedRace, setSelectedRace] = useState<Race | null>(null)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [characterName, setCharacterName] = useState('')
  const [nameError, setNameError] = useState('')

  const handleCreate = () => {
    if (!characterName.trim()) { setNameError('El nombre es requerido'); return }
    if (!selectedRace) { setNameError('Selecciona una raza'); return }
    if (!selectedClass) { setNameError('Selecciona una clase'); return }

    dispatch({
      type: 'CREATE_CHARACTER',
      payload: { name: characterName.trim(), race: selectedRace, class: selectedClass }
    })
  }

  const previewSpriteUrl = selectedRace && selectedClass
    ? getCharacterSprite(selectedRace, selectedClass, 'front')
    : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center overflow-y-auto gothic-bg"
    >
      <div className="mb-4 sm:mb-6 text-center pt-4">
        <motion.h1
          className="text-lg sm:text-xl font-[var(--font-pixel)] text-[var(--gothic-text)] tracking-wider uppercase"
          style={{ textShadow: '2px 2px 0 var(--gothic-bg-deep), 0 0 20px rgba(192,144,64,0.15)' }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          CREACION DE PERSONAJE
        </motion.h1>
        <motion.p
          className="text-[10px] sm:text-xs text-[var(--gothic-text-dim)] font-[var(--font-pixel)] tracking-wider uppercase mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {GAME_CONFIG.SUBTITLE}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto px-4 py-4 w-full items-stretch">
        {/* LEFT — Faction 1 */}
        <div className="lg:col-span-3 flex flex-wrap lg:flex-col gap-2">
          <FactionPanel
            faction={RACES_ORDER[0].faction}
            races={RACES_ORDER[0].races}
            selectedRace={selectedRace}
            onSelectRace={setSelectedRace}
          />
        </div>

        {/* CENTER — Preview, Stats, Name, Class, Create */}
        <div className="lg:col-span-6 flex flex-col items-center gap-3 min-h-0 flex-1">
          {/* Preview Box */}
          <div className="relative flex flex-col items-center p-3 border-double border-4 border-[var(--gothic-border)] bg-black/60 shadow-[0_0_30px_rgba(0,0,0,0.6),0_0_10px_rgba(192,168,96,0.08)] w-full max-w-sm">
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[var(--gothic-gold-bright)]" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[var(--gothic-gold-bright)]" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[var(--gothic-gold-bright)]" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[var(--gothic-gold-bright)]" />

            <h4 className="text-[var(--gothic-text-dim)] text-[10px] font-[var(--font-pixel)] tracking-wider uppercase text-center mb-2">
              PREVISUALIZACION
            </h4>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedRace ?? 'none'}-${selectedClass ?? 'none'}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-36 h-36 flex items-center justify-center border-double border-4 border-[var(--gothic-border)] overflow-hidden"
                  style={{
                    background: 'radial-gradient(ellipse at center, var(--gothic-bg-panel) 0%, var(--gothic-bg-input) 50%, var(--gothic-bg-deep) 100%)',
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9), 0 0 20px rgba(192,144,64,0.12)',
                  }}
                >
                  <motion.div
                    className="absolute inset-0"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      background: 'radial-gradient(circle at center, rgba(192,144,64,0.08) 0%, transparent 70%)',
                    }}
                  />
                  {previewSpriteUrl ? (
                    <img
                      src={previewSpriteUrl}
                      alt={`${selectedRace} ${selectedClass}`}
                      className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_8px_rgba(192,144,64,0.2)]"
                    />
                  ) : (
                    <div
                      className="text-5xl relative z-10"
                      style={{
                        opacity: selectedRace ? 1 : 0.15,
                        filter: selectedRace ? 'none' : 'grayscale contrast-50',
                      }}
                    >
                      {selectedRace ? RACE_EMOJIS[selectedRace] : '?'}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {selectedRace && (
                <motion.p
                  key={selectedRace}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[var(--gothic-text-dim)] text-[10px] text-center mt-2 mb-1 max-w-[200px]"
                >
                  {raceProfiles[selectedRace].description}
                </motion.p>
              )}
            </AnimatePresence>

            {characterName && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[var(--gothic-border)] text-sm font-[var(--font-pixel)] tracking-wider text-center mt-1"
              >
                {characterName}
              </motion.p>
            )}

            <div className="flex gap-2 text-[10px] text-[var(--gothic-text-dim)] mt-1 opacity-70">
              {selectedRace && <span>{selectedRace}</span>}
              {selectedClass && <span>/ {selectedClass}</span>}
            </div>
          </div>

          {/* Base Stats */}
          <GothicPanel variant="iron" animate={false} noPadding className="w-full max-w-sm flex-shrink-0">
            <div className="px-3 py-2.5">
              <h4 className="text-[var(--gothic-text-dim)] text-[10px] font-[var(--font-pixel)] tracking-wider text-center border-b border-[var(--gothic-border)] pb-1 mb-2 opacity-80">
                ATRIBUTOS BASE
              </h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full">
                {STAT_ROWS.map((stat) => {
                  const stats = resolveStats(selectedClass)
                  const value = stats ? (stats[stat.key] ?? 10) : null
                  const pct = value !== null ? Math.min((value / 30) * 100, 100) : 0
                  return (
                    <div key={stat.key} className="py-1">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="font-[var(--font-pixel)] tracking-wider text-[var(--gothic-gold)]">
                          {stat.icon} {stat.label}
                        </span>
                        <span className={`font-[var(--font-pixel)] ${value !== null ? 'text-[var(--gothic-text)]' : 'text-[var(--gothic-text-dim)]'}`}>
                          {value ?? '--'}
                        </span>
                      </div>
                      <div className="relative h-3 bg-[var(--gothic-bg-input)] border border-[var(--gothic-border-dim)] overflow-hidden">
                        <motion.div
                          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${stat.from} ${stat.to}`}
                          initial={{ width: '0%' }}
                          animate={{ width: `${pct}%` }}
                          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </GothicPanel>

          {/* Hero Name */}
          <GothicInput
            label="NOMBRE DEL HEROE"
            value={characterName}
            onChange={(v) => { setNameError(''); setCharacterName(v) }}
            placeholder="Escribe tu nombre..."
            error={nameError}
            maxLength={20}
            required
          />

          {/* Class Selection */}
          <GothicPanel variant="ornate" animate={false} noPadding className="w-full max-w-sm">
            <div className="px-3 py-2">
              <h3 className="text-[var(--gothic-text-dim)] text-[10px] font-[var(--font-pixel)] tracking-wider text-center border-b border-[var(--gothic-border)] pb-1 mb-1.5 opacity-80">
                CLASE
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {CLASSES.map((cls) => {
                  const isSelected = selectedClass === cls
                  const styles = classAbilities[cls]
                  const styleNames = Object.values(styles).map(s => s.name).join(' · ')
                  return (
                    <motion.button
                      key={cls}
                      onClick={() => setSelectedClass(cls)}
                      className={`
                        flex flex-col items-center justify-center text-center py-2 px-1 rounded transition-all duration-100 border-2
                        ${isSelected
                          ? 'bg-[var(--gothic-bg-dark)] border-[var(--gothic-border)]'
                          : 'bg-[var(--gothic-bg-deep)] border-[var(--gothic-border-dim)] hover:border-[var(--gothic-gold)]'
                        }
                      `}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      aria-pressed={isSelected}
                    >
                      <span className={`text-[10px] font-[var(--font-pixel)] tracking-wider ${isSelected ? '' : 'text-[var(--gothic-text-dim)]'}`}
                        style={isSelected ? { color: CLASS_COLORS[cls] } : {}}>
                        {cls}
                      </span>
                      <span className="text-[10px] text-[var(--gothic-text-dim)] mt-0.5 leading-tight opacity-70 truncate max-w-full">{styleNames}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </GothicPanel>

          {/* Create Button */}
          <GothicButton
            onClick={handleCreate}
            size="lg"
            variant="gold"
            className="w-full max-w-sm"
            disabled={!selectedRace || !selectedClass || !characterName.trim()}
          >
            CREAR PERSONAJE
          </GothicButton>
        </div>

        {/* RIGHT — Faction 2 */}
        <div className="lg:col-span-3 flex flex-wrap lg:flex-col gap-2">
          <FactionPanel
            faction={RACES_ORDER[1].faction}
            races={RACES_ORDER[1].races}
            selectedRace={selectedRace}
            onSelectRace={setSelectedRace}
          />
        </div>
      </div>
    </motion.div>
  )
}
