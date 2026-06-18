function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a || 1
}

/** Returns a closed hypotrochoid (spirograph) SVG path centred on (0,0). */
export function guilloche(R: number, r: number, d: number): string {
  const turns = r / gcd(R, r)
  const steps = Math.max(700, Math.round(turns * 240))
  const k = R - r
  let p = ''
  for (let i = 0; i <= steps; i++) {
    const a = (turns * 2 * Math.PI * i) / steps
    const x = k * Math.cos(a) + d * Math.cos((k / r) * a)
    const y = k * Math.sin(a) - d * Math.sin((k / r) * a)
    p += (i ? 'L' : 'M') + x.toFixed(2) + ',' + y.toFixed(2)
  }
  return p + 'Z'
}
