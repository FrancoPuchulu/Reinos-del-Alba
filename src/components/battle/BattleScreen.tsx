import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { EngineBridge, type BattleState } from '../../game/enginebridge'
import { gameEventBus, type GameEvent } from '../../events/EventBus'
import type { CombatState } from '../../types/combat'
import type { InventoryItem } from '../../types/game.types'
import { CLASS_EMOJIS, ENEMY_EMOJIS, type PlayerInputData, type EnemyInputData, type FloatingDamage, type SpellVFX } from './types'
import { getCharacterSprite } from '@/data/sprites'
import { CombatHeader } from './CombatHeader'
import { AbilityGrid } from './AbilityGrid'
import { CombatLog } from './CombatLog'
import { VictoryModal } from './VictoryModal'

interface BattleScreenProps {
  playerData: PlayerInputData
  enemyData: EnemyInputData
  onBattleEnd: (winner: 'player' | 'enemy') => void
  lootItem?: InventoryItem
  isBonusBoss?: boolean
}

export const BattleScreen: React.FC<BattleScreenProps> = ({ playerData, enemyData, onBattleEnd, lootItem, isBonusBoss }) => {
  const [initialCombat] = useState(() => EngineBridge.startNewBattle(
    { ...playerData, stats: playerData.stats as Record<string, number> },
    { ...enemyData, stats: enemyData.stats as Record<string, number> }
  ))

  const [battleState, setBattleState] = useState<BattleState>(initialCombat.uiState)
  const engineStateRef = useRef<CombatState>(initialCombat.engineState)

  const [selectedActionIndex] = useState<number>(0)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)
  const [showModal, setShowModal] = useState<boolean>(false)
  const { player, enemy, combatLog, isBattleOver, winner, potions, playerStatuses, enemyStatuses } = battleState

  const [visualPlayerHp, setVisualPlayerHp] = useState<number>(player.currentHp)
  const visualPlayerHpRef = useRef<number>(player.currentHp)
  useEffect(() => { visualPlayerHpRef.current = visualPlayerHp }, [visualPlayerHp])

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
    setBattleState(_prev => ({
      ...estadoFinal,
      player: { ...estadoFinal.player, currentHp: visualPlayerHpRef.current },
      combatLog: [estadoFinal.combatLog[estadoFinal.combatLog.length - 2] || 'Atacas!']
    }))
    if (animTimerRef.current) clearTimeout(animTimerRef.current)
    animTimerRef.current = setTimeout(() => {
      setBattleState(estadoFinal)
      setVisualPlayerHp(estadoFinal.player.currentHp)
      setIsAnimating(false)
    }, 1200)
  }, [flushFloatingDamages])

  const handleExecuteAction = useCallback(async (index: number) => {
    if (isAnimating || isBattleOver || player.abilities[index].currentCharges <= 0) return
    setIsAnimating(true)
    const result = EngineBridge.selectAction(engineStateRef.current, battleState, index)
    executeTurn(result.engineState, result.uiState)
  }, [isAnimating, isBattleOver, player.abilities, battleState, executeTurn])

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

  const playerEmoji = CLASS_EMOJIS[playerData.clase ?? ''] ?? '⚔️'
  const playerSpriteUrl = playerData.race && playerData.clase
    ? getCharacterSprite(playerData.race, playerData.clase, 'back')
    : ''
  const enemyEmoji = enemy.isBoss ? ENEMY_EMOJIS.boss : ENEMY_EMOJIS.default
  const isFrenzied = (enemy.affixes ?? []).includes('frenzy') && enemy.currentHp <= enemy.maxHp * 0.4

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 gothic-bg"
    >
      <div className="relative w-full max-w-4xl h-[95vh] sm:h-[640px] border-2 border-[var(--gothic-border)] rounded overflow-hidden select-none flex flex-col bg-[var(--gothic-bg-panel)]">
        <CombatHeader
          enemy={enemy} player={player} visualPlayerHp={visualPlayerHp}
          enemyShake={enemyShake} heroShake={heroShake}
          floatingDamages={floatingDamages} removeFloatingDamage={removeFloatingDamage}
          vfxEffects={vfxEffects} removeVfx={removeVfx}
          playerStatuses={playerStatuses} enemyStatuses={enemyStatuses}
          playerEmoji={playerEmoji} enemyEmoji={enemyEmoji} isFrenzied={isFrenzied}
          playerSpriteUrl={playerSpriteUrl}
          playerData={playerData}
          playerUltimateCharge={player.ultimateCharge ?? 0}
          enemyUltimateCharge={enemy.ultimateCharge ?? 0}
          ultimateSkill={battleState.ultimateSkill ?? null}
          enemyUltimateSkill={battleState.enemy.ultimateSkill ?? null}
        />
        <div className="relative h-52 sm:h-44 border-t-2 border-[var(--gothic-nature)] flex flex-col sm:flex-row bg-[#0a0a0a]">
          <CombatLog combatLog={combatLog} />
          <AbilityGrid
            abilities={player.abilities} selectedActionIndex={selectedActionIndex}
            isAnimating={isAnimating} isBattleOver={isBattleOver}
            onExecute={handleExecuteAction} potions={potions} onUseItem={handleUseItem}
          />
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
