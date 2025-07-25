import { Injectable, WritableSignal, signal } from '@angular/core'
import { createClient } from '@supabase/supabase-js'
import { environment } from 'src/environments/environment'
import { ref, tree } from 'src/app/core/interfaces/interfaces'

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  public supabase: any
  user: WritableSignal<any> = signal(null)

  constructor() {
    this.supabase = createClient(environment.apiUrl, environment.apiAnonKey)
  }

  async getUser() {
    try {
      const fetchUser = await this.supabase.auth.getUser()
      const profileInfo = await this.getUserProfile(fetchUser.data.user.id)
      this.user.set({ ...fetchUser.data.user, profile: profileInfo })

      return this.user()
    } catch {
      return false
    }
  }

  public userPlanIs(plan: string) {
    const nextPaymentDate = new Date(this.user().profile.next_payment)
    const dateOfNow = new Date(Date.now())

    if (
      this.user().profile.subscription_status === 'canceled' &&
      nextPaymentDate > dateOfNow
    ) {
      if (this.user().profile.plan.includes(plan)) return true
    }
    if (this.user().profile.subscription_status === 'active') {
      if (this.user().profile.plan.includes(plan)) return true
    }
    return false
  }

  private async getUserProfile(userId: string) {
    if (!environment.production)
      console.log(
        '%cdb call to get the profile of the active user',
        'color: #9999ff'
      )

    let { data: userProfile, error } = await this.supabase
      .from('profiles')
      .select('subscription_status, plan, user_name, next_payment')
      .eq('id', userId)

    return userProfile[0]
  }

  async getAllTreesForUser(userId: string) {
    if (!environment.production)
      console.log(
        '%cdb call to get all the stories id and name for the active user',
        'color: #9999ff'
      )

    let { data: stories, error } = await this.supabase
      .from('stories')
      .select('id,name')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })

    return stories
  }

  async getStoryWithCustomID(customId: string) {
    if (!environment.production)
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

  async getStoryWithID(storyId: string, basicInfo = false) {
    if (!environment.production)
      console.log(
        basicInfo
          ? '%cdb call to get everything about a story with a normal id'
          : '%cdb call to get basic info about a story with a normal id',
        'color: #9999ff'
      )
    const infoToGet = basicInfo ? 'name' : '*'
    // Can't limit to stories of a user because the stories are PUBLIC and can be fetched by everyone to play them
    let { data: stories, error } = await this.supabase
      .from('stories')
      .select(infoToGet)
      .eq('id', storyId)

    if (error || !stories[0]) {
      return false
    }
    return stories[0]
  }
  async getNewestStory() {
    // Gets the most recently updated story, and the newest if there are multiple
    if (!environment.production)
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
    if (!environment.production)
      console.log('%cdb call to create a new story', 'color: #9999ff')
    const { data, error } = await this.supabase
      .from('stories')
      .insert(story)
      .select()

    if (error) return false
    return data
  }

  async saveTreeToDB(treeId: string, treeContent: tree) {
    if (!environment.production)
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
    if (!environment.production)
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
    if (!environment.production)
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
    if (!environment.production)
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
    if (!environment.production)
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
    if (!environment.production)
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

  async updateCustomIdOf(storyId: string, customId: string) {
    if (!environment.production)
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
    if (!environment.production)
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
    if (!environment.production)
      console.log('%cdb call to set a new name for a story', 'color: #9999ff')
    const { data, error } = await this.supabase
      .from('stories')
      .update({ name: name })
      .eq('id', storyId)

    if (error) return false
    return true
  }

  async getStadisticsOfTree(storyId: string, withPath: boolean = false) {
    if (!environment.production)
      console.log(
        '%cdb call to get the stadistics of a story',
        'color: #9999ff'
      )

    const { data, error } = await this.supabase
      .from('games')
      .select(
        `id, created_at, result, user_name ${
          withPath && ', path, external_events'
        }`
      )
      .eq('story', storyId)

    if (error) return false

    return data
  }

  async getRefsOfTree(storyId: string) {
    if (!environment.production)
      console.log('%cdb call to get only the refs of a story', 'color: #9999ff')

    const { data, error } = await this.supabase
      .from('stories')
      .select(`refs: tree->refs`)
      .eq('id', storyId)

    if (error) {
      console.log(error)
      return
    }

    const arrayOfRefs = Object.keys(data[0].refs).map((ref: any) => {
      return {
        ...data[0].refs[ref],
        id: ref,
      }
    })

    return arrayOfRefs
  }

  async saveNewGameTo(
    id: string,
    username: string,
    story: string,
    path: Array<any>,
    result: any,
    externalEvents: Array<any>
  ) {
    if (!environment.production)
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

    try {
      const { data, error } = await this.supabase
        .from('stories')
        .delete()
        .eq('id', storyId)
      
      return data
    } catch (err) {
      console.error('error deleting the story:', err)
      throw err
    }
    
  }
}
