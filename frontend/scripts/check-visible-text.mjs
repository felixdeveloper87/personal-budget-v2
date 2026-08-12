import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'

const sourceRoot = resolve(process.cwd(), 'src')
const sourceFiles = []
const findings = new Map()

const walk = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = resolve(directory, entry.name)
    if (entry.isDirectory()) walk(absolute)
    else if (entry.name.endsWith('.tsx')) sourceFiles.push(absolute)
  }
}

const visibleAttributes = new Set([
  'aria-label',
  'aria-description',
  'alt',
  'caption',
  'description',
  'emptyText',
  'helperText',
  'label',
  'loadingText',
  'placeholder',
  'subtitle',
  'title',
])

const visibleObjectProperties = new Set([
  'ariaLabel',
  'caption',
  'description',
  'emptyText',
  'hint',
  'label',
  'loadingText',
  'message',
  'placeholder',
  'subtitle',
  'tag',
  'title',
])

const allowedExact = new Set([
  'Personal Budget',
  'Personal',
  'Budget',
  'GBP',
  'GBP ·',
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'YYYY-MM-DD',
  'you@example.com',
  'x',
  'i',
  '⌘ K',
])

const allowedPatterns = [
  /^\d+x$/,
  /^(?:personalbudget\.co\.uk|Continente|Lidl|Spotify Family)$/,
]

// Some static data is intentionally language-neutral or is translated at its
// render boundary (for example API-stable preset values and fallback copy).
const ignoredPathFragments = [
  'components\\transactions\\TransactionForm\\QuickExpensePresets.tsx',
  'features\\household\\HouseholdPage.tsx',
  'components\\auth\\AuthModal.tsx',
  'components\\user\\UserProfileModal.tsx',
]

const normalise = (value) => value.replace(/\s+/g, ' ').trim()

const isHumanCopy = (raw) => {
  const value = normalise(raw)
  if (!value || !/\p{L}/u.test(value)) return false
  if (allowedExact.has(value)) return false
  if (allowedPatterns.some((pattern) => pattern.test(value))) return false
  if (/^&[a-z]+;$/i.test(value)) return false
  if (/^@keyframes\b/.test(value)) return false
  if (/^(?:https?:\/\/|mailto:)/i.test(value)) return false
  if (/^[A-Z0-9_./:-]+$/.test(value)) return false
  return true
}

const addFinding = (sourceFile, node, raw, kind) => {
  const value = normalise(raw)
  if (!isHumanCopy(value)) return
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
  const relative = sourceFile.fileName.replace(`${sourceRoot}\\`, '')
  const key = `${relative}:${line + 1}:${character + 1}:${kind}:${value}`
  findings.set(key, `${relative}:${line + 1}:${character + 1}: hard-coded ${kind} "${value}"`)
}

const staticText = (node) => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text
  return null
}

const inspectRenderedExpression = (sourceFile, expression) => {
  if (!expression) return
  if (
    ts.isStringLiteral(expression) ||
    ts.isNoSubstitutionTemplateLiteral(expression)
  ) {
    addFinding(sourceFile, expression, expression.text, 'rendered text')
    return
  }
  if (ts.isTemplateExpression(expression)) {
    addFinding(sourceFile, expression.head, expression.head.text, 'rendered text')
    for (const span of expression.templateSpans) {
      addFinding(sourceFile, span.literal, span.literal.text, 'rendered text')
    }
    return
  }
  if (ts.isConditionalExpression(expression)) {
    inspectRenderedExpression(sourceFile, expression.whenTrue)
    inspectRenderedExpression(sourceFile, expression.whenFalse)
    return
  }
  if (ts.isBinaryExpression(expression)) {
    const operator = expression.operatorToken.kind
    if (operator === ts.SyntaxKind.PlusToken) {
      inspectRenderedExpression(sourceFile, expression.left)
      inspectRenderedExpression(sourceFile, expression.right)
    } else if (
      operator === ts.SyntaxKind.AmpersandAmpersandToken ||
      operator === ts.SyntaxKind.BarBarToken ||
      operator === ts.SyntaxKind.QuestionQuestionToken
    ) {
      inspectRenderedExpression(sourceFile, expression.right)
    }
    return
  }
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isNonNullExpression(expression)
  ) {
    inspectRenderedExpression(sourceFile, expression.expression)
  }
}

walk(sourceRoot)

for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8')
  const skipObjectCopy = ignoredPathFragments.some((fragment) => file.endsWith(fragment))
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

  const visit = (node) => {
    if (ts.isJsxText(node)) addFinding(sourceFile, node, node.text, 'JSX text')

    if (ts.isJsxExpression(node) && !ts.isJsxAttribute(node.parent)) {
      inspectRenderedExpression(sourceFile, node.expression)
    }

    if (ts.isJsxAttribute(node) && visibleAttributes.has(node.name.text)) {
      if (node.initializer && ts.isStringLiteral(node.initializer)) {
        addFinding(sourceFile, node.initializer, node.initializer.text, `${node.name.text} attribute`)
      } else if (node.initializer && ts.isJsxExpression(node.initializer)) {
        inspectRenderedExpression(sourceFile, node.initializer.expression)
      }
    }

    if (ts.isPropertyAssignment(node) && !skipObjectCopy) {
      const name = ts.isIdentifier(node.name) || ts.isStringLiteral(node.name) ? node.name.text : ''
      if (visibleObjectProperties.has(name)) {
        const value = staticText(node.initializer)
        if (value !== null) addFinding(sourceFile, node.initializer, value, `${name} property`)
      }
    }

    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
}

if (findings.size) {
  console.error([...findings.values()].sort().join('\n'))
  process.exit(1)
}

console.log(`Visible-copy check passed: ${sourceFiles.length} TSX files contain no hard-coded user-facing copy`)
