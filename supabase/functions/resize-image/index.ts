/**
 * UNUSED
 *
 * Using the aws function because it gives more compute time
 * Leaving it here in case I want to go back (maybe for excessive costs on aws)
 *
 */

import {
  ImageMagick,
  IMagickImage,
  initialize,
  MagickFormat,
} from 'https://deno.land/x/imagemagick_deno/mod.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': 'https://www.textandplay.com',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      status: 204,
    })
  }
  try {
    // We obtain the image and the buffer to work with
    const formData = await req.formData()
    const image = formData.get('image')
    const imageArrayBuffer = await image.arrayBuffer()
    const imageBuffer = new Uint8Array(imageArrayBuffer)

    const log = {}

    if (!image) {
      throw new Error('No file uploaded')
    }

    // ImageMagic processment
    await initialize()

    const resizedImage = await ImageMagick.read(
      imageBuffer,
      async (img: IMagickImage) => {
        log.originalSize = `${img.width}x${img.height}`
        log.originalWeight = imageBuffer.length / 1000 + 'KB'

        img.resize(600, 600)

        log.finalSize = `${img.width}x${img.height}`

        // Strip metadata to reduce file size
        img.strip()

        return await img.write(
          MagickFormat.Webp,
          (data: Uint8Array) => {
            log.finalWeight = data.length / 1000 + 'KB'
            return data
          },
          {
            quality: 75,
            effort: 6, // WebP compression effort (0-6)
          }
        )
      }
    )

    console.log(log)

    return new Response(resizedImage, {
      headers: {
        'Access-Control-Allow-Origin': 'https://www.textandplay.com',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'image/webp',
      },
      status: 200,
    })
  } catch (err) {
    console.log({ err })
    return new Response(String(err?.message ?? err), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://www.textandplay.com',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      status: 500,
    })
  }
})
