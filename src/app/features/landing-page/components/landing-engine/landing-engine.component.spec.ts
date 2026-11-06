import { ComponentFixture, TestBed } from '@angular/core/testing'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { LandingEngineComponent, storyReference } from './landing-engine.component'

describe('storyReference', () => {
  const id = '3df4a8cd-26e7-4d76-b33b-c068f572698b'

  it('reads ids from sharing links and bare ids', () => {
    expect(storyReference(`https://trama.app/private/${id}`)).toEqual({ id })
    expect(storyReference(`  ${id.toUpperCase()} `)).toEqual({ id })
  })

  it('reads custom addresses from links and bare slugs', () => {
    expect(storyReference('https://trama.app/the-island?ref=mail#start')).toEqual({ slug: 'the-island' })
    expect(storyReference('trama.app/the-island/')).toEqual({ slug: 'the-island' })
    expect(storyReference('the-island')).toEqual({ slug: 'the-island' })
  })

  it('rejects what the story API would not accept', () => {
    expect(storyReference('')).toBeNull()
    expect(storyReference('The Island!')).toBeNull()
    expect(storyReference('a'.repeat(81))).toBeNull()
  })
})

describe('LandingEngineComponent', () => {
  let fixture: ComponentFixture<LandingEngineComponent>
  let page: HTMLElement

  const type = (value: string) => {
    const input = page.querySelector('#engine-story') as HTMLInputElement
    input.value = value
    input.dispatchEvent(new Event('input'))
    fixture.detectChanges()
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LandingEngineComponent] }).compileComponents()
    await TestBed.inject(I18nService).setLang('en', { persist: false })
    fixture = TestBed.createComponent(LandingEngineComponent)
    fixture.detectChanges()
    page = fixture.nativeElement
  })

  it('presents the open-source engine with links to npm and the source', () => {
    expect(page.querySelector('h2')?.textContent).toContain('in any interface.')
    expect(page.querySelector('a[href="https://www.npmjs.com/package/@trama-app/engine"]')).toBeTruthy()
    expect(page.querySelector('a[href="https://github.com/GerardEst/trama/tree/main/packages/engine"]')).toBeTruthy()
    expect(page.textContent).toContain('MIT license')
  })

  it('builds the agent prompt and the code from the story the author pastes', () => {
    const prompt = () => page.querySelector('.engine__prompt')?.textContent ?? ''
    const code = () => page.querySelector('.engine__code')?.textContent ?? ''

    expect(prompt()).toContain(`fetchStory({ id: 'YOUR_STORY_ID' })`)
    expect(prompt()).toContain('@trama-app/engine')
    expect(prompt()).toContain('https://www.npmjs.com/package/@trama-app/engine')

    type('https://trama.app/private/3df4a8cd-26e7-4d76-b33b-c068f572698b')
    expect(prompt()).toContain(`fetchStory({ id: '3df4a8cd-26e7-4d76-b33b-c068f572698b' })`)
    expect(code()).toContain(`fetchStory({ id: '3df4a8cd-26e7-4d76-b33b-c068f572698b' })`)

    type('https://trama.app/the-island')
    expect(prompt()).toContain(`fetchStory({ slug: 'the-island' })`)
    expect(page.querySelector('#engine-story')?.getAttribute('aria-invalid')).toBe('false')

    type('not a story!')
    expect(page.querySelector('#engine-story')?.getAttribute('aria-invalid')).toBe('true')
    expect(page.querySelector('.engine__hint')?.textContent).toContain('doesn’t look like')
    expect(prompt()).toContain(`fetchStory({ id: 'YOUR_STORY_ID' })`)
  })

  it('copies the prompt and reports when copying fails', async () => {
    const write = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve())
    type('the-island')
    const button = page.querySelector('.engine__copy-button') as HTMLButtonElement

    button.click()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(write).toHaveBeenCalledWith(jasmine.stringContaining(`fetchStory({ slug: 'the-island' })`))
    expect(button.textContent?.trim()).toBe('Prompt copied')

    write.and.returnValue(Promise.reject(new Error('denied')))
    button.click()
    await fixture.whenStable()
    fixture.detectChanges()
    expect(page.querySelector('.engine__copy-status')?.textContent).toContain('Could not copy it')
  })
})
