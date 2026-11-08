// Copies the Astro site (site/dist) into the app's build output, so one
// directory serves both: the site's pages (/, /es, /ca) and, for every other
// path, the app's app.html (see vercel.json). Fails if both builds produce the
// same file, which would silently replace one of them.

import { cp, readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const site = join(root, 'site/dist')
const app = join(root, 'dist/polo-angular')

const siteFiles = await listFiles(site)
const collisions = []
for (const file of siteFiles) {
  const exists = await stat(join(app, relative(site, file))).then(() => true, () => false)
  if (exists) collisions.push(relative(site, file))
}

if (collisions.length) {
  console.error(`The site and the app both produce: ${collisions.join(', ')}`)
  process.exit(1)
}

await cp(site, app, { recursive: true })
console.log(`Merged ${siteFiles.length} site files into ${relative(root, app)}`)

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true, recursive: true })
  return entries.filter(entry => entry.isFile()).map(entry => join(entry.parentPath, entry.name))
}
