import { InjectionToken } from '@angular/core'

const STORAGE = 'https://lsemostpqoguehpsbzgu.supabase.co/storage/v1/object/public/images/'

/**
 * Turns the path a story keeps for an image into the address it is served from:
 * Trama's public image storage, unless a host (the site's example boards) serves
 * its stories' images itself.
 */
export const STORY_IMAGE_URL = new InjectionToken<(path: string) => string>('STORY_IMAGE_URL', {
  providedIn: 'root',
  factory: () => path => STORAGE + path,
})
