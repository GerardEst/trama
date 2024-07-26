import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core'
import { ActiveStoryService } from 'src/app/services/active-story.service'
import { PlayerService } from 'src/app/pages/playground/services/player.service'

@Component({
  selector: 'polo-game-node',
  standalone: true,
  imports: [],
  templateUrl: './game-node.component.html',
  styleUrl: './game-node.component.sass',
})
export class GameNodeComponent {
  @ViewChild('node') node?: ElementRef
  @Input() data!: any
  @Input() disabled: boolean = false
  @Output() onSelectAnswer: EventEmitter<any> = new EventEmitter()
  @Output() onGoToLink: EventEmitter<any> = new EventEmitter()
  @Output() onShare: EventEmitter<any> = new EventEmitter()

  constructor(
    public activeStory: ActiveStoryService,
    private playerService: PlayerService
  ) {}

  getNativeElement(): HTMLElement {
    return this.node?.nativeElement
  }

  markAsSelected(event: any) {
    event.target.classList.add('selected')
  }

  getTextWithFinalParameters(text: string = '') {
    const withInlineReplacements = text.replace(
      /#([a-zA-Z0-9_]+)/g,
      (match: string, p1: string) => {
        // if the prop is not in player, we search in stats
        let value = this.playerService.player()[p1]
        if (!value) {
          value = this.playerService
            .player()
            .stats.find((stat: any) => stat.id === p1)?.amount
        }
        return value || '-'
      }
    )
    const withBlockReplacements = withInlineReplacements.replace(
      /\[([a-zA-Z0-9_]+)\]/g,
      (match: string, p1: string) => {
        let refsWithCategory: any = Object.values(
          this.activeStory.storyRefs()
        ).filter((val: any) => {
          return val.category === p1
        })

        let string = ' '
        for (let refWithCategory of refsWithCategory) {
          const playerStat = this.playerService
            .player()
            .stats.find((stat: any) => stat.id === refWithCategory.id)
          if (playerStat) {
            string =
              string +
              '\n' +
              this.capitalize(
                this.activeStory
                  .storyRefs()
                  .find((ref: any) => ref.id === playerStat.id).name
              ) +
              ': ' +
              playerStat.amount
          }
        }
        for (let refWithCategory of refsWithCategory) {
          const playerCondition = this.playerService
            .player()
            .conditions.find(
              (condition: any) => condition.id === refWithCategory.id
            )
          if (playerCondition) {
            string =
              string +
              '\n' +
              this.capitalize(
                this.activeStory
                  .storyRefs()
                  .find((ref: any) => ref.id === playerCondition.id).name
              )
          }
        }

        return string
      }
    )

    return withBlockReplacements
  }

  capitalize(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }
}
