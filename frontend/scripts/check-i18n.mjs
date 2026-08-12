import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(process.cwd(), 'src')
const localeDir = resolve(root, 'i18n', 'locales')
const resourceSource = readFileSync(resolve(root, 'i18n', 'resources.ts'), 'utf8')
const localeFiles = readdirSync(localeDir).filter((file) => file.endsWith('.ts')).sort()
const allKeys = new Set()
const keyOwners = new Map()
const errors = []

const keysIn = (source) => {
  const keys = []
  const pattern = /^\s*'([^']+)'\s*:/gm
  for (const match of source.matchAll(pattern)) {
    if (match[1] !== 'en-GB' && match[1] !== 'pt-BR') keys.push(match[1])
  }
  return keys
}

for (const file of localeFiles) {
  const source = readFileSync(resolve(localeDir, file), 'utf8')
  const ptStart = source.indexOf("'pt-BR': {")
  if (ptStart < 0) {
    errors.push(`${file}: missing pt-BR dictionary`)
    continue
  }

  const english = keysIn(source.slice(0, ptStart))
  const portuguese = keysIn(source.slice(ptStart))
  const enSet = new Set(english)
  const ptSet = new Set(portuguese)

  for (const key of english) {
    if (!ptSet.has(key)) errors.push(`${file}: pt-BR is missing "${key}"`)
    const existingOwner = keyOwners.get(key)
    if (existingOwner) errors.push(`${file}: "${key}" is already defined in ${existingOwner}`)
    else keyOwners.set(key, file)
    allKeys.add(key)
  }
  for (const key of portuguese) {
    if (!enSet.has(key)) errors.push(`${file}: en-GB is missing "${key}"`)
  }
  if (enSet.size !== english.length) errors.push(`${file}: duplicate en-GB key`)
  if (ptSet.size !== portuguese.length) errors.push(`${file}: duplicate pt-BR key`)

  const moduleName = file.replace(/\.ts$/, '')
  if (!resourceSource.includes(`./locales/${moduleName}`)) {
    errors.push(`${file}: bundle is not imported by resources.ts`)
  }
}

const sourceFiles = []
const walk = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = resolve(directory, entry.name)
    if (entry.isDirectory()) walk(absolute)
    else if (/\.(ts|tsx)$/.test(entry.name) && !absolute.includes(`${resolve(root, 'i18n', 'locales')}`)) {
      sourceFiles.push(absolute)
    }
  }
}
walk(root)

const literalCall = /\b(?:t|translateNow)\(\s*['"]([^'"]+)['"]/g
for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8')
  for (const match of source.matchAll(literalCall)) {
    const key = match[1]
    if (key.includes('.') && !allKeys.has(key)) {
      errors.push(`${file.replace(`${root}\\`, '')}: unknown translation key "${key}"`)
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`i18n check passed: ${localeFiles.length} bundles, ${allKeys.size} keys per locale`)
