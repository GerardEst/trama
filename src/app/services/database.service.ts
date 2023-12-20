import { Injectable } from '@angular/core'
import { createClient } from '@supabase/supabase-js'

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  supabase: any
  newTree: object = {
    name: 'Starter',
    nodes: [
      {
        id: 'node_0',
        left: 200,
        top: 200,
      },
    ],
  }

  constructor() {
    this.supabase = createClient(
      'https://lsemostpqoguehpsbzgu.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZW1vc3RwcW9ndWVocHNiemd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTE2OTkwNTUsImV4cCI6MTk2NzI3NTA1NX0.NTzZHJPUeppG7TTVvOibWIdRr4zf-v-1RR_iWY5MdLM'
    )
  }

  async getAllTrees() {
    let { data: trees, error } = await this.supabase
      .from('trees')
      .select('id,name')

    return trees
  }

  async getTree(treeId: number) {
    let { data: trees, error } = await this.supabase
      .from('trees')
      .select('*')
      .eq('id', treeId)

    return trees[0].tree
  }

  async createNewTree() {
    const { data, error } = await this.supabase
      .from('trees')
      .insert([{ name: 'My new tree', tree: this.newTree }])
      .select()

    if (error) return false
    return data
  }

  async saveLocalToDB() {
    //@ts-ignore
    const savedTree = JSON.parse(localStorage.getItem('polo-tree'))
    //@ts-ignore
    const treeId = JSON.parse(localStorage.getItem('polo-id'))

    const { data, error } = await this.supabase
      .from('trees')
      .update({ tree: savedTree })
      .eq('id', treeId)
      .select()

    if (error) return false
    return true
  }
}
