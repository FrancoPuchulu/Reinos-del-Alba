import type { PvPRival } from '@/data/pvpRivals'

let _pendingRival: PvPRival | null = null
let _consumedRival: PvPRival | null = null

export function setPendingPvpRival(rival: PvPRival | null): void {
  _pendingRival = rival
}

export function consumePendingPvpRival(): PvPRival | null {
  const r = _pendingRival
  _pendingRival = null
  _consumedRival = r
  return r
}

export function getConsumedPvpRival(): PvPRival | null {
  return _consumedRival
}

export function clearConsumedPvpRival(): void {
  _consumedRival = null
}
