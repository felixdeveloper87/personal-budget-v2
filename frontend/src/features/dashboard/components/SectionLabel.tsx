import { NuTitle } from './nu'

/** Section heading on the Nubank-style dashboard sheet. */
export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return <NuTitle>{children}</NuTitle>
}
