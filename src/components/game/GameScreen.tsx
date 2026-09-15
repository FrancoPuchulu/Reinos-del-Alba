import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, dispatch } from '@/store/GameStore'
import { GothicButton } from '@/components/common/GothicButton'
import TopNavBar from '@/components/ui/TopNavBar'
import AdventureTab from './tabs/AdventureTab'
import InventoryTab from './tabs/InventoryTab'
import TalentsTab from './tabs/TalentsTab'
import RaidTab from './tabs/RaidTab'
import { LevelUpNotification, CharacterHeader, PaperDoll, WeaponPaperDoll, ExperienceBar, CharacterStats, SkillsPanel } from './tabs/shared'

type ActiveTab = 'book' | 'inventory' | 'talents' | 'raids'

export default function GameScreen() {
  const { character } = useGameStore()
  const [activeTab, setActiveTab] = useState<ActiveTab>('book')

  if (!character) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 gothic-bg"
    >
      <TopNavBar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as ActiveTab)} />
      <LevelUpNotification />
      <div className="flex flex-col h-full overflow-hidden pt-10">
        <div className="flex-1 overflow-hidden max-w-7xl mx-auto w-full">
          {activeTab === 'inventory' ? (
            /* ═══ Symmetric character/inventory layout — WoW/Diablo style ═══ */
            <InventoryTab />
          ) : activeTab === 'raids' ? (
            <RaidTab />
          ) : (
            /* ═══ Normal sidebar layout for Adventures / Talents ═══ */
            <div className="flex flex-col lg:flex-row h-full">
              {/* Left Panel — Character */}
              <div className="w-full lg:w-[380px] flex-shrink-0 overflow-y-auto wow-scroll border-r-2 border-[var(--wow-border)] bg-[var(--wow-bg-panel)]">
                <div className="p-3">
                  <CharacterHeader />
                  <div className="mt-3">
                    <PaperDoll />
                    <WeaponPaperDoll />
                  </div>
                  <ExperienceBar />
                  <CharacterStats />
                  <SkillsPanel />
                  <div className="mt-3 space-y-1.5">
                    <GothicButton
                      variant="wow-gold"
                      size="sm"
                      fullWidth
                      onClick={() => dispatch({ type: 'SET_SCREEN', payload: 'shop' })}
                    >
                      &#9878; El Yunque Quebrado
                    </GothicButton>
                    <button
                      onClick={() => dispatch({ type: 'LOGOUT' })}
                      aria-label="Cerrar sesion"
                      className="w-full py-1.5 text-center text-[9px] tracking-widest uppercase border-2 border-[#4a4a3a] bg-[#1a1a1a] text-[var(--gothic-text-dim)] hover:text-[#d03030] hover:border-[#d03030] transition-all cursor-pointer font-[var(--font-pixel)]"
                    >
                      Cerrar Sesion
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Panel — Tab Content */}
              <div className="flex-1 overflow-y-auto wow-scroll p-3">
                <AnimatePresence mode="wait">
                  {activeTab === 'book' && (
                    <motion.div
                      key="adventure"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                    >
                      <AdventureTab />
                    </motion.div>
                  )}

                  {activeTab === 'talents' && (
                    <motion.div
                      key="talents"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                      role="tabpanel"
                      aria-label="Talentos"
                    >
                      <TalentsTab />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
