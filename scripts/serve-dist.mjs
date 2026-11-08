// Serves the merged build (npm run build) the way vercel.json does in
// production: existing files first, .html pages without extension, and the
// app's app.html for every other path.
//
//   node scripts/serve-dist.mjs [port]     default port 4300

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const root = new URL('../dist/polo-angular/', import.meta.url).pathname
const port = Number(process.argv[2] ?? 4300)
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.zip': 'application/zip',
}

createServer(async (request, response) => {
  const path = normalize(decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname))
  const candidates = path.endsWith('/') ? [join(path, 'index.html')] : [path, `${path}.html`]
  for (const candidate of [...candidates, '/app.html']) {
    const file = join(root, candidate)
    if (!file.startsWith(root) || !(await isFile(file))) continue
    response.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' })
    response.end(await readFile(file))
    return
  }
  response.writeHead(404).end()
}).listen(port, () => console.log(`Serving ${root} at http://localhost:${port}`))

async function isFile(path) {
  return stat(path).then(info => info.isFile(), () => false)
}
