import { Injectable } from '@angular/core'
import { createClient } from '@supabase/supabase-js'
import { environment } from 'src/environments/environment'
import { configuration } from './database-interfaces'
import { tree } from '../interfaces'

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  public supabase: any
  prod = !environment.production

  constructor() {
    this.supabase = createClient(
      'https://lsemostpqoguehpsbzgu.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZW1vc3RwcW9ndWVocHNiemd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTE2OTkwNTUsImV4cCI6MTk2NzI3NTA1NX0.NTzZHJPUeppG7TTVvOibWIdRr4zf-v-1RR_iWY5MdLM'
    )
  }

  async getAllTrees() {
    if (this.prod)
      console.log(
        '%cdb call to get all the stories id and name',
        'color: #9999ff'
      )
    let { data: stories, error } = await this.supabase
      .from('stories')
      .select('id,name')

    return stories
  }

  async getStory(storyId: string) {
    if (this.prod)
      console.log('%cdb call to get everything about a story', 'color: #9999ff')
    let { data: stories, error } = await this.supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)

    return stories[0]
  }
  async getNewestStory() {
    // Gets the most recently updated story, and the newest if there are multiple
    if (this.prod)
      console.log(
        '%cdb call to get everyting about THE NEWEST a story',
        'color: #9999ff'
      )
    let { data: stories, error } = await this.supabase
      .from('stories')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)

    return stories[0]
  }

  async removeImage() {}

  async createNewTree(story: object) {
    if (this.prod)
      console.log('%cdb call to create a new story', 'color: #9999ff')
    const { data, error } = await this.supabase
      .from('stories')
      .insert(story)
      .select()

    if (error) return false
    return data
  }

  async saveTreeToDB(treeId: string, treeContent: tree) {
    if (this.prod)
      console.log('%cdb call to save local story to db', 'color: #9999ff')

    const size = new TextEncoder().encode(JSON.stringify(treeContent)).length
    const kiloBytes = size / 1024
    console.log(
      '%caprox size of tree being saved: ' + kiloBytes + 'kb',
      'color: #9999ff'
    )
    console.time('savingTree')

    const { data, error } = await this.supabase
      .from('stories')
      .update({ tree: treeContent })
      .eq('id', treeId)

    console.timeEnd('savingTree')
    if (error) return false

    return true
  }

  async getConfigurationOf(storyId: string) {
    if (this.prod)
      console.log(
        '%cdb call to get the configuration of the story ' + storyId,
        'color: #9999ff'
      )
    let { data, error } = await this.supabase
      .from('stories')
      .select('tracking, cumulativeView, sharing, askName')
      .eq('id', storyId)

    if (error) return console.error(error)

    return data[0]
  }

  async setTrackingOf(storyId: string, tracking: boolean) {
    if (this.prod)
      console.log(
        '%cdb call to set the tracking status of a story',
        'color: #9999ff'
      )
    const { data, error } = await this.supabase
      .from('stories')
      .update({ tracking: tracking })
      .eq('id', storyId)

    if (error) return false
    return true
  }

  async setSharingOf(storyId: string, sharing: boolean) {
    if (this.prod)
      console.log(
        '%cdb call to set the sharing status of a story',
        'color: #9999ff'
      )
    const { data, error } = await this.supabase
      .from('stories')
      .update({ sharing: sharing })
      .eq('id', storyId)

    if (error) return false
    return true
  }

  async setCumulativeViewOf(storyId: string, cumulativeView: string | null) {
    if (this.prod)
      console.log(
        '%cdb call to set the CumulativeView status of a story',
        'color: #9999ff'
      )
    const { data, error } = await this.supabase
      .from('stories')
      .update({ cumulativeView: cumulativeView })
      .eq('id', storyId)

    if (error) return false
    return true
  }

  async setAskNameOf(storyId: string, askName: boolean) {
    if (this.prod)
      console.log(
        '%cdb call to set the askName status of a story',
        'color: #9999ff'
      )
    const { data, error } = await this.supabase
      .from('stories')
      .update({ askName: askName })
      .eq('id', storyId)

    if (error) return false
    return true
  }

  async saveNewStoryName(storyId: string, name: string) {
    if (this.prod)
      console.log('%cdb call to set a new name for a story', 'color: #9999ff')
    const { data, error } = await this.supabase
      .from('stories')
      .update({ name: name })
      .eq('id', storyId)

    if (error) return false
    return true
  }

  async getStadisticsOfTree(storyId: string) {
    if (this.prod)
      console.log(
        '%cdb call to get the stadistics of a story',
        'color: #9999ff'
      )
    const { data, error } = await this.supabase
      .from('games')
      .select('created_at, result, user_name')
      .eq('story', storyId)

    if (error) return false

    return data
  }

  async getRefsOfTree(storyId: string) {
    if (this.prod) console.log('db call to get only the refs of a story')
    console.log('%cdb call to get everything about a tree', 'color: #9999ff')
    const { data, error } = await this.supabase
      .from('stories')
      .select(`refs: tree->refs`)
      .eq('id', storyId)

    if (error) {
      console.log(error)
      return
    }

    return data[0].refs
  }

  async saveNewGameTo(
    id: string,
    username: string,
    story: string,
    path: Array<any>,
    result: any,
    externalEvents: Array<any>
  ) {
    if (this.prod)
      console.log('%cdb call to save a new anonymous game', 'color: #9999ff')
    const { data, error } = await this.supabase.from('games').upsert({
      id,
      result,
      user_name: username,
      story,
      path,
      external_events: externalEvents,
    })
    if (error) {
      console.log(error)
      return false
    }

    return true
  }

  async deleteStory(storyId: string) {
    console.log('deleting ' + storyId)
    const { data, error } = await this.supabase
      .from('stories')
      .delete()
      .eq('id', storyId)
    if (error) return console.error(error)
  }
}
