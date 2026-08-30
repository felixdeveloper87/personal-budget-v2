export const HOUSEHOLD_AVATAR_GRADIENTS = [
  'linear(to-br, #EAB308, #B45309)', // Colonel Mustard
  'linear(to-br, #94A3B8, #475569)', // Mrs. White
  'linear(to-br, #10B981, #064E3B)', // Mr. Green
  'linear(to-br, #0EA5E9, #1E3A8A)', // Mrs. Peacock
  'linear(to-br, #A855F7, #581C87)', // Professor Plum
  'linear(to-br, #EF4444, #991B1B)', // Miss Scarlett
] as const

export function householdAvatarGradient(memberIndex: number, memberId: number) {
  const paletteIndex = memberIndex >= 0 ? memberIndex : Math.abs(memberId)
  return HOUSEHOLD_AVATAR_GRADIENTS[
    paletteIndex % HOUSEHOLD_AVATAR_GRADIENTS.length
  ]
}
