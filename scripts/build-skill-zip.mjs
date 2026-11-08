// Packs skills/trama-engine into src/skills/trama-engine.zip, served at
// https://trama.app/skills/trama-engine.zip for uploading to claude.ai.
// The zip is byte-for-byte reproducible, so it is committed and checked.
//
//   node scripts/build-skill-zip.mjs           write the zip
//   node scripts/build-skill-zip.mjs --check   fail if the zip is stale or the
//                                              docs pin another engine version

import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { deflateRawSync } from 'node:zlib'

const ROOT = new URL('..', import.meta.url).pathname
const SKILL = join(ROOT, 'skills/trama-engine')
const OUTPUT = join(ROOT, 'src/skills/trama-engine.zip')
const check = process.argv.includes('--check')
// Declared before the top-level await below uses it.
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

const zip = await buildZip()
const problems = check ? [...await staleZip(zip), ...await versionMismatches()] : []

if (check) {
  if (problems.length) {
    problems.forEach(problem => console.error(problem))
    process.exit(1)
  }
  console.log('Skill OK: zip up to date and engine version pinned consistently')
} else {
  await mkdir(join(ROOT, 'src/skills'), { recursive: true })
  await writeFile(OUTPUT, zip)
  console.log(`Wrote ${relative(ROOT, OUTPUT)} (${zip.length} bytes)`)
}

async function staleZip(expected) {
  const current = await readFile(OUTPUT).catch(() => null)
  return current?.equals(expected) ? [] : ['src/skills/trama-engine.zip is out of date: run node scripts/build-skill-zip.mjs']
}

/** Every pinned @trama-app/engine@x.y.z must match the package version. */
async function versionMismatches() {
  const { version } = JSON.parse(await readFile(join(ROOT, 'packages/engine/package.json'), 'utf8'))
  const files = [...await listFiles(SKILL), join(ROOT, 'src/llms.txt')]
  const problems = []
  for (const file of files) {
    const text = await readFile(file, 'utf8')
    for (const [, pinned] of text.matchAll(/@trama-app\/engine@(\d+\.\d+\.\d+)/g)) {
      if (pinned !== version) problems.push(`${relative(ROOT, file)} pins @trama-app/engine@${pinned}, but the package is ${version}`)
    }
    for (const [, pinned] of text.matchAll(/^Version (\d+\.\d+\.\d+)\./gm)) {
      if (pinned !== version) problems.push(`${relative(ROOT, file)} documents version ${pinned}, but the package is ${version}`)
    }
  }
  const marketplace = JSON.parse(await readFile(join(ROOT, '.claude-plugin/marketplace.json'), 'utf8'))
  const plugin = marketplace.plugins.find(entry => entry.name === 'trama-engine')
  if (plugin?.version !== version) problems.push(`.claude-plugin/marketplace.json lists trama-engine ${plugin?.version}, but the package is ${version}`)
  return problems
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true, recursive: true })
  return entries
    .filter(entry => entry.isFile())
    .map(entry => join(entry.parentPath ?? entry.path, entry.name))
    .sort()
}

// Minimal deterministic zip writer: deflate, UTF-8 names, fixed timestamps,
// files sorted, everything under a top-level trama-engine/ folder.
async function buildZip() {
  const locals = []
  const centrals = []
  let offset = 0
  for (const file of await listFiles(SKILL)) {
    const name = Buffer.from(`trama-engine/${relative(SKILL, file).split(sep).join('/')}`)
    const data = await readFile(file)
    const compressed = deflateRawSync(data, { level: 9 })
    const crc = crc32(data)
    const fields = [
      [2, 20],           // version needed
      [2, 0x0800],       // flags: UTF-8 names
      [2, 8],            // deflate
      [2, 0],            // time 00:00
      [2, 0x21],         // date 1980-01-01
      [4, crc],
      [4, compressed.length],
      [4, data.length],
      [2, name.length],
      [2, 0],            // extra length
    ]
    const local = Buffer.concat([uint(4, 0x04034b50), ...fields.map(([size, value]) => uint(size, value)), name, compressed])
    centrals.push(Buffer.concat([
      uint(4, 0x02014b50),
      uint(2, (3 << 8) | 20), // made by Unix, so the permissions below apply
      ...fields.map(([size, value]) => uint(size, value)),
      uint(2, 0),             // comment length
      uint(2, 0),             // disk
      uint(2, 0),             // internal attributes
      uint(4, (0o100644 << 16) >>> 0),
      uint(4, offset),
      name,
    ]))
    locals.push(local)
    offset += local.length
  }
  const central = Buffer.concat(centrals)
  const end = Buffer.concat([
    uint(4, 0x06054b50), uint(2, 0), uint(2, 0),
    uint(2, centrals.length), uint(2, centrals.length),
    uint(4, central.length), uint(4, offset), uint(2, 0),
  ])
  return Buffer.concat([...locals, central, end])
}

function uint(size, value) {
  const buffer = Buffer.alloc(size)
  if (size === 2) buffer.writeUInt16LE(value)
  else buffer.writeUInt32LE(value >>> 0)
  return buffer
}

function crc32(data) {
  let crc = 0xffffffff
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}
