import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { EngineBridge, type BattleState } from '../../game/enginebridge'
import { gameEventBus, type GameEvent } from '../../events/EventBus'
import type { CombatState } from '../../types/combat'
import type { InventoryItem, StatBlock } from '../../types/game.types'
import { CLASS_EMOJIS, ENEMY_EMOJIS, type PlayerInputData, type EnemyInputData, type FloatingDamage, type SpellVFX } from '../battle/types'
import { getCharacterSprite } from '@/data/sprites'
import { CombatHeader } from '../battle/CombatHeader'
import { CombatLog } from '../battle/CombatLog'
import { VictoryModal } from '../battle/VictoryModal'
import { AbilityBar } from './AbilityBar'
import { AbilityDetailPanel } from './AbilityDetailPanel'

interface CombatScreenProps {
  playerData: PlayerInputData
  enemyData: EnemyInputData
  onBattleEnd: (winner: 'player' | 'enemy') => void
  lootItem?: InventoryItem
  isBonusBoss?: boolean
}

export const CombatScreen: React.FC<CombatScreenProps> = ({ playerData, enemyData, onBattleEnd, lootItem, isBonusBoss }) => {
  const [initialCombat] = useState(() => EngineBridge.startNewBattle(
    { ...playerData, stats: playerData.stats as Record<string, number> },
    { ...enemyData, stats: enemyData.stats as Record<string, number> },
    undefined,
    playerData.fullSkills?.find(s => s.isUltimate) ?? null,
    enemyData.ultimateSkill ?? null
  ))

  const [battleState, setBattleState] = useState<BattleState>(initialCombat.uiState)
  const engineStateRef = useRef<CombatState>(initialCombat.engineState)

  const [selectedActionIndex, setSelectedActionIndex] = useState<number>(0)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const { player, enemy, combatLog, isBattleOver, winner, potions, playerStatuses, enemyStatuses } = battleState

  const [playerUltimateCharge, setPlayerUltimateCharge] = useState<number>(0)
  const playerUltimateChargeRef = useRef<number>(0)
  const enemyUltimateCharge = battleState.enemyUltimateCharge ?? 0

  const [visualPlayerHp, setVisualPlayerHp] = useState<number>(player.currentHp)
  const visualPlayerHpRef = useRef<number>(player.currentHp)
  useEffect(() => { visualPlayerHpRef.current = visualPlayerHp }, [visualPlayerHp])

  useEffect(() => { playerUltimateChargeRef.current = playerUltimateCharge }, [playerUltimateCharge])

  const goldReward = player.level * 50
  const expReward = player.level * 100

  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([])
  const [vfxEffects, setVfxEffects] = useState<SpellVFX[]>([])
  const floatingIdRef = useRef(0)
  const pendingEventsRef = useRef<GameEvent[]>([])
  const critTargetsRef = useRef<Set<string>>(new Set())

  const [heroShake, setHeroShake] = useState({ count: 0, intensity: 1 as 1 | 2 })
  const [enemyShake, setEnemyShake] = useState({ count: 0, intensity: 1 as 1 | 2 })

  useEffect(() => {
    const timerId = animTimerRef.current
    return () => { if (timerId) clearTimeout(timerId) }
  }, [])

  useEffect(() => {
    if (isBattleOver && (winner === 'player' || winner === 'enemy')) {
      const t = setTimeout(() => setShowModal(true), 600)
      return () => clearTimeout(t)
    }
  }, [isBattleOver, winner])

  useEffect(() => {
    const collect = (evt: GameEvent) => { pendingEventsRef.current.push(evt) }
    const unsubAttack = gameEventBus.subscribe('Attack', collect)
    const unsubCrit = gameEventBus.subscribe('CriticalHit', collect)
    const unsubHeal = gameEventBus.subscribe('Heal', collect)
    return () => { unsubAttack(); unsubCrit(); unsubHeal() }
  }, [])

  const flushFloatingDamages = useCallback(() => {
    const events = pendingEventsRef.current.splice(0)
    critTargetsRef.current.clear()
    const newFloats: FloatingDamage[] = []
    const newVfx: SpellVFX[] = []

    for (const evt of events) {
      if (evt.value == null || evt.target == null) continue
      const side = evt.target === 'player' ? 'player' : 'enemy'
      const dmgType = (evt.extra?.damageType as string | undefined) ?? 'physical'

      if (evt.type === 'CriticalHit') {
        critTargetsRef.current.add(evt.target)
        newFloats.push({ id: floatingIdRef.current++, amount: evt.value, kind: 'critical', targetSide: side })
        newVfx.push({ id: floatingIdRef.current++, kind: 'slash', targetSide: side })
        continue
      }
      if (evt.type === 'Attack') {
        if (critTargetsRef.current.has(evt.target)) continue
        newFloats.push({ id: floatingIdRef.current++, amount: evt.value, kind: dmgType === 'magical' ? 'magical' : 'physical', targetSide: side })
        newVfx.push({ id: floatingIdRef.current++, kind: dmgType === 'magical' ? 'burst' : 'slash', targetSide: side })
        continue
      }
      if (evt.type === 'Heal') {
        newFloats.push({ id: floatingIdRef.current++, amount: evt.value, kind: 'heal', targetSide: side })
        newVfx.push({ id: floatingIdRef.current++, kind: 'heal', targetSide: side })
      }
    }

    if (newFloats.length > 0) {
      setFloatingDamages(prev => [...prev, ...newFloats])
      let playerHit = false, enemyHit = false, playerCrit = false, enemyCrit = false
      for (const f of newFloats) {
        if (f.kind === 'heal') continue
        if (f.targetSide === 'player') { playerHit = true; if (f.kind === 'critical') playerCrit = true }
        else { enemyHit = true; if (f.kind === 'critical') enemyCrit = true }
      }
      if (playerHit) setHeroShake(prev => ({ count: prev.count + 1, intensity: playerCrit ? 2 : 1 }))
      if (enemyHit) setEnemyShake(prev => ({ count: prev.count + 1, intensity: enemyCrit ? 2 : 1 }))
    }
    if (newVfx.length > 0) {
      setVfxEffects(prev => [...prev, ...newVfx])
    }
  }, [])

  const removeFloatingDamage = useCallback((id: number) => {
    setFloatingDamages(prev => prev.filter(d => d.id !== id))
  }, [])

  const removeVfx = useCallback((id: number) => {
    setVfxEffects(prev => prev.filter(v => v.id !== id))
  }, [])

  const executeTurn = useCallback((newEngineState: CombatState, estadoFinal: BattleState) => {
    engineStateRef.current = newEngineState
    flushFloatingDamages()
    if (animTimerRef.current) clearTimeout(animTimerRef.current)
    animTimerRef.current = setTimeout(() => {
      setBattleState(estadoFinal)
      setVisualPlayerHp(estadoFinal.player.currentHp)
      setIsAnimating(false)
    }, 1200)
  }, [flushFloatingDamages])

  const handleExecuteAction = useCallback(async (index: number) => {
    if (isAnimating || isBattleOver) return

    const currentCharge = playerUltimateChargeRef.current
    const isUltimateSlot = index === player.abilities.length && battleState.ultimateSkill != null && currentCharge >= 100
    if (isUltimateSlot) {
      if (currentCharge < 100) return
    } else {
      if (player.abilities[index].currentCharges <= 0) return
    }

    setIsAnimating(true)
    setSelectedActionIndex(index)

    if (isUltimateSlot) {
      setPlayerUltimateCharge(0)
    }

    const abilityIndex = isUltimateSlot ? 0 : index
    const result = EngineBridge.selectAction(engineStateRef.current, battleState, abilityIndex)

    setPlayerUltimateCharge(prev => isUltimateSlot ? 0 : Math.min(100, prev + 20))

    executeTurn(result.engineState, result.uiState)
  }, [isAnimating, isBattleOver, player.abilities, battleState, executeTurn])

  const handleSelectAbility = useCallback((index: number) => {
    setSelectedActionIndex(index)
  }, [])

  const handleUseItem = useCallback((itemType: string) => {
    if (isAnimating || isBattleOver) return
    if (itemType === 'pocion-vida' && potions.pocionVida <= 0) return
    if (itemType === 'pocion-mana' && potions.pocionMana <= 0) return
    setIsAnimating(true)
    const result = EngineBridge.consumeItem(engineStateRef.current, battleState, itemType)
    executeTurn(result.engineState, result.uiState)
  }, [isAnimating, isBattleOver, potions, battleState, executeTurn])

  const handleReclaim = useCallback(() => { if (winner === 'player') onBattleEnd('player') }, [winner, onBattleEnd])
  const handleReturnFromDefeat = useCallback(() => { onBattleEnd('enemy') }, [onBattleEnd])

  // Keyboard shortcuts: 1-4 to execute, Q/W/E/R to select
  useEffect(() => {
    if (isBattleOver || isAnimating) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key
      const num = parseInt(key, 10)
      if (num >= 1 && num <= 4) {
        const idx = num - 1
        if (idx < player.abilities.length && player.abilities[idx].currentCharges > 0) {
          handleExecuteAction(idx)
        }
        return
      }
      if (num === 5 && battleState.ultimateSkill != null && playerUltimateCharge >= 100) {
        handleExecuteAction(player.abilities.length)
        return
      }
      const selectKeys: Record<string, number> = { q: 0, w: 1, e: 2, r: 3 }
      const qIdx = selectKeys[key.toLowerCase()]
      if (qIdx != null && qIdx < player.abilities.length) {
        setSelectedActionIndex(qIdx)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isBattleOver, isAnimating, player.abilities, handleExecuteAction, battleState.ultimateSkill, playerUltimateCharge])

  const playerEmoji = CLASS_EMOJIS[playerData.clase ?? ''] ?? '⚔️'
  const playerSpriteUrl = playerData.race && playerData.clase
    ? getCharacterSprite(playerData.race, playerData.clase, 'back')
    : ''
  const enemyEmoji = enemy.isBoss ? ENEMY_EMOJIS.boss : ENEMY_EMOJIS.default
  const isFrenzied = (enemy.affixes ?? []).includes('frenzy') && enemy.currentHp <= enemy.maxHp * 0.4

  const selectedSkill = playerData.fullSkills?.[selectedActionIndex] ?? null
  const selectedCharges = player.abilities[selectedActionIndex] ?? null

  const playerStats: StatBlock = playerData.stats as StatBlock
  const weaponDamage = playerData.weaponDamage ?? { min: 5, max: 10 }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 gothic-bg"
    >
      <div className="relative w-full max-w-5xl h-[95vh] sm:h-[640px] border-2 border-[var(--gothic-border)] rounded overflow-hidden select-none flex flex-col bg-[var(--gothic-bg-panel)]">
        <CombatHeader
          enemy={enemy} player={player} visualPlayerHp={visualPlayerHp}
          enemyShake={enemyShake} heroShake={heroShake}
          floatingDamages={floatingDamages} removeFloatingDamage={removeFloatingDamage}
          vfxEffects={vfxEffects} removeVfx={removeVfx}
          playerStatuses={playerStatuses} enemyStatuses={enemyStatuses}
          playerEmoji={playerEmoji} enemyEmoji={enemyEmoji} isFrenzied={isFrenzied}
          playerSpriteUrl={playerSpriteUrl}
          playerData={playerData}
          playerUltimateCharge={playerUltimateCharge}
          enemyUltimateCharge={enemyUltimateCharge}
          ultimateSkill={battleState.ultimateSkill}
          enemyUltimateSkill={battleState.enemy.ultimateSkill}
        />
        <div className="relative flex-1 border-t-2 border-[var(--gothic-nature)] flex flex-col sm:flex-row bg-[#0a0a0a] min-h-0">
          {/* Combat Log */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <CombatLog combatLog={combatLog} />
          </div>

          {/* Ability Bar + Detail Panel */}
          <div className="flex border-l-2 border-[var(--gothic-nature)]">
            <AbilityBar
              abilities={player.abilities}
              fullSkills={playerData.fullSkills}
              selectedActionIndex={selectedActionIndex}
              isAnimating={isAnimating}
              isBattleOver={isBattleOver}
              onExecute={handleExecuteAction}
              onSelect={handleSelectAbility}
              ultimateSkill={battleState.ultimateSkill}
              ultimateCharge={playerUltimateCharge}
            />
            <AbilityDetailPanel
              skill={selectedSkill}
              charges={selectedCharges}
              playerStats={playerStats}
              weaponDamage={weaponDamage}
              isAnimating={isAnimating}
              isBattleOver={isBattleOver}
              onExecute={handleExecuteAction}
              skillIndex={selectedActionIndex}
            />
          </div>

          {/* Potion bar at bottom of log area */}
          {!isBattleOver && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-2 pointer-events-none">
              <div className="flex gap-2 pointer-events-auto">
                <button
                  onClick={() => handleUseItem('pocion-vida')}
                  disabled={isAnimating || potions.pocionVida <= 0}
                  className={`px-3 py-1 text-[10px] font-[var(--font-pixel)] border rounded
                    ${potions.pocionVida > 0 && !isAnimating
                      ? 'border-[#30a030] bg-[#0a1a0a] text-[#30a030] hover:bg-[#1a2a1a] cursor-pointer'
                      : 'border-[#2a2a1a] bg-[#0a0a08] text-[#4a4a2a] cursor-not-allowed opacity-40'
                    }`}
                >
                  ❤ Vida ({potions.pocionVida})
                </button>
                <button
                  onClick={() => handleUseItem('pocion-mana')}
                  disabled={isAnimating || potions.pocionMana <= 0}
                  className={`px-3 py-1 text-[10px] font-[var(--font-pixel)] border rounded
                    ${potions.pocionMana > 0 && !isAnimating
                      ? 'border-[#3060c0] bg-[#0a0a1a] text-[#3060c0] hover:bg-[#1a1a2a] cursor-pointer'
                      : 'border-[#2a2a1a] bg-[#0a0a08] text-[#4a4a2a] cursor-not-allowed opacity-40'
                    }`}
                >
                  ✦ Cargas ({potions.pocionMana})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <VictoryModal
        showModal={showModal} winner={winner}
        goldReward={goldReward} expReward={expReward}
        lootItem={lootItem} isBonusBoss={isBonusBoss}
        onReclaim={handleReclaim} onDefeat={handleReturnFromDefeat}
      />
    </motion.div>
  )
}
