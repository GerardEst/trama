import { Injectable, WritableSignal, signal } from '@angular/core'
import { createClient } from '@supabase/supabase-js'
import { environment } from 'src/environments/environment'
import { tree } from '../interfaces'

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  public supabase: any
  user: WritableSignal<any> = signal(null)

  prod = !environment.production

  constructor() {
    this.supabase = createClient(
      'https://lsemostpqoguehpsbzgu.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZW1vc3RwcW9ndWVocHNiemd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTE2OTkwNTUsImV4cCI6MTk2NzI3NTA1NX0.NTzZHJPUeppG7TTVvOibWIdRr4zf-v-1RR_iWY5MdLM'
    )
  }

  async getUser() {
    try {
      const fetchUser = await this.supabase.auth.getUser()
      const profileInfo = await this.getUserProfile(fetchUser.data.user.id)
      this.user.set({ ...fetchUser.data.user, profile: profileInfo })
      console.log('user info', this.user())
      return this.user
    } catch {
      return false
    }
  }

  async getUserProfile(userId: string) {
    if (this.prod)
      console.log(
        '%cdb call to get the profile of the active user',
        'color: #9999ff'
      )

    let { data: userProfile, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)

    return userProfile[0]
  }

  async getSubscriptionOfCreatorOfStory(storyId: string) {
    if (this.prod)
      console.log(
        '%cdb call to get the subscription status of the creator of a story',
        'color: #9999ff'
      )

    let { data: subscription, error } = await this.supabase
      .from('stories')
      .select('profiles(subscription_status)')
      .eq('id', storyId)

    if (error) return false

    return !!subscription[0].profiles.subscription_status
  }

  async getAllTreesForUser(userId: string) {
    if (this.prod)
      console.log(
        '%cdb call to get all the stories id and name for the active user',
        'color: #9999ff'
      )

    let { data: stories, error } = await this.supabase
      .from('stories')
      .select('id,name')
      .eq('profile_id', userId)

    return stories
  }

  async getStoryWithCustomID(customId: string) {
    if (this.prod)
      console.log(
        '%cdb call to get everything about a story with a custom id',
        'color: #9999ff',
        customId
      )
    // Can't limit to stories of a user because the stories are PUBLIC and can be fetched by everyone to play them
    let { data: stories, error } = await this.supabase
      .from('stories')
      .select('*')
      .eq('custom_id', customId)

    if (error || !stories[0]) {
      return false
    }
    return stories[0]
  }

  async getStoryWithID(storyId: string) {
    if (this.prod)
      console.log(
        '%cdb call to get everything about a story with a normal id',
        'color: #9999ff'
      )
    // Can't limit to stories of a user because the stories are PUBLIC and can be fetched by everyone to play them
    let { data: stories, error } = await this.supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)

    if (error || !stories[0]) {
      return false
    }
    return stories[0]
  }
  async getNewestStory() {
    // Gets the most recently updated story, and the newest if there are multiple
    if (this.prod)
      console.log(
        '%cdb call to get everyting about THE NEWEST story of the user',
        'color: #9999ff'
      )

    let { data: stories, error } = await this.supabase
      .from('stories')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .eq('profile_id', this.user().id)

    if (stories.length === 0) {
      console.log('User has no stories')
      return false
    }
    console.log('The newest story is ', stories)
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
      console.log('%cdb call to save story to db', 'color: #9999ff')

    // const size = new TextEncoder().encode(JSON.stringify(treeContent)).length
    // const kiloBytes = size / 1024
    // console.log(
    //   '%caprox size of tree being saved: ' + kiloBytes + 'kb',
    //   'color: #9999ff'
    // )

    const { data, error } = await this.supabase
      .from('stories')
      .update({ tree: treeContent })
      .eq('id', treeId)

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
      .select('custom_id, tracking, sharing, tapLink, cumulativeMode, footer')
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

  async setTapLinkOf(storyId: string, tapLink: boolean) {
    if (this.prod)
      console.log(
        '%cdb call to hide the textandplay link from the story',
        'color: #9999ff'
      )
    const { data, error } = await this.supabase
      .from('stories')
      .update({ tapLink: tapLink })
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

  async setCumulativeModeOf(storyId: string, cumulativeMode: boolean) {
    if (this.prod)
      console.log(
        '%cdb call to toggle cumulative mode of a story',
        'color: #9999ff'
      )
    const { data, error } = await this.supabase
      .from('stories')
      .update({ cumulativeMode: cumulativeMode })
      .eq('id', storyId)

    if (error) return false
    return true
  }

  async updateCustomIdOf(storyId: string, customId: boolean) {
    if (this.prod)
      console.log('%cdb call to set the custom ID of a story', 'color: #9999ff')
    const { data, error } = await this.supabase
      .from('stories')
      .update({ custom_id: customId })
      .eq('id', storyId)

    if (error) return false
    return true
  }

  async updateFooterOf(
    storyId: string,
    footer: {
      text: string
      link: string
    }
  ) {
    if (this.prod)
      console.log(
        '%cdb call to set the footer options of a story',
        'color: #9999ff'
      )
    const { data, error } = await this.supabase
      .from('stories')
      .update({ footer: footer })
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

  async getStadisticsOfTree(storyId: string, withPath: boolean = false) {
    if (this.prod)
      console.log(
        '%cdb call to get the stadistics of a story',
        'color: #9999ff'
      )

    const { data, error } = await this.supabase
      .from('games')
      .select(
        `created_at, result, user_name ${withPath && ', path, external_events'}`
      )
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
