import React, { useEffect } from 'react'
import type { SpellVFX } from './types'

const VFX_CLASS: Record<SpellVFX['kind'], string> = {
  slash: 'vfx-slash-effect',
  burst: 'vfx-burst-effect',
  heal: 'vfx-heal-effect',
}

const VFX_DURATION: Record<SpellVFX['kind'], number> = {
  slash: 250,
  burst: 350,
  heal: 450,
}

export const SpellVFXOverlay = React.memo(function SpellVFXOverlay({
  vfx,
  onComplete,
}: {
  vfx: SpellVFX
  onComplete: (id: number) => void
}) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(vfx.id), VFX_DURATION[vfx.kind])
    return () => clearTimeout(timer)
  }, [vfx.id, vfx.kind, onComplete])

  return <div className={VFX_CLASS[vfx.kind]} />
})
