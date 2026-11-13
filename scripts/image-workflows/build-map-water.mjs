import { createRequire } from 'node:module'

const require = createRequire(new URL('../../site/package.json', import.meta.url))
const sharp = require('sharp')

// The portrait bay opens into paths at its northern/southern ends. This broad
// boundary keeps the flood fill in the sea rather than following those paths.
const portraitBay = [[45, 30], [54, 30], [64, 31], [69, 33], [71, 35], [67, 39], [66, 44], [64, 48], [65, 53], [64, 58], [60, 63], [62, 66], [60, 69], [52, 70], [45, 71], [38, 70], [33, 66], [30, 61], [27, 56], [24, 54], [21, 50], [20, 48], [20, 44], [22, 41], [24, 37], [27, 35], [31, 35], [37, 32]]

function inBay(x, y) {
  let inside = false
  for (let i = 0, j = portraitBay.length - 1; i < portraitBay.length; j = i++) {
    const [ax, ay] = portraitBay[i], [bx, by] = portraitBay[j]
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside
  }
  return inside
}

for (const layout of ['landscape', 'portrait']) {
  const { data, info } = await sharp(new URL(`../../site/src/assets/landing/story-map-ink-${layout}.webp`, import.meta.url).pathname).greyscale().raw().toBuffer({ resolveWithObject: true })
  const { width, height } = info
  const size = width * height
  const blocked = new Uint8Array(size), water = new Uint8Array(size), queue = new Uint32Array(size)
  // Close tiny pencil gaps in the shoreline before filling the central sea.
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (data[y * width + x] >= 165) continue
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) blocked[(y + dy) * width + x + dx] = 1
    }
  }
  let head = 0, tail = 1
  queue[0] = Math.floor(height * 0.5) * width + Math.floor(width * 0.5)
  water[queue[0]] = 255
  while (head < tail) {
    const pixel = queue[head++], x = pixel % width, y = Math.floor(pixel / width)
    for (const next of [x > 0 ? pixel - 1 : -1, x < width - 1 ? pixel + 1 : -1, y > 0 ? pixel - width : -1, y < height - 1 ? pixel + width : -1]) {
      if (next < 0 || blocked[next] || water[next]) continue
      water[next] = 255
      queue[tail++] = next
    }
  }
  if (layout === 'portrait') {
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      if (water[y * width + x] && !inBay(x * 100 / width, y * 100 / height)) water[y * width + x] = 0
    }
  }
  await sharp(water, { raw: { width, height, channels: 1 } })
    .resize({ width: 512 }).blur(1).threshold(100).png({ palette: true })
    .toFile(new URL(`../../site/src/assets/landing/story-map-water-${layout}.png`, import.meta.url).pathname)
}
