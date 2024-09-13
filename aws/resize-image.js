const sharp = require('sharp')

exports.handler = async function (req, context) {
  // We obtain the image and the buffer to work with
  const formData = await req.formData()
  const image = formData.get('image')
  const imageArrayBuffer = await image.arrayBuffer()
  const imageBuffer = new Uint8Array(imageArrayBuffer)

  const log = {}

  try {
    sharp(imageBuffer)
      .resize(200)
      .toFormat('webp')
      .toBuffer()
      .then((data) => {
        console.log({ data })
        return new Response(data, { status: 200 })
      })
      .catch((err) => {
        return new Response(err)
      })
  } catch (error) {
    return {
      statusCode: 500,
      body: error,
    }
  }
}
