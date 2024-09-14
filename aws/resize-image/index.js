/** To upload this function, zip it and upload in AWS Lambda -> resize-image function */

const sharp = require('sharp')
const Busboy = require('busboy')

exports.handler = async function (event, context) {
  // Ensure the body is base64-encoded (image data)
  if (!event.isBase64Encoded) {
    return {
      statusCode: 400,
      body: 'Request body must be base64-encoded',
    }
  }

  const bodyBuffer = Buffer.from(event.body, 'base64')
  const contentType = event.headers['content-type']

  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: { 'content-type': contentType } })
    let imageBuffer = null

    busboy.on('file', (fieldname, file) => {
      const chunks = []

      file.on('data', (data) => {
        chunks.push(data)
      })

      file.on('end', () => {
        imageBuffer = Buffer.concat(chunks)
      })
    })

    busboy.on('finish', async () => {
      if (!imageBuffer) {
        return resolve({
          statusCode: 400,
          body: 'Image file not provided',
        })
      }

      try {
        const processedImage = await sharp(imageBuffer)
          .resize(600)
          .toFormat('webp')
          .webp({
            quality: 80,
            smartSubsample: true,
            //nearLossless: true
          })
          .toBuffer()

        console.log(processedImage)
        resolve({
          statusCode: 200,
          body: processedImage.toString('base64'),
          isBase64Encoded: true,
          headers: {
            'Content-Type': 'image/webp',
          },
        })
      } catch (error) {
        resolve({
          statusCode: 500,
          body: JSON.stringify(error),
        })
      }
    })

    // Write the body buffer to busboy for processing
    busboy.end(bodyBuffer)
  })
}
