import { Injectable } from '@angular/core'
import { createClient } from '@supabase/supabase-js'
import { environment } from 'src/environments/environment'

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
        '%cdb call to get all the trees id and name',
        'color: #9999ff'
      )
    let { data: trees, error } = await this.supabase
      .from('trees')
      .select('id,name')

    return trees
  }

  async getTree(treeId: number) {
    if (this.prod)
      console.log('%cdb call to get everything about a tree', 'color: #9999ff')
    let { data: trees, error } = await this.supabase
      .from('trees')
      .select('*')
      .eq('id', treeId)

    return trees[0].tree
  }

  async createNewTree(tree: object) {
    if (this.prod)
      console.log('%cdb call to create a new tree', 'color: #9999ff')
    const { data, error } = await this.supabase
      .from('trees')
      .insert(tree)
      .select()

    if (error) return false
    return data
  }

  async saveLocalToDB() {
    if (this.prod)
      console.log('%cdb call to save local tree to db', 'color: #9999ff')
    //@ts-ignore
    const savedTree = JSON.parse(localStorage.getItem('polo-tree'))
    //@ts-ignore
    const treeId = JSON.parse(localStorage.getItem('polo-id'))

    const { data, error } = await this.supabase
      .from('trees')
      .update({ tree: savedTree })
      .eq('id', treeId)

    if (error) return false

    return true
  }

  async getConfigurationOf(treeId: number) {
    if (this.prod)
      console.log(
        '%cdb call to get the configuration of a tree',
        'color: #9999ff'
      )
    let { data, error } = await this.supabase
      .from('trees')
      .select('tracking, view')
      .eq('id', treeId)

    console.log(data[0])
    return data[0]
  }

  async setTrackingOf(treeId: number, tracking: boolean) {
    if (this.prod)
      console.log(
        '%cdb call to set the tracking status of a tree',
        'color: #9999ff'
      )
    const { data, error } = await this.supabase
      .from('trees')
      .update({ tracking: tracking })
      .eq('id', treeId)

    if (error) return false
    return true
  }

  async setBookviewOf(treeId: number, view: string | null) {
    if (this.prod)
      console.log(
        '%cdb call to set the view status of a tree',
        'color: #9999ff'
      )
    const { data, error } = await this.supabase
      .from('trees')
      .update({ view: view })
      .eq('id', treeId)

    if (error) return false
    return true
  }

  async getStadisticsOfTree(treeId: number) {
    if (this.prod)
      console.log('%cdb call to get the stadistics of a tree', 'color: #9999ff')
    const { data, error } = await this.supabase
      .from('games')
      .select('created_at, result, user_name')
      .eq('tree', treeId)

    if (error) return false

    return data
  }

  async getRefsOfTree(treeId: number) {
    if (this.prod) console.log('db call to get only the refs of a tree')
    console.log('%cdb call to get everything about a tree', 'color: #9999ff')
    const { data, error } = await this.supabase
      .from('trees')
      .select(`refs: tree->refs`)
      .eq('id', treeId)

    if (error) {
      console.log(error)
      return
    }

    return data[0].refs
  }

  async saveNewGameTo(
    username: string,
    tree: number,
    path: Array<any>,
    result: any
  ) {
    if (this.prod)
      console.log('%cdb call to save a new anonymous game', 'color: #9999ff')
    const { data, error } = await this.supabase
      .from('games')
      .insert([{ result, user_name: username, tree, path }])
    if (error) {
      console.log(error)
      return false
    }

    return true
  }
}
