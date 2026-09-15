import type { ReactNode } from 'react'

type Corner = 'all' | 'tl' | 'tr' | 'bl' | 'br' | 'none'

interface GothicFrameProps {
  children: ReactNode
  className?: string
  corners?: Corner
  title?: string
}

const CORNER_SIZE = 10

function CornerSVG({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const transforms: Record<string, string> = {
    tl: '',
    tr: 'scaleX(-1)',
    bl: 'scaleY(-1)',
    br: 'scale(-1, -1)',
  }
  return (
    <svg
      className="absolute"
      style={{
        [position.includes('t') ? 'top' : 'bottom']: -1,
        [position.includes('l') ? 'left' : 'right']: -1,
        transform: transforms[position],
      }}
      width={CORNER_SIZE * 2 + 6}
      height={CORNER_SIZE * 2 + 6}
      viewBox={`0 0 ${CORNER_SIZE * 2 + 6} ${CORNER_SIZE * 2 + 6}`}
      fill="none"
    >
      <circle cx={CORNER_SIZE + 3} cy={CORNER_SIZE + 3} r={3} fill="var(--gothic-gold)" opacity={0.6} />
      <path
        d={`M${CORNER_SIZE + 6},2 L${CORNER_SIZE + 6},${CORNER_SIZE + 3} L2,${CORNER_SIZE + 3}`}
        stroke="var(--gothic-iron)"
        strokeWidth="2"
        strokeLinecap="square"
        opacity={0.5}
      />
      <path
        d={`M${CORNER_SIZE + 9},2 L${CORNER_SIZE + 9},${CORNER_SIZE + 6} L2,${CORNER_SIZE + 6}`}
        stroke="var(--gothic-border)"
        strokeWidth="1"
        strokeLinecap="square"
        opacity={0.4}
      />
    </svg>
  )
}

const cornerSet: Record<string, { tl: boolean; tr: boolean; bl: boolean; br: boolean }> = {
  all:    { tl: true, tr: true, bl: true, br: true },
  tl:     { tl: true, tr: false, bl: false, br: false },
  tr:     { tl: false, tr: true, bl: false, br: false },
  bl:     { tl: false, tr: false, bl: true, br: false },
  br:     { tl: false, tr: false, bl: false, br: true },
  none:   { tl: false, tr: false, bl: false, br: false },
}

export function GothicFrame({ children, className = '', corners = 'all', title }: GothicFrameProps) {
  const active = cornerSet[corners] ?? cornerSet.all

  return (
    <div
      className={`gothic-bg relative border-ornate corner-rivet ${className}`}
      style={{
        background: 'var(--gothic-bg-panel)',
      }}
    >
      {title && (
        <div
          className="absolute -top-2.5 left-3 px-2 text-[10px] tracking-wider uppercase font-[var(--font-pixel)]"
          style={{
            color: 'var(--gothic-gold)',
            background: 'var(--gothic-bg-deep)',
            border: '1px solid var(--gothic-border)',
            borderBottom: 'none',
            lineHeight: '1.4',
          }}
        >
          {title}
        </div>
      )}

      {active.tl && <CornerSVG position="tl" />}
      {active.tr && <CornerSVG position="tr" />}
      {active.bl && <CornerSVG position="bl" />}
      {active.br && <CornerSVG position="br" />}

      <div className="p-2 relative z-10">{children}</div>
    </div>
  )
}
