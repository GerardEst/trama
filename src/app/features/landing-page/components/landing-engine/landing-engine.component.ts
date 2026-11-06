import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { TranslationKey } from 'src/app/core/i18n/i18n.types'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

export type StoryReference = { id: string } | { slug: string }

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const POINTS = ['same', 'design', 'live'] as const
type EnginePoint = (typeof POINTS)[number]

/** Reads a story id, custom address or sharing link the way the public story API expects it. */
export function storyReference(input: string): StoryReference | null {
  const value = input.trim()
  if (!value) return null
  const id = value.match(UUID)?.[0]
  if (id) return { id: id.toLowerCase() }
  const slug = value.split(/[?#]/)[0].split('/').filter(Boolean).pop() ?? ''
  return SLUG.test(slug) && slug.length <= 80 ? { slug } : null
}

@Component({
  selector: 'polo-landing-engine',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './landing-engine.component.html',
  styleUrl: './landing-engine.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingEngineComponent {
  private readonly i18n = inject(I18nService)

  readonly npmUrl = 'https://www.npmjs.com/package/@trama-app/engine'
  readonly sourceUrl = 'https://github.com/GerardEst/trama/tree/main/packages/engine'
  readonly points = POINTS
  readonly storyPlaceholder = 'https://trama.app/private/…'

  readonly story = signal('')
  readonly copyState = signal<'idle' | 'copied' | 'failed'>('idle')

  readonly reference = computed(() => storyReference(this.story()))
  readonly invalidStory = computed(() => !!this.story().trim() && !this.reference())

  /** The fetchStory argument, with a placeholder until a valid story is given. */
  readonly referenceCode = computed(() => {
    const reference = this.reference()
    if (!reference) return `{ id: '${this.i18n.t('landing.engine.agent.placeholderId')}' }`
    return 'id' in reference ? `{ id: '${reference.id}' }` : `{ slug: '${reference.slug}' }`
  })

  readonly prompt = computed(() =>
    this.i18n.t('landing.engine.agent.prompt', { reference: this.referenceCode(), npm: this.npmUrl })
  )

  readonly code = computed(() => [
    'npm install @trama-app/engine',
    '',
    `import { createGame, fetchStory } from '@trama-app/engine'`,
    '',
    `const story = await fetchStory(${this.referenceCode()})`,
    'const game = createGame(story.tree)',
    `game.subscribe(event => {`,
    `  if (event.type === 'state') draw(event.state)`,
    '})',
    'game.start()',
  ].join('\n'))

  pointKey(point: EnginePoint, field: 'title' | 'description'): TranslationKey {
    return `landing.engine.points.${point}.${field}`
  }

  setStory(value: string) {
    this.story.set(value)
    this.copyState.set('idle')
  }

  async copyPrompt() {
    try {
      await navigator.clipboard.writeText(this.prompt())
      this.copyState.set('copied')
    } catch {
      this.copyState.set('failed')
    }
  }
}
