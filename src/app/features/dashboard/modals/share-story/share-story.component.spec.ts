import { ComponentFixture, TestBed } from '@angular/core/testing'
import { signal } from '@angular/core'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ShareStoryComponent } from './share-story.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { DatabaseService } from 'src/app/core/services/database.service'

describe('ShareStoryComponent', () => {
  let component: ShareStoryComponent
  let fixture: ComponentFixture<ShareStoryComponent>
  let story: ActiveStoryService
  let db: jasmine.SpyObj<DatabaseService>
  const pending = signal(false)
  const saveState = signal('saved')
  let clipboardDescriptor: PropertyDescriptor | undefined
  let copy: jasmine.Spy

  beforeEach(async () => {
    pending.set(false)
    saveState.set('saved')
    db = jasmine.createSpyObj<DatabaseService>('DatabaseService', ['getConfigurationOf', 'updateCustomIdOf', 'setSharingOf'], {
      authenticationRequired: signal(false),
    })
    db.getConfigurationOf.and.resolveTo({ custom_id: null, sharing: false, tracking: false, tapLink: false, cumulativeMode: false, footer: {} })
    db.updateCustomIdOf.and.resolveTo('saved')
    db.setSharingOf.and.resolveTo(true)
    clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    copy = jasmine.createSpy('writeText').and.resolveTo()
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: copy } })
    await TestBed.configureTestingModule({
      imports: [ShareStoryComponent, NoopAnimationsModule],
      providers: [
        { provide: DatabaseService, useValue: db },
        { provide: StoryMutationService, useValue: { hasUnsavedChanges: pending, saveState, retry: jasmine.createSpy('retry') } },
      ],
    }).compileComponents()
    story = TestBed.inject(ActiveStoryService)
    story.load('story-1', 'The island', { nodes: [{ id: 'node_0', type: 'end', text: 'Secret ending', top: 0, left: 0 }] })
    fixture = TestBed.createComponent(ShareStoryComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.detectChanges()
  })

  afterEach(() => {
    if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor)
    else Reflect.deleteProperty(navigator, 'clipboard')
  })

  it('explains public link access and opens the same saved address as the player', () => {
    expect(fixture.nativeElement.textContent).toContain('without an account')
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement
    expect(link.href).toBe(component.readingUrl())
    expect(link.target).toBe('_blank')
    expect(component.unavailable).toBeFalse()
  })

  it('keeps the saved URL and editable field when a duplicate alias is rejected', async () => {
    db.updateCustomIdOf.and.resolveTo('taken')
    const previous = component.readingUrl()
    component.customId = 'already-taken'
    await component.saveCustomId()
    fixture.detectChanges()
    expect(component.readingUrl()).toBe(previous)
    expect(story.storyConfiguration().customId).toBeNull()
    expect(component.customId).toBe('already-taken')
    expect(fixture.nativeElement.querySelector('#story-custom-id')).toBeTruthy()
    expect(fixture.nativeElement.textContent).toContain('already in use')
  })

  it('rejects reserved and malformed paths before writing', async () => {
    for (const customId of ['ca', 'dashboard', 'two words', 'a/b']) {
      component.customId = customId
      await component.saveCustomId()
      expect(component.slugError).not.toBeNull()
    }
    expect(db.updateCustomIdOf).not.toHaveBeenCalled()
  })

  it('adopts a new URL only after a positively confirmed write', async () => {
    let finish!: (value: 'saved') => void
    db.updateCustomIdOf.and.returnValue(new Promise(resolve => { finish = resolve }))
    component.customId = 'the-island'
    const saved = component.saveCustomId()
    expect(component.readingUrl()).toBe(component.stableUrl)
    expect(component.savingSlug).toBeTrue()
    finish('saved')
    await saved
    expect(component.readingUrl()).toBe(`${component.baseRoute}/the-island`)
  })

  it('requires confirmation before replacing or removing an existing alias', async () => {
    story.patchConfiguration({ customId: 'old-island' })
    component.customId = ''
    await component.saveCustomId()
    expect(component.confirmChange).toBeTrue()
    expect(db.updateCustomIdOf).not.toHaveBeenCalled()
    await component.saveCustomId()
    expect(db.updateCustomIdOf).toHaveBeenCalledWith('story-1', null)
    expect(component.readingUrl()).toBe(component.stableUrl)
  })

  it('does not claim a failed clipboard operation succeeded', async () => {
    copy.and.rejectWith(new DOMException('Denied', 'NotAllowedError'))
    await component.copyLink()
    expect(component.feedback).toBe('dashboard.share.copyManually')
    copy.and.resolveTo()
    await component.copyLink()
    expect(component.feedback).toBe('dashboard.share.copied')
  })

  it('waits for clipboard confirmation and ignores repeated clicks', async () => {
    let finish!: () => void
    copy.and.returnValue(new Promise<void>(resolve => { finish = resolve }))
    const copied = component.copyLink()
    await component.copyLink()
    expect(component.feedback).toBeNull()
    expect(copy).toHaveBeenCalledTimes(1)
    finish()
    await copied
    expect(component.feedback).toBe('dashboard.share.copied')
  })

  it('blocks sharing while saving, after failed saves, without an entry or after session expiry', async () => {
    pending.set(true)
    saveState.set('error')
    fixture.detectChanges()
    await component.copyLink()
    expect(copy).not.toHaveBeenCalled()
    expect(fixture.nativeElement.textContent).toContain('latest changes have not been saved')
    pending.set(false)
    db.authenticationRequired.set(true)
    expect(component.unavailable).toBeTrue()
    db.authenticationRequired.set(false)
    story.updateTree(tree => { tree.entryPoint = { left: 0, top: 0 } })
    expect(component.unavailable).toBeTrue()
  })

  it('confirms the share toggle without requiring legacy plan or subscription checks', async () => {
    const checkbox = fixture.nativeElement.querySelector('.sharingToggle input') as HTMLInputElement
    expect(checkbox.disabled).toBeFalse()
    expect(fixture.nativeElement.querySelector('.planBadge')).toBeNull()
    await component.toggleSharing()
    expect(db.setSharingOf).toHaveBeenCalledWith('story-1', true)
    expect(story.storyConfiguration().sharing).toBeTrue()
  })

  it('keeps the saved setting after failure and allows retry without a plan gate', async () => {
    db.setSharingOf.and.resolveTo(false)
    await component.toggleSharing()
    expect(story.storyConfiguration().sharing).toBeFalse()
    expect(component.sharingError).toBeTrue()
    db.setSharingOf.and.resolveTo(true)
    await component.toggleSharing()
    expect(story.storyConfiguration().sharing).toBeTrue()
    expect(component.sharingError).toBeFalse()
  })

  it('still blocks changes when the author must authenticate again', async () => {
    db.authenticationRequired.set(true)
    await component.toggleSharing()
    expect(db.setSharingOf).not.toHaveBeenCalled()
  })

  it('does not patch another story or a destroyed modal after an in-flight write', async () => {
    let finish!: (value: 'saved') => void
    db.updateCustomIdOf.and.returnValue(new Promise(resolve => { finish = resolve }))
    component.customId = 'new-link'
    const saved = component.saveCustomId()
    story.load('story-2', 'Other story', { nodes: [] })
    fixture.destroy()
    finish('saved')
    await saved
    expect(story.storyConfiguration().customId).toBeUndefined()
  })

  it('disables sharing if settings cannot be checked and allows retry', async () => {
    db.getConfigurationOf.and.resolveTo(null)
    await component.loadConfiguration()
    expect(component.unavailable).toBeTrue()
    await component.copyLink()
    expect(copy).not.toHaveBeenCalled()
    db.getConfigurationOf.and.resolveTo({ custom_id: 'saved-island', sharing: false, tracking: false, tapLink: false, cumulativeMode: false, footer: {} })
    await component.loadConfiguration()
    expect(component.unavailable).toBeFalse()
    expect(component.readingUrl()).toBe(`${component.baseRoute}/saved-island`)
  })
})
