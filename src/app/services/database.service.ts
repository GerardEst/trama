import { Injectable } from '@angular/core'
import { createClient } from '@supabase/supabase-js'

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  supabase: any

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

  async saveLocalToDB() {
    //@ts-ignore
    const savedTree = JSON.parse(localStorage.getItem('polo-tree'))
    //@ts-ignore
    const treeId = JSON.parse(localStorage.getItem('polo-id'))

    /**
     * ✅ Carregar la historia des de supabase
     * ✅ Guardar a localstorage el tree i, apart, l'id
     * ✅ A partir d'aquet moment es fa servir el localstorage
     * - Al guardar, fer servir l'id per saber quina historia cambiar a la db
     * - Si la historia no es de l'usuari, para, pero aixo mes endavant
     *
     * - A marco, carregar la historia fent servir l'id
     */
    // Create a single supabase client for interacting with your database

    const { data, error } = await this.supabase
      .from('trees')
      .insert([{ tree: savedTree }])
      .select()
  }
}
