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
      console.log('error uploading:', error)
      return false
    }
    return data
  }
}
