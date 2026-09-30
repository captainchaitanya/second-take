import type { Quality } from '../types/scene'

export const XP_BY_QUALITY: Record<Quality, number> = {
  strong: 10,
  subtle: 5,
  backfire: 2,
}

export function xpForQuality(quality: Quality): number {
  return XP_BY_QUALITY[quality]
}
