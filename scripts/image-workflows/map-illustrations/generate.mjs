import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const require = createRequire(new URL('../../../site/package.json', import.meta.url))
const sharp = require('sharp')
const specification = JSON.parse(await readFile(new URL('./scenes.json', import.meta.url), 'utf8'))
const template = JSON.parse(await readFile(new URL('../story-map-ink-landscape.json', import.meta.url), 'utf8'))
const output = new URL('../../../site/src/assets/landing/map-illustrations/', import.meta.url)
const temporary = new URL('../../../tmp/map-illustrations/', import.meta.url)
const args = process.argv.slice(2)
const option = name => args.includes(name) ? args[args.indexOf(name) + 1] : undefined
const server = option('--url')
const only = option('--only')
const curl = option('--curl')
const processOnly = args.includes('--process-only')
const scenes = specification.scenes.filter(scene => !only || scene.name === only)
if (!scenes.length) throw new Error(`Unknown scene: ${only}`)

// Windows ComfyUI may only accept Windows loopback connections from WSL.
async function request(url, options = {}) {
  if (!curl) return fetch(url, options)
  const args = ['--silent', '--show-error', '--fail-with-body', '--max-time', '60', url.href]
  if (options.body) args.push('-H', 'Content-Type: application/json', '--data-binary', '@-')
  const bytes = await new Promise((resolve, reject) => {
    const child = spawn(curl, args, { stdio: ['pipe', 'pipe', 'pipe'] })
    const chunks = [], errors = []
    child.stdout.on('data', chunk => chunks.push(chunk))
    child.stderr.on('data', chunk => errors.push(chunk))
    child.on('error', reject)
    child.on('close', code => code === 0 ? resolve(Buffer.concat(chunks)) : reject(new Error(Buffer.concat(errors).toString() || Buffer.concat(chunks).toString())))
    child.stdin.end(options.body)
  })
  return new Response(bytes)
}

// Keep the exact atlas model and PencilartD LoRA, with new isolated compositions.
function workflow(scene) {
  const graph = structuredClone(template)
  delete graph['7']
  delete graph['12']
  graph['5'].inputs.text = `${specification.style}\n${scene.prompt}`
  graph['8'] = {
    class_type: 'EmptyLatentImage',
    inputs: { width: scene.width, height: scene.height, batch_size: 1 },
  }
  Object.assign(graph['9'].inputs, { seed: scene.seed, denoise: 1 })
  graph['11'].inputs.filename_prefix = `trama/map-illustrations/${scene.name}`
  return graph
}

// Unmultiply the white paper: retain every coloured pencil mark as real alpha,
// so the same drawing sits naturally on both the light and dark site canvas.
async function cutout(bytes, scene) {
  const { data, info } = await sharp(bytes).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const rgba = Buffer.alloc(info.width * info.height * 4)
  let left = info.width, top = info.height, right = 0, bottom = 0
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const source = (y * info.width + x) * info.channels
      const target = (y * info.width + x) * 4
      const paper = Math.min(data[source], data[source + 1], data[source + 2])
      const chroma = Math.max(data[source], data[source + 1], data[source + 2]) - paper
      const alpha = 255 - paper
      if (alpha < 16) continue
      for (let channel = 0; channel < 3; channel++) {
        rgba[target + channel] = scene.name === 'boat' || scene.name === 'paper-boat' || chroma < 12 ? 0 : Math.round((data[source + channel] - paper) * 255 / alpha)
      }
      rgba[target + 3] = alpha
      if (alpha > 32) {
        left = Math.min(left, x)
        top = Math.min(top, y)
        right = Math.max(right, x)
        bottom = Math.max(bottom, y)
      }
    }
  }
  if (left >= right || top >= bottom) throw new Error(`Empty illustration: ${scene.name}`)
  const padding = 16
  left = Math.max(0, left - padding)
  top = Math.max(0, top - padding)
  right = Math.min(info.width - 1, right + padding)
  bottom = Math.min(info.height - 1, bottom + padding)
  const boat = scene.name === 'boat'
  const paperBoat = scene.name === 'paper-boat'
  return sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .resize(boat ? 192 : paperBoat ? 256 : 512, boat ? 320 : paperBoat ? 192 : 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90, alphaQuality: 100 })
    .toBuffer()
}

for (const scene of scenes) {
  const graph = workflow(scene)
  await mkdir(temporary, { recursive: true })
  await writeFile(new URL(`${scene.name}.json`, temporary), JSON.stringify(graph, null, 2) + '\n')
  if (processOnly) {
    const bytes = await readFile(new URL(`${scene.name}.png`, temporary))
    await mkdir(output, { recursive: true })
    await writeFile(new URL(`${scene.name}.webp`, output), await cutout(bytes, scene))
    continue
  }
  if (!server) continue
  const base = new URL(server.endsWith('/') ? server : `${server}/`)
  const response = await request(new URL('prompt', base), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: graph }),
  })
  if (!response.ok) throw new Error(`ComfyUI rejected ${scene.name}: ${await response.text()}`)
  const { prompt_id } = await response.json()
  process.stdout.write(`${scene.name}: queued ${prompt_id}\n`)
  const deadline = Date.now() + 30 * 60 * 1000
  let result
  while (Date.now() < deadline) {
    const historyResponse = await request(new URL(`history/${prompt_id}`, base))
    if (!historyResponse.ok) throw new Error(`Cannot read ComfyUI history: ${historyResponse.status}`)
    const history = (await historyResponse.json())[prompt_id]
    if (history?.status?.status_str === 'error') throw new Error(JSON.stringify(history.status.messages))
    result = history?.outputs?.['11']?.images?.[0]
    if (result) break
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  if (!result) throw new Error(`Timed out waiting for ${scene.name}`)
  const url = new URL('view', base)
  url.search = new URLSearchParams({ filename: result.filename, subfolder: result.subfolder, type: result.type }).toString()
  const imageResponse = await request(url)
  if (!imageResponse.ok) throw new Error(`Cannot download ${scene.name}: ${imageResponse.status}`)
  const bytes = Buffer.from(await imageResponse.arrayBuffer())
  await mkdir(output, { recursive: true })
  await writeFile(new URL(`${scene.name}.png`, temporary), bytes)
  const destination = new URL(`${scene.name}.webp`, output)
  await writeFile(destination, await cutout(bytes, scene))
  process.stdout.write(`${scene.name}: saved ${fileURLToPath(destination)}\n`)
}
