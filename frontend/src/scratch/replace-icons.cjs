const fs = require('fs')
const path = require('path')

const srcDir = path.join(__dirname, '..')
const iconsFilePath = path.join(srcDir, 'components', 'ui', 'icons')

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f)
    const isDirectory = fs.statSync(dirPath).isDirectory()
    if (isDirectory) {
      walkDir(dirPath, callback)
    } else if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
      callback(dirPath)
    }
  })
}

let modifiedCount = 0

walkDir(srcDir, (filePath) => {
  // Don't modify the icons.ts file itself!
  if (filePath === path.join(srcDir, 'components', 'ui', 'icons.ts')) return

  let content = fs.readFileSync(filePath, 'utf-8')
  if (content.includes("from 'lucide-react'")) {
    const relativePath = path.relative(path.dirname(filePath), iconsFilePath).replace(/\\/g, '/')
    const finalPath = relativePath.startsWith('.') ? relativePath : './' + relativePath
    
    content = content.replace(/from\s+'lucide-react'/g, `from '${finalPath}'`)
    fs.writeFileSync(filePath, content)
    console.log(`Updated ${filePath}`)
    modifiedCount++
  }
})

console.log(`Total files modified: ${modifiedCount}`)
