import { Image } from 'https://deno.land/x/imagescript/mod.ts'

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
    const { file } = req.body
    console.log({ file })

    const image = await Image.decode(file)
    console.log({ image })

    const resized = image.resize(300, 300)
    console.log({ resized })
    //await Deno.writeFile('output.png', await resized.encode())

    return new Response(
      JSON.stringify({
        message: 'Image cropped successfully',
        data: resized,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'https://www.textandplay.com',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        status: 200,
      }
    )
  } catch (err) {
    return new Response(String(err?.message ?? err), { status: 500 })
  }
})

// const sharp = require('sharp')
// const { createClient } = require('@supabase/supabase-js')

// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// exports.handler = async (event) => {
//   const { file } = event.body

//   // Resize and crop the image
//   const resizedImage = await sharp(file)
//     .resize(300, 300)
//     .crop(sharp.gravity.center)
//     .toBuffer()

//   // Upload the cropped and resized image to Supabase Storage
//   const { data, error } = await supabase.storage
//     .from('your-bucket')
//     .upload('path/to/image.jpg', resizedImage)

//   if (error) {
//     return { statusCode: 500, body: JSON.stringify({ error }) }
//   }

//   return { statusCode: 200, body: JSON.stringify({ data }) }
// }
