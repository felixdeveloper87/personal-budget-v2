import { ACCENT_IDS, DEFAULT_ACCENT, accentCssVariables } from './accent'
import { LIGHT_PALETTE, paletteCssVariables } from './palette'

const STYLE_ID = 'pb-theme-vars'

function rule(selector: string, vars: Record<string, string>) {
  const body = Object.entries(vars)
    .map(([name, value]) => `${name}:${value};`)
    .join('')
  return `${selector}{${body}}`
}

/** Writes the app's global CSS variables (`--accent-*`, `--pb-*`, `--nu-brand*`)
 * into a plain <style> tag: the default accent and the palette on :root, each
 * other accent under html[data-accent].
 *
 * They must NOT go through Chakra's global styles: Chakra reads a custom
 * property value with top-level commas as `token, fallback` and keeps a single
 * piece, so `--accent-rgb: 130, 10, 209` came out as `--accent-rgb: 10` (every
 * `rgba(var(--accent-rgb), a)` turned transparent) and two-layer shadows such
 * as `--pb-shadow` lost their first layer. */
export function installThemeVariables() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    rule(':root', {
      ...accentCssVariables(DEFAULT_ACCENT),
      ...paletteCssVariables(LIGHT_PALETTE),
      '--nu-brand': 'var(--accent)',
      '--nu-brand-deep': 'var(--accent-deep)',
      '--nu-brand-tint': 'var(--accent-tint)',
    }),
    ...ACCENT_IDS.filter((id) => id !== DEFAULT_ACCENT).map((id) =>
      rule(`html[data-accent="${id}"]`, accentCssVariables(id)),
    ),
  ].join('\n')
  document.head.appendChild(style)
}
