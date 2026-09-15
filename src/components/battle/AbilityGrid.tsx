import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AbilityButton = React.memo(function AbilityButton({ ability, index, selectedActionIndex, isAnimating, isBattleOver, onExecute }: {
  ability: { name: string; currentCharges: number; maxCharges: number }
  index: number
  selectedActionIndex: number
  isAnimating: boolean
  isBattleOver: boolean
  onExecute: (index: number) => void
}) {
  const isSelected = selectedActionIndex === index
  const hasCharges = ability.currentCharges > 0
  const disabled = isAnimating || isBattleOver || !hasCharges

  return (
    <motion.button
      onClick={() => onExecute(index)}
      disabled={disabled}
      aria-label={`${ability.name}, ${ability.currentCharges} de ${ability.maxCharges} usos`}
      tabIndex={0}
      whileHover={disabled ? undefined : { scale: 1.03, borderColor: '#d4a017' }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      className={`
        relative flex flex-col justify-between p-2 rounded border-2 cursor-pointer select-none
        min-h-[3rem]
        ${isSelected
          ? 'border-[var(--gothic-nature-light)] bg-[#1a4a1a] text-[var(--gothic-text)]'
          : 'border-[var(--gothic-nature)] bg-[#0a0a0a] text-[#a0a090]'
        }
        ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : ''}
        focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--gothic-nature-light)]
      `}
    >
      {isSelected && (
        <span className="absolute -left-0.5 top-1/2 -translate-y-1/2 text-[var(--gothic-nature-light)] font-bold text-xs animate-pulse" aria-hidden="true">
          ▶
        </span>
      )}
      <span className="text-[10px] font-[var(--font-pixel)] tracking-wider pl-2 truncate">{ability.name}</span>
      <div className="flex justify-between items-center pl-2">
        <span className="text-[9px] text-[#6a8a3a]">
          PP {ability.currentCharges}/{ability.maxCharges}
        </span>
      </div>
    </motion.button>
  )
})

const BolsaDropdown = React.memo(function BolsaDropdown({ potions, isAnimating, onUseItem }: {
  potions: { pocionVida: number; pocionMana: number }
  isAnimating: boolean
  onUseItem: (itemType: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const hasAnyPotion = potions.pocionVida > 0 || potions.pocionMana > 0
  const toggleDisabled = isAnimating || !hasAnyPotion
  const vidaDisabled = isAnimating || potions.pocionVida <= 0
  const manaDisabled = isAnimating || potions.pocionMana <= 0

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        disabled={toggleDisabled}
        whileHover={toggleDisabled ? undefined : { scale: 1.03, borderColor: '#d4a017' }}
        whileTap={toggleDisabled ? undefined : { scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        className={`w-full py-1.5 px-2 text-[10px] font-[var(--font-pixel)] tracking-wider uppercase border-2 rounded cursor-pointer select-none
          ${hasAnyPotion && !isAnimating
            ? 'border-[var(--gothic-text-dim)] bg-[#1a1210] text-[#e0d0b0]'
            : 'border-[#2a3a1a] bg-[#0a0a0a] text-[var(--gothic-nature)] cursor-not-allowed opacity-40 grayscale'
          }
        `}
      >
        Bolsa {isOpen ? '▲' : '▼'}
      </motion.button>
      <AnimatePresence>
        {isOpen && hasAnyPotion && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute bottom-full left-0 right-0 mb-1 border-2 border-[#5a4030] bg-[#0a0a0a] rounded z-10"
          >
            <motion.button
              onClick={() => { onUseItem('pocion-vida'); setIsOpen(false) }}
              disabled={vidaDisabled}
              whileHover={vidaDisabled ? undefined : { scale: 1.03, borderColor: '#d4a017' }}
              whileTap={vidaDisabled ? undefined : { scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className={`w-full py-1.5 px-2 text-left text-[10px] font-[var(--font-pixel)] tracking-wider border-b border-[#3a3020] cursor-pointer select-none
                ${potions.pocionVida > 0 && !isAnimating
                  ? 'text-[#30a030]'
                  : 'text-[#4a4a2a] cursor-not-allowed opacity-40 grayscale'
                }
              `}
            >
              ❤ Vida ({potions.pocionVida})
            </motion.button>
            <motion.button
              onClick={() => { onUseItem('pocion-mana'); setIsOpen(false) }}
              disabled={manaDisabled}
              whileHover={manaDisabled ? undefined : { scale: 1.03, borderColor: '#d4a017' }}
              whileTap={manaDisabled ? undefined : { scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className={`w-full py-1.5 px-2 text-left text-[10px] font-[var(--font-pixel)] tracking-wider cursor-pointer select-none
                ${potions.pocionMana > 0 && !isAnimating
                  ? 'text-[#3060c0]'
                  : 'text-[#4a4a2a] cursor-not-allowed opacity-40 grayscale'
                }
              `}
            >
              ✦ Cargas ({potions.pocionMana})
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

interface AbilityGridProps {
  abilities: { name: string; currentCharges: number; maxCharges: number }[]
  selectedActionIndex: number
  isAnimating: boolean
  isBattleOver: boolean
  onExecute: (index: number) => void
  potions: { pocionVida: number; pocionMana: number }
  onUseItem: (itemType: string) => void
}

export function AbilityGrid({
  abilities, selectedActionIndex, isAnimating, isBattleOver,
  onExecute, potions, onUseItem,
}: AbilityGridProps) {
  return (
    <div className="w-full sm:w-[280px] p-2 grid grid-cols-2 gap-1.5 relative bg-[#0a0a0a]">
      {abilities.map((ability, index) => (
        <AbilityButton
          key={index}
          ability={ability}
          index={index}
          selectedActionIndex={selectedActionIndex}
          isAnimating={isAnimating}
          isBattleOver={isBattleOver}
          onExecute={onExecute}
        />
      ))}
      {!isBattleOver && (
        <div className="col-span-2 mt-1">
          <BolsaDropdown
            potions={potions}
            isAnimating={isAnimating}
            onUseItem={onUseItem}
          />
        </div>
      )}
    </div>
  )
}
