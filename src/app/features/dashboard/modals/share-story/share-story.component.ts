import { Component, computed, OnDestroy, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { A11yModule } from '@angular/cdk/a11y'
import { ModalWindowComponent } from 'src/app/shared/components/ui/modal-window/modal-window.component'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { DatabaseService } from 'src/app/core/services/database.service'
import { BasicButtonComponent } from '../../../../shared/components/ui/basic-button/basic-button.component'
import { environment } from 'src/environments/environment'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { TranslationKey } from 'src/app/core/i18n/i18n.types'
import { brokenStoryAnswerCount, copyStoryLink, shareStoryLink, storyReadingUrl, validateStorySlug } from 'src/app/shared/utils/story-sharing'

@Component({
  selector: 'polo-share-story',
  standalone: true,
  imports: [ModalWindowComponent, BasicButtonComponent, TranslatePipe, FormsModule, A11yModule],
  templateUrl: './share-story.component.html',
  styleUrl: './share-story.component.css',
})
export class ShareStoryComponent implements OnInit, OnDestroy {
  readonly storyId = this.activeStory.storyId()
  readonly baseRoute = environment.baseRoute
  readonly readingUrl = computed(() => storyReadingUrl(this.baseRoute, this.storyId, this.activeStory.storyConfiguration().customId))
  readonly stableUrl = storyReadingUrl(this.baseRoute, this.storyId)
  readonly brokenAnswers = computed(() => brokenStoryAnswerCount(this.activeStory.entireTree()))
  loading = true
  loadError = false
  savingSlug = false
  savingSharing = false
  copying = false
  sharingLink = false
  customId = ''
  confirmChange = false
  slugError: TranslationKey | null = null
  sharingError = false
  feedback: TranslationKey | null = null
  private destroyed = false

  constructor(
    public activeStory: ActiveStoryService,
    public db: DatabaseService,
    public mutations: StoryMutationService,
    private i18n: I18nService
  ) {}

  get isCurrentStory() {
    return !this.destroyed && this.activeStory.storyId() === this.storyId
  }

  get unavailable() {
    return !this.storyId || !this.isCurrentStory || this.loading || this.loadError || this.savingSlug ||
      this.mutations.hasUnsavedChanges() || this.db.authenticationRequired() || !this.activeStory.initialNode()
  }

  get slugChanged() {
    return this.customId.trim() !== (this.activeStory.storyConfiguration().customId || '')
  }

  async ngOnInit() {
    await this.loadConfiguration()
  }

  ngOnDestroy() {
    this.destroyed = true
  }

  async loadConfiguration() {
    this.loading = true
    this.loadError = false
    try {
      const configuration = await this.db.getConfigurationOf(this.storyId)
      if (!this.isCurrentStory) return
      if (!configuration) {
        this.loadError = true
        return
      }
      this.activeStory.patchConfiguration({ customId: configuration.custom_id, sharing: configuration.sharing })
      this.customId = configuration.custom_id || ''
    } catch {
      this.loadError = true
    } finally {
      this.loading = false
    }
  }

  selectLink(event: FocusEvent) {
    if (event.target instanceof HTMLInputElement) event.target.select()
  }

  editSlug() {
    this.slugError = null
    this.confirmChange = false
  }

  async saveCustomId() {
    if (!this.isCurrentStory || this.loading || this.loadError || this.savingSlug || this.db.authenticationRequired() || !this.slugChanged) return
    this.slugError = null
    const customId = this.customId.trim()
    if (customId) {
      const invalid = validateStorySlug(customId)
      if (invalid) {
        this.slugError = invalid === 'reserved' ? 'dashboard.share.reserved' : 'dashboard.share.invalid'
        return
      }
    }
    // Changing or removing an existing alias breaks previously distributed links.
    if (this.activeStory.storyConfiguration().customId && !this.confirmChange) {
      this.confirmChange = true
      return
    }
    this.savingSlug = true
    this.feedback = null
    try {
      const result = await this.db.updateCustomIdOf(this.storyId, customId || null)
      if (!this.isCurrentStory) return
      if (result === 'saved') {
        this.activeStory.patchConfiguration({ customId: customId || undefined })
        this.customId = customId
        this.confirmChange = false
        this.feedback = 'dashboard.share.urlSaved'
      } else {
        this.slugError = result === 'taken' ? 'dashboard.share.idTaken'
          : result === 'unauthorized' ? 'dashboard.share.sessionError' : 'dashboard.share.saveError'
      }
    } catch {
      this.slugError = 'dashboard.share.saveError'
    } finally {
      this.savingSlug = false
    }
  }

  async toggleSharing() {
    if (!this.isCurrentStory || this.loading || this.loadError || this.savingSharing || this.db.authenticationRequired()) return
    this.savingSharing = true
    this.sharingError = false
    const sharing = !this.activeStory.storyConfiguration().sharing
    try {
      const saved = await this.db.setSharingOf(this.storyId, sharing)
      if (!this.isCurrentStory) return
      if (saved) this.activeStory.patchConfiguration({ sharing })
      else this.sharingError = true
    } catch {
      this.sharingError = true
    } finally {
      this.savingSharing = false
    }
  }

  async copyLink(url = this.readingUrl()) {
    if (this.unavailable || this.copying) return
    this.copying = true
    this.feedback = null
    const result = await copyStoryLink(url)
    if (this.isCurrentStory) this.feedback = result === 'copied' ? 'dashboard.share.copied' : 'dashboard.share.copyManually'
    this.copying = false
  }

  async shareLink() {
    if (this.unavailable || this.sharingLink) return
    this.sharingLink = true
    this.feedback = null
    const title = this.activeStory.storyName()
    const result = await shareStoryLink({ title, text: this.i18n.t('playground.shareMessage', { title }), url: this.readingUrl() })
    if (this.isCurrentStory && result !== 'cancelled') {
      this.feedback = result === 'shared' ? 'dashboard.share.shared'
        : result === 'copied' ? 'dashboard.share.copied' : 'dashboard.share.copyManually'
    }
    this.sharingLink = false
  }
}
