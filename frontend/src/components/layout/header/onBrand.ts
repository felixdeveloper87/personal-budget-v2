import { createContext, useContext } from 'react'
import { LIGHT_PALETTE } from '../../../palette'

/** Colours for controls sitting on the purple app bar (logged-in shell). */
export const ON_BRAND = {
  bg: LIGHT_PALETTE.hero,
  controlBg: 'rgba(255, 255, 255, 0.14)',
  controlHoverBg: 'rgba(255, 255, 255, 0.22)',
  line: 'rgba(255, 255, 255, 0.22)',
  lineStrong: 'rgba(255, 255, 255, 0.42)',
  ink: '#ffffff',
  inkSoft: 'rgba(255, 255, 255, 0.78)',
  focus: '0 0 0 3px rgba(255, 255, 255, 0.55)',
} as const

/** `true` inside the purple app bar, so header controls switch to light-on-purple. */
export const OnBrandContext = createContext(false)

export function useOnBrand() {
  return useContext(OnBrandContext)
}
