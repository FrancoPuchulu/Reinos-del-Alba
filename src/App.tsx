import React, { useState, useEffect, Suspense, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { GameProvider, useGameStore } from '@/store/GameStore'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { SplashScreen } from '@/components/common/SplashScreen'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PageTransition } from '@/components/common/PageTransition'
import { dispatch } from '@/store/GameStore'
import { classAbilities, getUltimateForClass } from '@/data/gameData'
import { generateEnemyForLevel } from './game/enemies'
import { generateLoot } from './game/loot'
import { generatePvPLoot } from './utils/smartLoot'
import { BASE_STATS_CLASES } from './game/config'
import { consumePendingPvpRival, getConsumedPvpRival, clearConsumedPvpRival } from './game/pvpRivalState'
import type { Skill } from './types/game.types'
import type { EnemyAbility } from './types/combat'

const LoginScreen = React.lazy(() => import('@/components/login/LoginScreen').then(m => ({ default: m.LoginScreen })))
const CharacterCreationScreen = React.lazy(() => import('@/components/creation/CharacterCreationScreen').then(m => ({ default: m.CharacterCreationScreen })))
const GameScreen = React.lazy(() => import('@/components/game/GameScreen'))
const ShopScreen = React.lazy(() => import('@/components/game/ShopScreen'))
const BattleScreen = React.lazy(() => import('@/components/combat/CombatScreen').then(m => ({ default: m.CombatScreen })))

type GeneratedEnemy = ReturnType<typeof generateEnemyForLevel>

function getEquippedSkills(charClass: string, equippedIds: string[]): Skill[] {
  const classData = classAbilities[charClass as keyof typeof classAbilities]
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- cast ensures key exists at type level but not runtime
  if (!classData) return []
  const allSkills: Skill[] = []
  for (const style of Object.values(classData)) {
    for (const skill of style.skills) {
      allSkills.push(skill)
    }
  }
  if (equippedIds.length > 0) {
    return equippedIds.map(id => allSkills.find(s => s.id === id)).filter((s): s is Skill => s != null)
  }
  return allSkills.filter(s => s.unlockLevel <= 1).slice(0, 4)
}

function getEquippedUltimate(charClass: string, ultimateEquipped?: string): Skill | null {
  if (!ultimateEquipped) return null
  const ultimate = getUltimateForClass(charClass)
  if (ultimate && ultimate.id === ultimateEquipped) return ultimate
  return null
}

function AppContent() {
  const { screen, character, expedition } = useGameStore()
  const [pendingEnemy, setPendingEnemy] = useState<GeneratedEnemy | null>(null)
  const [pendingLoot, setPendingLoot] = useState<ReturnType<typeof generateLoot> | null>(null)
  const prevScreenRef = useRef<string>(screen)
  const isBonusBoss = screen === 'battle' && !!expedition?.bonusBossReady
  const bonusBossData = expedition?.bonusBossData ?? null

  useEffect(() => {
    if (screen === 'battle' && prevScreenRef.current !== 'battle' && character) {
      /* eslint-disable react-hooks/set-state-in-effect -- intentional: generate enemies/loot on battle entry */
      const rival = consumePendingPvpRival()
      if (rival) {
        setPendingLoot(generatePvPLoot(character.class, rival.rewards.itemRarity))
      } else if (!bonusBossData) {
        setPendingEnemy(generateEnemyForLevel(character.level))
        setPendingLoot(generateLoot(character.level, character.class))
      }
      /* eslint-enable react-hooks/set-state-in-effect */
    }
    prevScreenRef.current = screen
  }, [screen, character, bonusBossData])

  const battleSkills = character ? getEquippedSkills(character.class, character.skills.equipped) : []
  const equippedUltimate = character ? getEquippedUltimate(character.class, character.ultimateEquipped) : null
  const consumedRival = screen === 'battle' ? getConsumedPvpRival() : null

  return (
    <div className="w-screen h-screen overflow-hidden gothic-bg">
      <Suspense fallback={<div className="w-screen h-screen flex items-center justify-center gothic-bg"><LoadingSpinner size="lg" label="Cargando..." /></div>}>
        <AnimatePresence mode="wait">
          {screen === 'login' && (
            <PageTransition key="login">
              <LoginScreen />
            </PageTransition>
          )}
          {screen === 'creation' && (
            <PageTransition key="creation">
              <CharacterCreationScreen />
            </PageTransition>
          )}
          {screen === 'game' && (
            <PageTransition key="game">
              <GameScreen />
            </PageTransition>
          )}
          {screen === 'shop' && (
            <PageTransition key="shop">
              <ShopScreen />
            </PageTransition>
          )}
          {screen === 'battle' && character && (
            <PageTransition key="battle">
              <BattleScreen
              key="battle"
              playerData={{
                id: 'player',
                name: character.name,
                clase: character.class,
                race: character.race,
                level: character.level,
                stats: character.stats as Record<string, number>,
                habilidades: battleSkills.map(skill => ({
                  id: skill.id,
                  nombre: skill.name,
                  cargas: skill.maxCharges,
                  cargasMaximas: skill.maxCharges
                })),
                fullSkills: equippedUltimate
                  ? [...battleSkills, equippedUltimate]
                  : battleSkills,
                weaponDamage: character.equipment.armaPrincipal?.damage ?? { min: 5, max: 10 },
                hpMod: BASE_STATS_CLASES[character.class].hpMod,
              }}
              enemyData={bonusBossData ? {
                id: 'bonus_boss',
                name: bonusBossData.name,
                clase: bonusBossData.className,
                level: bonusBossData.level,
                stats: bonusBossData.stats as Record<string, number>,
                maxHp: bonusBossData.maxHp,
                hp: bonusBossData.currentHp,
                abilities: bonusBossData.abilities as EnemyAbility[],
                isBoss: true
              } : consumedRival ? {
                id: consumedRival.id,
                name: consumedRival.name,
                clase: consumedRival.spriteKey.split('-')[1],
                level: consumedRival.level,
                stats: {
                  fuerza: consumedRival.stats.attack,
                  vitalidad: consumedRival.stats.health / 5,
                  armadura: consumedRival.stats.defense,
                  velocidad: consumedRival.stats.speed,
                },
                maxHp: consumedRival.stats.maxHealth,
                hp: consumedRival.stats.health,
                abilities: [] as EnemyAbility[],
                ultimateSkill: getUltimateForClass(consumedRival.spriteKey.split('-')[1]) ?? null,
              } : (() => {
                const e = pendingEnemy
                if (!e) return { id: 'loading', name: '...', clase: '...', level: 1, stats: {} as Record<string, number>, maxHp: 1, hp: 1, abilities: [] as EnemyAbility[] }
                return {
                  id: 'enemy',
                  name: e.name,
                  clase: e.className,
                  level: e.level,
                  stats: e.stats,
                  maxHp: e.maxHp,
                  hp: e.currentHp,
                  abilities: e.abilities as EnemyAbility[]
                }
              })()}
              onBattleEnd={(winner) => {
                if (consumedRival) {
                  dispatch({ type: 'RECORD_PVP_RESULT', payload: { won: winner === 'player', opponentElo: consumedRival.level * 100 } })
                  if (winner === 'player') {
                    dispatch({ type: 'ADD_EXPERIENCE', payload: consumedRival.rewards.experience })
                    if (pendingLoot) {
                      dispatch({ type: 'ADD_ITEM_TO_INVENTORY', payload: pendingLoot })
                    }
                  }
                  clearConsumedPvpRival()
                } else if (winner === 'player') {
                  dispatch({ type: 'FINISH_EXPEDITION' })
                } else {
                  dispatch({ type: 'DEFEAT_PENALTY' })
                }
                dispatch({ type: 'SET_COMBAT', payload: null })
                dispatch({ type: 'SET_SCREEN', payload: 'game' })
              }}
              lootItem={pendingLoot ?? undefined}
              isBonusBoss={isBonusBoss}
            />
            </PageTransition>
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 500)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) document.documentElement.setAttribute('data-reduce-motion', 'true')
  }, [])

  return (
    <ErrorBoundary>
      <GameProvider>
        <AnimatePresence mode="wait">
          {!ready ? (
            <PageTransition key="splash">
              <SplashScreen />
            </PageTransition>
          ) : (
            <PageTransition key="app">
              <AppContent />
            </PageTransition>
          )}
        </AnimatePresence>
      </GameProvider>
    </ErrorBoundary>
  )
}
