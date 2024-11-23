import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root',
})
export class ApisService {
  constructor() {}

  async getOptimizedImage(image: File) {
    const formData = new FormData()
    formData.append('image', image)

    try {
      const req = await fetch(
        'https://kpxqjqny2xn6tz5xnf2fqe2u4a0ryvky.lambda-url.eu-west-2.on.aws/',
        {
          method: 'POST',
          body: formData,
        }
      )

      if (req.status !== 200) throw new Error('errr')

      const blob = await req.blob()

      return blob
    } catch (err) {
      return false
    }
  }
}
