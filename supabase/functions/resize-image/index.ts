//import { Image } from 'https://deno.land/x/imagescript/mod.ts'
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

    if (!image) {
      throw new Error('No file uploaded')
    }

    // ImageMagic
    await initialize()

    const resizedImage = await ImageMagick.read(
      imageBuffer,
      async (img: IMagickImage) => {
        img.resize(200, 100)
        img.blur(20, 6)

        console.log(img)
        console.log(img.write(MagickFormat.Jpeg))
        return img.write(MagickFormat.Jpeg)

        // await img.write(MagickFormat.Jpeg, (data: Uint8Array) =>
        //   Deno.writeFile('image-blur.jpg', data)
        // )
      }
    )

    // Imagescript
    // const image = await Image.decode(buffer)
    // console.log({ image })

    // const resized = image.resize(300, 300)
    // console.log({ resized })

    return new Response(
      JSON.stringify({
        message: 'Image cropped successfully',
        data: resized,
      }),
      {
        headers: {
          'Access-Control-Allow-Origin': 'https://www.textandplay.com',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    )
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
