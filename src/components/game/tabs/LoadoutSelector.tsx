import { useGameStore, dispatch } from '@/store/GameStore'
import { GothicButton } from '@/components/common/GothicButton'
import { GothicFrame } from '@/components/ui/GothicFrame'

interface LoadoutProfile {
  key: string
  label: string
  icon: string
}

const LOADOUTS: LoadoutProfile[] = [
  { key: 'tank', label: 'Tanque', icon: '\u{1F6E1}\uFE0F' },
  { key: 'dps', label: 'DPS', icon: '\u{2694}\uFE0F' },
  { key: 'pvp', label: 'PvP', icon: '\u26A1' },
]

export function LoadoutSelector() {
  const { character } = useGameStore()
  if (!character) return null

  const loadouts = character.loadouts ?? {} as Record<string, Record<string, string>>

  const handleSave = (name: string) => {
    dispatch({ type: 'SAVE_LOADOUT', payload: { name } })
  }

  const handleEquip = (name: string) => {
    dispatch({ type: 'EQUIP_LOADOUT', payload: { name } })
  }

  return (
    <GothicFrame title="Conjuntos" className="w-full">
      <div className="grid grid-cols-3 gap-2">
        {LOADOUTS.map(({ key, label, icon }) => {
          const saved: Record<string, string> | undefined = (loadouts as Record<string, Record<string, string> | undefined>)[key]
          const savedCount = saved != null ? Object.keys(saved).length : 0

          return (
            <div
              key={key}
              className="flex flex-col items-center gap-1 p-2 border border-[var(--gothic-border)] bg-[#1a1210] text-center"
            >
              <span className="text-base">{icon}</span>
              <span className="text-[var(--gothic-gold-copper)] text-[9px] font-[var(--font-pixel)] uppercase tracking-wider leading-none">
                {label}
              </span>
              {saved != null ? (
                <span className="text-[var(--gothic-text-dim)] text-[7px] leading-none">
                  {savedCount} {savedCount === 1 ? 'pieza' : 'piezas'}
                </span>
              ) : (
                <span className="text-[var(--gothic-text-dim)] text-[7px] leading-none">Vacio</span>
              )}
              <div className="flex gap-0.5 mt-1 w-full">
                <GothicButton
                  variant="wow-gold"
                  size="sm"
                  className="flex-1 text-[7px] py-0.5 px-1"
                  onClick={() => handleSave(key)}
                >
                  Guardar
                </GothicButton>
                {saved != null && (
                  <GothicButton
                    variant="wow"
                    size="sm"
                    className="flex-1 text-[7px] py-0.5 px-1"
                    onClick={() => handleEquip(key)}
                  >
                    Equipar
                  </GothicButton>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </GothicFrame>
  )
}
