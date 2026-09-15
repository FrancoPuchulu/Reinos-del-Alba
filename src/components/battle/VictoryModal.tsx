import { motion, AnimatePresence } from 'framer-motion'
import { InventorySlot } from '../common/InventorySlot'
import { useGameStore } from '../../store/GameStore'
import type { InventoryItem, EquipmentSlot } from '../../types/game.types'
import { RARITY_COLORS } from '../../constants/theme'

interface VictoryModalProps {
  showModal: boolean
  winner: 'player' | 'enemy' | null
  goldReward: number
  expReward: number
  lootItem?: InventoryItem
  isBonusBoss?: boolean
  onReclaim: () => void
  onDefeat: () => void
}

function computeDefeatPenalty(character: NonNullable<ReturnType<typeof useGameStore>['character']>) {
  const goldLost = Math.floor(character.wallet.gold * 0.05)
  const durabilityLosses: { name: string; before: number; after: number }[] = []
  for (const key of Object.keys(character.equipment) as EquipmentSlot[]) {
    const item = character.equipment[key]
    if (item && item.durability != null) {
      const before = item.durability
      const after = Math.max(0, Math.floor(before * 0.9))
      if (after < before) {
        durabilityLosses.push({ name: item.name, before, after })
      }
    }
  }
  return { goldLost, durabilityLosses }
}

export function VictoryModal({
  showModal, winner, goldReward, expReward, lootItem, isBonusBoss,
  onReclaim, onDefeat,
}: VictoryModalProps) {
  const { character } = useGameStore()
  const penalty = winner === 'enemy' && character ? computeDefeatPenalty(character) : null
  return (
    <AnimatePresence>
      {showModal && winner && (
        <motion.div
          key="battle-end-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-layer-modal bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="relative w-full max-w-md mx-4"
          >
            {winner === 'player' ? (
              <div className="relative border-double border-4 border-[var(--gothic-gold)] bg-black/90 p-8 text-center overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at center bottom, rgba(192,168,96,0.15) 0%, transparent 60%)' }}
                />
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
                  transition={{ duration: 0.6, times: [0, 0.6, 1] }}
                  className="mb-4"
                >
                  <span className="text-5xl">👑</span>
                </motion.div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-3xl font-[var(--font-pixel)] font-bold uppercase tracking-widest mb-2 relative z-10 text-ember"
                  style={{
                    textShadow: '0 0 20px rgba(192,168,96,0.6), 0 0 40px rgba(192,168,96,0.3), 0 2px 0 #0a0a0a',
                  }}
                >
                  ¡VICTORIA!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-[11px] text-[var(--gothic-text-dim)] mb-6 relative z-10"
                >
                  Tu enemigo ha sido derrotado
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="border-t border-[var(--gothic-border)] pt-4 mb-6 relative z-10"
                >
                  <div className="text-[8px] text-[var(--gothic-gold-copper)] uppercase tracking-wider mb-3 opacity-70">Recompensas</div>
                  <div className="flex justify-center gap-8 text-[11px]">
                    <div className="text-center">
                      <div className="text-[var(--gothic-gold-bright)] font-mono text-sm">+{goldReward}</div>
                      <div className="text-[8px] text-[var(--gothic-text-dim)] uppercase">Oro</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#3060c0] font-mono text-sm">+{expReward}</div>
                      <div className="text-[8px] text-[var(--gothic-text-dim)] uppercase">Experiencia</div>
                    </div>
                  </div>
                  {lootItem && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06]">
                      <div className="text-[8px] text-[var(--gothic-gold-copper)] uppercase tracking-wider mb-2 opacity-70">
                        {isBonusBoss ? 'Botín de Bonificación' : 'Botin'}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <InventorySlot item={lootItem} size="sm" onEquip={false} />
                        <span className="text-[10px]" style={{ color: RARITY_COLORS[lootItem.rarity] }}>
                          {lootItem.name}
                        </span>
                      </div>
                      {isBonusBoss && (
                        <p className="text-[8px] text-[var(--gothic-gold-copper)] mt-2 font-[var(--font-pixel)]">
                          ¡Botín de Bonificación obtenido!
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(192,168,96,0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onReclaim}
                  className="relative z-10 w-full py-3 font-[var(--font-pixel)] text-sm tracking-widest uppercase border-double border-2 border-[var(--gothic-gold)] text-[var(--gothic-gold-bright)] bg-[#1a1a0a] hover:bg-[#2a2a1a] transition-colors cursor-pointer gothic-focus"
                >
                  Volver al Refugio
                </motion.button>
              </div>
            ) : (
              <div className="relative border-double border-4 border-[var(--gothic-crimson)] bg-black/90 p-8 text-center overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at center bottom, rgba(208,48,48,0.12) 0%, transparent 60%)' }}
                />
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
                  transition={{ duration: 0.6, times: [0, 0.6, 1] }}
                  className="mb-4"
                >
                  <span className="text-5xl">💀</span>
                </motion.div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-3xl font-[var(--font-pixel)] font-bold uppercase tracking-widest mb-2 relative z-10"
                  style={{
                    color: 'var(--gothic-crimson)',
                    textShadow: '0 0 20px rgba(208,48,48,0.4), 0 2px 0 #0a0a0a',
                  }}
                >
                  CAÍDO EN COMBATE
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-[11px] text-[var(--gothic-text-dim)] mb-4 relative z-10"
                >
                  Tu viaje termina aquí... por ahora.
                </motion.p>

                {penalty && (penalty.goldLost > 0 || penalty.durabilityLosses.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="border-t border-[var(--gothic-crimson)]/30 pt-4 mb-6 relative z-10"
                  >
                    <div className="text-[8px] text-[var(--gothic-crimson)] uppercase tracking-wider mb-3 opacity-80">Penalización</div>
                    {penalty.goldLost > 0 && (
                      <div className="flex items-center justify-between text-[10px] px-2 py-1 bg-[#1a0a0a] border border-[var(--gothic-crimson)]/20 mb-1.5">
                        <span className="text-[var(--gothic-text-dim)]">Oro perdido</span>
                        <span className="font-mono text-[var(--gothic-crimson)]">-{penalty.goldLost} g</span>
                      </div>
                    )}
                    {penalty.durabilityLosses.map((loss) => (
                      <div key={loss.name} className="flex items-center justify-between text-[10px] px-2 py-1 bg-[#1a0a0a] border border-[var(--gothic-crimson)]/20 mb-1.5">
                        <span className="text-[var(--gothic-text-dim)] truncate mr-2">{loss.name}</span>
                        <span className="font-mono text-[var(--gothic-crimson)] whitespace-nowrap">{loss.before} → {loss.after}</span>
                      </div>
                    ))}
                    <p className="text-[8px] text-[var(--gothic-text-dim)] mt-2 text-center opacity-60">
                      La durabilidad de tu equipo se ha reducido.
                    </p>
                  </motion.div>
                )}

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onDefeat}
                  className="relative z-10 w-full py-3 font-[var(--font-pixel)] text-sm tracking-widest uppercase border-2 border-[var(--gothic-text-dim)] text-[var(--gothic-text-dim)] bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors cursor-pointer gothic-focus"
                >
                  Volver al Refugio
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
