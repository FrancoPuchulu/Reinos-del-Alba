import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, dispatch } from '@/store/GameStore'
import { GothicButton } from '@/components/common/GothicButton'
import { GothicFrame } from '@/components/ui/GothicFrame'
import { talentTree, getUltimateForClass } from '@/data/gameData'
import type { Talent } from '@/types/game'

const TIER_LABELS = ['I', 'II', 'III', 'IV']

interface BranchDef {
  key: string
  label: string
  color: string
}

const BRANCHES: BranchDef[] = [
  { key: 'ofensiva', label: 'Ofensiva', color: '#c03030' },
  { key: 'maestria', label: 'Maestria', color: '#3060c0' },
  { key: 'supervivencia', label: 'Supervivencia', color: '#30a030' },
]

interface TalentNodeDef {
  talent: Talent
  col: number
  row: number
  branch: BranchDef
}

function getTalentNodes(): TalentNodeDef[] {
  const nodes: TalentNodeDef[] = []
  for (const talent of talentTree) {
    const col = talent.branch === 'central' ? 1 : BRANCHES.findIndex(b => b.key === talent.branch)
    if (col === -1) continue
    const row = talent.tier - 1
    const branch = talent.branch === 'central'
      ? { key: 'central', label: 'Capstone', color: 'var(--gothic-gold-copper)' }
      : BRANCHES[col]
    nodes.push({ talent, col, row, branch })
  }
  return nodes
}

const NODES = getTalentNodes()

function getNodeState(talent: Talent, learned: string[], points: number): 'learned' | 'available' | 'locked' {
  if (learned.includes(talent.id)) return 'learned'
  if (points < talent.cost) return 'locked'
  if (talent.requires !== undefined && talent.requires.length > 0 && !talent.requires.every(r => learned.includes(r))) return 'locked'
  return 'available'
}

const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  ofensiva: { bg: '#3a1010', border: '#802020', text: '#e04040' },
  maestria: { bg: '#0c1a38', border: '#2040a0', text: '#4080e0' },
  supervivencia: { bg: '#0c2a10', border: '#208020', text: '#40c040' },
  central: { bg: '#2a2010', border: '#a08020', text: '#e0c040' },
}

function getColor(branchKey: string) {
  return NODE_COLORS[branchKey] ?? NODE_COLORS.central
}

const STATE_STYLES: Record<string, string> = {
  learned: 'scale-105 shadow-[0_0_14px_rgba(192,144,64,0.45)]',
  available: 'animate-pulse-glow cursor-pointer',
  locked: 'opacity-40 grayscale-[0.3]',
}

const CONNECTOR_COLOR = 'var(--gothic-border)'

function TalentTooltip({ talent, state }: { talent: Talent; state: string }) {
  const learned = state === 'learned'
  const effects: string[] = []
  if (talent.stat && talent.amount) effects.push(`+${talent.amount} ${talent.stat}`)
  if (talent.statMix) {
    for (const [k, v] of Object.entries(talent.statMix)) effects.push(`+${v} ${k}`)
  }
  if (talent.allStats) effects.push(`+${talent.allStats} a todos`)
  if (talent.chargesBonus) effects.push(`+${talent.chargesBonus} cargas`)

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-52 pointer-events-none"
    >
      <div className="border-2 border-[#5a4030] bg-[#0c0a06] p-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
        <div className="text-[10px] font-[var(--font-pixel)] tracking-wider mb-1"
          style={{ color: getColor(talent.branch).text }}>
          {talent.name}
        </div>
        <p className="text-[var(--gothic-text-dim)] text-[10px] leading-relaxed mb-1.5">{talent.description}</p>
        {effects.length > 0 && (
          <div className="border-t border-[#2a1c14] pt-1 mb-1 space-y-0.5">
            {effects.map((e, i) => (
              <div key={i} className="text-[#30a030] text-[10px]">&#9650; {e}</div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between text-[10px] border-t border-[#2a1c14] pt-1">
          <span className="text-[var(--gothic-text-dim)]">Costo: {talent.cost} ptos</span>
          {learned ? (
            <span className="text-[var(--gothic-gold-copper)]">&#10003; Aprendido</span>
          ) : (
            <span className="text-[var(--gothic-text-dim)]">
              {talent.requires !== undefined && talent.requires.length > 0 ? `Requiere: ${talent.requires.length} nodo(s)` : 'Sin requisitos'}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function TalentNode({ node, learned, points }: {
  node: TalentNodeDef; learned: string[]; points: number
}) {
  const [hovered, setHovered] = useState(false)
  const state = getNodeState(node.talent, learned, points)
  const colors = getColor(node.branch.key)

  const handleLearn = () => {
    if (state === 'learned' || state === 'locked') return
    dispatch({ type: 'LEARN_TALENT', payload: { id: node.talent.id, cost: node.talent.cost } })
  }

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ left: `${node.col * 33.33 + 16.67}%`, top: `${node.row * 25 + 5}%`, transform: 'translate(-50%, -50%)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && <TalentTooltip talent={node.talent} state={state} />}
      </AnimatePresence>
      <button
        onClick={handleLearn}
        disabled={state !== 'available'}
        className={`relative w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-300 ${STATE_STYLES[state]}`}
        style={{ backgroundColor: colors.bg, borderColor: state === 'learned' ? 'var(--gothic-gold-copper)' : colors.border }}
        aria-label={node.talent.name}
      >
        <span className="text-base leading-none">{node.talent.branch === 'ofensiva' ? '\u2694\uFE0F' : node.talent.branch === 'maestria' ? '\u{1F4A0}' : node.talent.branch === 'supervivencia' ? '\u{1F6E1}\uFE0F' : '\u2B50'}</span>
        {state === 'learned' && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[var(--gothic-gold-copper)] flex items-center justify-center text-[10px] text-[#1a1210] font-bold leading-none">&#10003;</span>
        )}
        {state === 'locked' && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#2a1c14] flex items-center justify-center text-[10px] leading-none">&#128274;</span>
        )}
      </button>
      <span className="text-[10px] text-center mt-1 leading-tight max-w-[70px] font-[var(--font-pixel)]"
        style={{ color: state === 'learned' ? 'var(--gothic-gold-copper)' : state === 'available' ? colors.text : 'var(--gothic-text-dim)' }}>
        {node.talent.name}
      </span>
    </div>
  )
}

function ConnectorLine({ from, to }: { from: { x: number; y: number }; to: { x: number; y: number } }) {
  const midY = (from.y + to.y) / 2
  return (
    <path
      d={`M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`}
      fill="none"
      stroke={CONNECTOR_COLOR}
      strokeWidth={2}
    />
  )
}

const RESOURCE_COLORS: Record<string, string> = {
  'Ira': '#c03030',
  'Maná Ancestral': '#3060c0',
  'Energía Vital': '#30a030',
  'Infernalidad': '#8030b0',
}

function UltimateSection({ characterClass }: { characterClass: string }) {
  const { character } = useGameStore()
  const ultimateSkill = getUltimateForClass(characterClass)
  if (!ultimateSkill || !character) return null

  const isEquipped = character.ultimateEquipped === ultimateSkill.id
  const resourceColor = RESOURCE_COLORS[ultimateSkill.ultimateResource ?? ''] ?? '#c09040'

  const handleToggle = () => {
    if (isEquipped) {
      dispatch({ type: 'UNEQUIP_ULTIMATE' })
    } else {
      dispatch({ type: 'EQUIP_ULTIMATE', payload: ultimateSkill.id })
    }
  }

  return (
    <div className="border-2 border-amber-800/40 bg-gradient-to-b from-[#1a1510] to-[#0c0a06] rounded overflow-hidden">
      <div className="px-3 py-2 border-b border-amber-800/30 bg-[#1a1510]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-lg">★</span>
            <span className="text-[var(--gothic-gold-copper)] text-[10px] font-[var(--font-pixel)] tracking-wider uppercase">
              Habilidad Definitiva
            </span>
          </div>
          <span className="text-[9px] font-[var(--font-pixel)] tracking-wider uppercase" style={{ color: resourceColor }}>
            {isEquipped ? '★ Equipada' : 'Sin equipar'}
          </span>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded border-2 flex items-center justify-center shrink-0"
            style={{
              borderColor: isEquipped ? '#d4a017' : resourceColor,
              backgroundColor: `${resourceColor}15`,
              boxShadow: isEquipped ? '0 0 12px rgba(212,160,23,0.3)' : 'none',
            }}
          >
            <span className="text-xl font-[var(--font-pixel)]" style={{ color: isEquipped ? '#d4a017' : resourceColor }}>
              ★
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-[var(--font-pixel)] tracking-wider" style={{ color: 'var(--gothic-gold-copper)' }}>
              {ultimateSkill.name}
            </h4>
            <p className="text-[10px] text-[var(--gothic-text-dim)] italic mt-0.5">
              {ultimateSkill.effect}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-[9px]">
              <span style={{ color: resourceColor }}>{ultimateSkill.ultimateResource}</span>
              <span className="text-[var(--gothic-text-dim)]">+20% / turno</span>
              <span className="text-[var(--gothic-text-dim)]">{ultimateSkill.baseDamage ?? 0} daño base</span>
            </div>
          </div>

          {/* Toggle Button */}
          <GothicButton
            variant={isEquipped ? 'blood' : 'wow-gold'}
            size="sm"
            onClick={handleToggle}
          >
            {isEquipped ? '✕ Quitar' : '★ Equipar'}
          </GothicButton>
        </div>

        <p className="text-[9px] text-[var(--gothic-text-dim)] mt-2 text-center">
          Se carga durante el combate. Al 100%, aparece como 5ª habilidad en la barra (tecla <kbd className="px-1 py-0.5 bg-[#1a1210] border border-[var(--gothic-border)] rounded font-mono">5</kbd>).
        </p>
      </div>
    </div>
  )
}

export default function TalentsTab() {
  const { character } = useGameStore()
  const treeRef = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<Array<{ from: { x: number; y: number }; to: { x: number; y: number } }>>([])

  const recalc = useCallback(() => {
    const tree = treeRef.current
    if (!tree) return
    const treeRect = tree.getBoundingClientRect()
    const newLines: typeof lines = []

    for (const node of NODES) {
      if (!node.talent.requires) continue
      for (const reqId of node.talent.requires) {
        const parent = NODES.find(n => n.talent.id === reqId)
        if (!parent) continue
        const gridEl = tree.children[0] as HTMLElement | undefined
        const pCol = gridEl?.children[parent.col] as HTMLElement | undefined
        const cCol = gridEl?.children[node.col] as HTMLElement | undefined
        const pEl = pCol?.children[parent.row] as HTMLElement | undefined
        const cEl = cCol?.children[node.row] as HTMLElement | undefined
        if (!pEl || !cEl) continue
        const pRect = pEl.getBoundingClientRect()
        const cRect = cEl.getBoundingClientRect()
        newLines.push({
          from: { x: pRect.left + pRect.width / 2 - treeRect.left, y: pRect.top + pRect.height / 2 - treeRect.top },
          to: { x: cRect.left + cRect.width / 2 - treeRect.left, y: cRect.top + cRect.height / 2 - treeRect.top },
        })
      }
    }
    setLines(newLines)
  }, [])

  useEffect(() => {
    recalc()
    const ro = new ResizeObserver(() => recalc())
    if (treeRef.current) ro.observe(treeRef.current)
    return () => ro.disconnect()
  }, [recalc])

  // Force recalc on learn
  useEffect(() => {
    requestAnimationFrame(recalc)
  }, [character?.talents, recalc])

  const handleRespec = () => {
    if (!character) return
    const totalSpent = character.talents.reduce((sum, id) => {
      const t = talentTree.find(x => x.id === id)
      return sum + (t?.cost ?? 0)
    }, 0)
    dispatch({ type: 'UPDATE_CHARACTER', payload: { talents: [], talentPoints: character.talentPoints + totalSpent } })
  }

  if (!character) return null

  return (
    <div className="p-4 max-w-7xl mx-auto w-full">
      <GothicFrame title="Arbol de Talentos">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--gothic-gold)] text-lg">&#10022;</span>
              <span className="text-[var(--gothic-gold)] text-xs font-[var(--font-pixel)] tracking-wider">
                Puntos Disponibles: {character.talentPoints}
              </span>
            </div>
            <p className="text-[var(--gothic-text-dim)] text-[10px] mt-1">Haz clic en un nodo para aprenderlo</p>
          </div>
          {character.talents.length > 0 && (
            <GothicButton variant="blood" size="sm" onClick={handleRespec}>
              Restablecer Talentos
            </GothicButton>
          )}
        </div>

        {/* Branch labels */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {BRANCHES.map(branch => (
            <div key={branch.key} className="text-center">
              <span className="text-[10px] font-[var(--font-pixel)] tracking-wider uppercase" style={{ color: branch.color }}>
                {branch.key === 'ofensiva' ? '\u2694\uFE0F ' : branch.key === 'maestria' ? '\u{1F4A0} ' : '\u{1F6E1}\uFE0F '}
                {branch.label}
              </span>
            </div>
          ))}
        </div>

        {/* Tree grid with connectors */}
        <div ref={treeRef} className="relative overflow-y-auto wow-scroll" style={{ height: '440px' }}>
          {/* SVG Connector lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {lines.map((line, i) => (
              <ConnectorLine key={i} from={line.from} to={line.to} />
            ))}
          </svg>

          {/* Tier labels */}
          {TIER_LABELS.map((label, i) => (
            <div key={label} className="absolute left-0 w-full flex items-center z-0" style={{ top: `${i * 25 + 5}%` }}>
              <span className="text-[10px] text-[var(--gothic-border)] font-[var(--font-pixel)] tracking-widest uppercase -ml-1">
                Tier {label}
              </span>
            </div>
          ))}

          {/* Node columns */}
          <div className="relative grid grid-cols-3 gap-0 h-full z-10">
            {BRANCHES.map((branch, colIdx) => (
              <div key={branch.key} className="relative h-full">
                {NODES.filter(n => n.col === colIdx && n.branch.key === branch.key).map(node => (
                  <TalentNode key={node.talent.id} node={node} learned={character.talents} points={character.talentPoints} />
                ))}
              </div>
            ))}
          </div>

          {/* Capstone node (centered, tier 4) */}
          {NODES.filter(n => n.talent.branch === 'central').map(node => (
            <TalentNode key={node.talent.id} node={node} learned={character.talents} points={character.talentPoints} />
          ))}
        </div>

        {/* Learned summary */}
        {character.talents.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[var(--gothic-border-dim)]">
            <p className="text-[var(--gothic-text-dim)] text-[10px] font-[var(--font-pixel)] tracking-wider uppercase mb-2">
              Talentos Aprendidos ({character.talents.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {character.talents.map(id => {
                const t = talentTree.find(x => x.id === id)
                if (!t) return null
                const colors = getColor(t.branch)
                return (
                  <span key={id} className="text-[10px] px-1.5 py-0.5 border font-[var(--font-pixel)]"
                    style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.bg }}>
                    {t.name}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Ultimate Ability Section */}
        <div className="mt-6 pt-4 border-t-2 border-amber-800/40">
          <UltimateSection characterClass={character.class} />
        </div>
      </GothicFrame>
    </div>
  )
}
