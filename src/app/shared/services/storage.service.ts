import { Injectable } from '@angular/core'
import { DatabaseService } from 'src/app/core/services/database.service'

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(private database: DatabaseService) {}

  async uploadImage(imagePath: string, imageBlob: Blob) {
    const { data, error } = await this.database.supabase.storage
      .from('images')
      .upload(imagePath, imageBlob, {
        contentType: 'image/webp',
        upsert: true,
      })
    if (error) {
      console.error('Error uploading image', error)
      return false
    }
    return data
  }

  async removeImage(imagePath: string) {
    const { error } = await this.database.supabase.storage
      .from('images')
      .remove([imagePath])

    if (error) {
      console.error('Error removing image', error)
      return false
    }

    return true
  }
}
