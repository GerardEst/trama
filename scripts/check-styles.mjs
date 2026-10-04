import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sources = []
const errors = []
const walk = directory => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) walk(path)
    else sources.push(path)
  }
}
walk(join(root, 'src'))

const theme = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8')
const tokens = new Set([...theme.matchAll(/(--polo-[\w-]+)\s*:/g)].map(match => match[1]))
for (const path of sources) {
  const name = relative(root, path)
  if (/\.(sass|scss)$/.test(path)) errors.push(`${name}: use native CSS`)
  if (!path.endsWith('.css') || name === 'src/styles/tokens.css') continue
  const css = readFileSync(path, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  if (/--polo-(?:color-[\w-]+|(?:ink|paper|forest|amber)-\d+)\s*:/.test(css)) {
    errors.push(`${name}: palettes belong only in src/styles/tokens.css`)
  }
  if (/^\s*[\w-]+\s*:[^;{}]*(?:#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\()/im.test(css)) {
    errors.push(`${name}: replace literal colors with shared semantic tokens`)
  }
  for (const [, token] of css.matchAll(/var\((--polo-(?:color|font|space|radius|shadow|background)-[\w-]+)/g)) {
    if (!tokens.has(token)) errors.push(`${name}: undefined theme token ${token}`)
  }
}

for (const path of [...sources.filter(path => path.endsWith('.ts')), join(root, 'angular.json')]) {
  if (/\.s[ac]ss\b/.test(readFileSync(path, 'utf8'))) {
    errors.push(`${relative(root, path)}: obsolete stylesheet reference`)
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  process.stdout.write('Styles OK: native CSS and one shared theme\n')
}
