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
    console.log({ req })
    const formData = await req.formData
    const file = formData.get('image')

    if (!file) {
      throw new Error('No file uploaded')
    }

    console.log({ file })

    const image = await Image.decode(file)
    console.log({ image })

    const resized = image.resize(300, 300)
    console.log({ resized })

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
