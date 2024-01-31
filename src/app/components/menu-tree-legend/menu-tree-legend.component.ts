import { Component, Input, effect } from '@angular/core'
import { TreeErrorNotifierComponent } from 'src/app/components/tree-error-notifier/tree-error-notifier.component'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { StorageService } from 'src/app/services/storage.service'

@Component({
  selector: 'polo-menu-tree-legend',
  standalone: true,
  imports: [TreeErrorNotifierComponent],
  templateUrl: './menu-tree-legend.component.html',
  styleUrl: './menu-tree-legend.component.sass',
})
export class MenuTreeLegendComponent {
  @Input() treeId?: string
  arrayOfRefs: Array<any> = []
  amountsOfRefs: any = {}

  constructor(
    public activeStory: ActiveStoryService,
    private storage: StorageService
  ) {
    effect(() => {
      this.arrayOfRefs = []
      // Pos aquí he de fer aquesta merda perquè vaig decidir guardar els refs amb objectes
      // podria cambiarho directament si això es complica
      // Ara reacciona aixo a quan s'afegeix una ref, pero no a quan s'afegeix una que ja
      // existeix
      if (activeStory.storyRefs()) {
        for (let ref in activeStory.storyRefs()) {
          let data: { [key: string]: any } = activeStory.storyRefs()
          this.arrayOfRefs.push({
            ref,
            name: data[ref].name,
            type: data[ref].type,
            times: this.amountsOfRefs[ref],
          })
        }
      }
    })
  }

  ngOnInit() {
    this.amountsOfRefs = this.storage.getAmountsOfRefs()
  }
  /** Necessito que aquí es pintin tots els tags que s'han fet servir
   * en directe mentre canvien
   * Podria posar-los al service que vaig fer, dins una signal tipo array...
   * i veure si es pot
   *
   * Despres aqui quan canvii aquella signal pos res, que la pinti.
   * Com que la signal cambia pos quan cambia, no s'inicia. La he d'iniciar o pillant
   * el localstorage directament, o al iniciar l'arbre, millor.
   */

  async goToPlayground() {
    //await this.saveToDb()
    window.open('/playground/' + this.treeId, '_blank')
  }
}
