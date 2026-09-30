import { Inject, Injectable, InjectionToken, OnDestroy, WritableSignal, signal } from '@angular/core'
import { createClient, SupabaseClient, Subscription } from '@supabase/supabase-js'
import { environment } from 'src/environments/environment'
import { appUser, tree, userProfile } from 'src/app/core/interfaces/interfaces'
import { withRetryableRefreshErrors } from './supabase-fetch'

export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient>('Supabase client', {
  providedIn: 'root',
  factory: () => createClient(environment.apiUrl, environment.apiAnonKey, {
    auth: { autoRefreshToken: true, persistSession: true },
    global: { fetch: withRetryableRefreshErrors(environment.apiUrl) },
  }),
})

@Injectable({
  providedIn: 'root',
})
export class DatabaseService implements OnDestroy {
  user: WritableSignal<appUser | null> = signal(null)
  readonly authenticationRequired = signal(false)
  private readonly authSubscription: Subscription

  constructor(@Inject(SUPABASE_CLIENT) public supabase: SupabaseClient) {
    const { data } = this.supabase.auth.onAuthStateChange((event, session) => {
      // Keep this callback synchronous: awaiting auth calls here can deadlock
      // Supabase's session lock. Never clear the editor on session changes.
      if (session) {
        this.authenticationRequired.set(false)
        const current = this.user()
        if (current?.id === session.user.id) {
          this.user.set({ ...session.user, profile: current.profile })
        } else if (current) {
          this.user.set(null)
        }
      } else if (event === 'SIGNED_OUT') {
        this.user.set(null)
        this.authenticationRequired.set(true)
      }
    })
    this.authSubscription = data.subscription
  }

  ngOnDestroy() {
    this.authSubscription.unsubscribe()
  }

  async getUser() {
    try {
      let fetchUser = await this.supabase.auth.getUser()
      if (fetchUser.error?.status === 401) {
        const refreshed = await this.supabase.auth.refreshSession()
        if (refreshed.error || !refreshed.data.session) return false
        fetchUser = await this.supabase.auth.getUser()
      }
      const authUser = fetchUser.data.user
      if (!authUser) return false

      const profileInfo = await this.getUserProfile(authUser.id)
      const { data, error } = await this.supabase.auth.getSession()
      // A profile request must not resurrect a user who signed out or switched
      // accounts while it was in flight. Network errors don't revoke a session.
      if (error || data.session?.user.id !== authUser.id || !profileInfo) return false
      this.user.set({ ...authUser, profile: profileInfo })
      this.authenticationRequired.set(false)

      return this.user()
    } catch {
      return false
    }
  }

  public userPlanIs(plan: string) {
    const user = this.user()
    if (!user) return false

    const nextPaymentDate = new Date(user.profile.next_payment)
    const dateOfNow = new Date(Date.now())

    if (
      user.profile.subscription_status === 'canceled' &&
      nextPaymentDate > dateOfNow
    ) {
      if (user.profile.plan.includes(plan)) return true
    }
    if (user.profile.subscription_status === 'active') {
      if (user.profile.plan.includes(plan)) return true
    }
    return false
  }

  private async getUserProfile(userId: string): Promise<userProfile> {
    if (!environment.production)
      console.log(
        '%cdb call to get the profile of the active user',
        'color: #9999ff'
      )

    const { data, error } = await this.supabase
      .from('profiles')
      .select('subscription_status, plan, user_name, next_payment')
      .eq('id', userId)

    return data?.[0] as userProfile
  }

  async getAllTreesForUser(userId: string) {
    if (!environment.production)
      console.log(
        '%cdb call to get all the stories id and name for the active user',
        'color: #9999ff'
      )

    const { data: stories, error } = await this.supabase
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
    const { data: stories, error } = await this.supabase
      .from('stories')
      .select('*')
      .eq('custom_id', customId)

    if (error || !stories?.[0]) {
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
    const { data: stories, error } = await this.supabase
      .from('stories')
      .select(infoToGet)
      .eq('id', storyId)

    if (error || !stories?.[0]) {
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

    const userId = this.user()?.id
    if (!userId) return false

    const { data: stories, error } = await this.supabase
      .from('stories')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .eq('profile_id', userId)

    if (!stories || stories.length === 0) {
      return false
    }
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

  async saveTreeToDB(treeId: string, treeContent: tree): Promise<boolean> {
    const userId = this.user()?.id
    if (!userId) return false

    const controller = new AbortController()
    let timeout: ReturnType<typeof setTimeout> | undefined
    const expired = new Promise<boolean>((resolve) => {
      timeout = setTimeout(() => {
        controller.abort()
        resolve(false)
      }, 15000)
    })

    try {
      // The deadline includes session recovery, not only the PATCH. Auth calls
      // cannot take this signal, so check it before any subsequent write.
      return await Promise.race([
        this.saveTreeWithSession(treeId, treeContent, userId, controller.signal),
        expired,
      ])
    } catch (error: unknown) {
      console.error('Could not save the story', error)
      return false
    } finally {
      clearTimeout(timeout)
    }
  }

  private async saveTreeWithSession(treeId: string, treeContent: tree, userId: string, signal: AbortSignal): Promise<boolean> {
    // getSession already refreshes an expiring JWT through the SDK. Do not
    // send an anonymous PATCH when the refresh token is no longer available.
    const sessionResult = await this.supabase.auth.getSession()
    if (signal.aborted || sessionResult.error) return false
    if (!sessionResult.data.session) {
      this.user.set(null)
      this.authenticationRequired.set(true)
      return false
    }
    if (sessionResult.data.session.user.id !== userId || this.user()?.id !== userId) return false

    for (let attempt = 0; attempt < 2; attempt++) {
      const { data, error, status } = await this.supabase
        .from('stories')
        .update({ tree: treeContent })
        .eq('id', treeId)
        .select('id')
        .abortSignal(signal)
        .single()

      if (status === 401 && attempt === 0 && !signal.aborted) {
        const refreshed = await this.supabase.auth.refreshSession()
        if (signal.aborted || refreshed.error) return false
        if (!refreshed.data.session) {
          this.user.set(null)
          this.authenticationRequired.set(true)
          return false
        }
        // Never replay one author's snapshot under another account.
        if (refreshed.data.session.user.id !== userId || this.user()?.id !== userId) return false
        continue
      }

      // Permission/zero-row errors are not evidence of an expired JWT. Only
      // acknowledge a positively confirmed update; do not refresh for RLS.
      if (signal.aborted || error || data?.id !== treeId) {
        console.error('Story save was not confirmed by the database', error?.code ?? 'no updated row')
        return false
      }
      return true
    }
    return false
  }

  async getConfigurationOf(storyId: string) {
    if (!environment.production)
      console.log(
        '%cdb call to get the configuration of the story ' + storyId,
        'color: #9999ff'
      )
    const { data, error } = await this.supabase
      .from('stories')
      .select('custom_id, tracking, sharing, tapLink, cumulativeMode, footer')
      .eq('id', storyId)

    if (error) {
      console.error(error)
      return null
    }

    return data?.[0]
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

    const refs = (data?.[0] as any)?.refs ?? {}
    const arrayOfRefs = Object.keys(refs).map((ref: any) => {
      return {
        ...refs[ref],
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
