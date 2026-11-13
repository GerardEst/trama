import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { spawn } from 'node:child_process'

const require = createRequire(new URL('../../site/package.json', import.meta.url))
const sharp = require('sharp')
const processOnly = process.argv.includes('--process-only')
const base = new URL(processOnly ? 'http://127.0.0.1:8000/' : process.argv[2] ?? 'http://127.0.0.1:8000/')
const curl = processOnly ? undefined : process.argv[3]
const temporary = new URL('../../tmp/map-colour/', import.meta.url)
await mkdir(temporary, { recursive: true })

async function request(path, body, contentType = 'application/json') {
  const url = new URL(path, base)
  if (!curl) return fetch(url, body ? { method: 'POST', body, headers: { 'Content-Type': contentType } } : {})
  const args = ['--silent', '--show-error', '--fail-with-body', '--max-time', '60', url.href]
  if (body) args.push('-H', `Content-Type: ${contentType}`, '--data-binary', '@-')
  const bytes = await new Promise((resolve, reject) => {
    const child = spawn(curl, args)
    const chunks = [], errors = []
    child.stdout.on('data', chunk => chunks.push(chunk))
    child.stderr.on('data', chunk => errors.push(chunk))
    child.on('error', reject)
    child.on('close', code => code === 0 ? resolve(Buffer.concat(chunks)) : reject(new Error(Buffer.concat(errors).toString() || Buffer.concat(chunks).toString())))
    child.stdin.end(body)
  })
  return new Response(bytes)
}

// Use ComfyUI's painted colours while retaining the exact original ink lines.
// Removing generated luminance prevents new/moved outlines from ghosting when
// the pointer reveals this image over the monochrome original.
async function restoreInk(original, painted) {
  const { data: ink, info } = await sharp(original).greyscale().raw().toBuffer({ resolveWithObject: true })
  const colours = await sharp(painted).resize(info.width, info.height).removeAlpha().blur(3).raw().toBuffer()
  const output = Buffer.alloc(info.width * info.height * 3)
  for (let pixel = 0; pixel < ink.length; pixel++) {
    const offset = pixel * 3
    const white = Math.max(1, colours[offset], colours[offset + 1], colours[offset + 2])
    const line = Math.min(255, ink[pixel] * 255 / 235)
    for (let channel = 0; channel < 3; channel++) {
      const wash = Math.max(128, 255 - (255 - colours[offset + channel] * 255 / white) * 0.75)
      output[offset + channel] = Math.round(line * wash / 255)
    }
  }
  return sharp(output, { raw: { width: info.width, height: info.height, channels: 3 } }).webp({ quality: 90 }).toBuffer()
}

for (const [index, layout] of ['landscape', 'portrait'].entries()) {
  const original = await readFile(new URL(`../../site/src/assets/landing/story-map-ink-${layout}.webp`, import.meta.url))
  if (processOnly) {
    const painted = await readFile(new URL(`${layout}.png`, temporary))
    await writeFile(new URL(`../../site/src/assets/landing/story-map-colour-${layout}.webp`, import.meta.url), await restoreInk(original, painted))
    continue
  }
  const png = await sharp(original).png().toBuffer()
  const filename = `trama-map-ink-${layout}.png`
  const boundary = 'trama-map-colour-upload'
  const form = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${filename}"\r\nContent-Type: image/png\r\n\r\n`),
    png,
    Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="overwrite"\r\n\r\ntrue\r\n--${boundary}--\r\n`),
  ])
  const upload = await request('upload/image', form, `multipart/form-data; boundary=${boundary}`)
  if (!upload.ok) throw new Error(await upload.text())
  const image = await upload.json()
  const graph = JSON.parse(await readFile(new URL(`./story-map-ink-${layout}.json`, import.meta.url), 'utf8'))
  graph['7'].inputs.image = image.name
  graph['2'].inputs.strength_model = 0.7
  graph['5'].inputs.text = 'pencilart, hand colour this exact fantasy map with beautiful coloured pencils and translucent watercolour. Preserve the precise cartographic composition, all existing coastlines, river banks, trees, mountains, roads, buildings and every delicate black pencil line. Add fresh moss and emerald green to forests and meadows, turquoise and soft azure blue to the rivers and lakes, earthy ochre paths, slate blue and warm grey mountain stone, tiny terracotta rooftops and golden fields. Rich inviting natural colours with visible white paper between fine pencil strokes. A magical literary atlas, bright and inspiring, finely observed and mature. Keep the spacious central clearing very pale and almost unpainted for typography. Paint the existing drawing only: do not add, remove, move or redesign anything. No lettering, no text, no labels, no symbols, no border, no yellow parchment, no heavy shadows, no solid dark fills.'
  Object.assign(graph['9'].inputs, { seed: 914312 + index, denoise: 0.48 })
  graph['11'].inputs.filename_prefix = `trama/story-map-colour-${layout}`
  await writeFile(new URL(`./story-map-colour-${layout}.json`, import.meta.url), JSON.stringify(graph, null, 2) + '\n')
  const queued = await request('prompt', JSON.stringify({ prompt: graph }))
  if (!queued.ok) throw new Error(await queued.text())
  const { prompt_id } = await queued.json()
  process.stdout.write(`${layout}: queued ${prompt_id}\n`)
  const deadline = Date.now() + 30 * 60 * 1000
  let result
  while (Date.now() < deadline) {
    const history = await (await request(`history/${prompt_id}`)).json()
    if (history[prompt_id]?.status?.status_str === 'error') throw new Error(JSON.stringify(history[prompt_id].status.messages))
    result = history[prompt_id]?.outputs?.['11']?.images?.[0]
    if (result) break
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  if (!result) throw new Error(`Timed out waiting for ${layout}`)
  const view = `view?${new URLSearchParams(result)}`
  const response = await request(view)
  if (!response.ok) throw new Error(await response.text())
  const painted = Buffer.from(await response.arrayBuffer())
  await writeFile(new URL(`${layout}.png`, temporary), painted)
  await writeFile(new URL(`../../site/src/assets/landing/story-map-colour-${layout}.webp`, import.meta.url), await restoreInk(original, painted))
  process.stdout.write(`${layout}: saved coloured map with original ink contours\n`)
}
