import { computed, Injectable } from '@angular/core'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { ActiveStoryService } from 'src/app/shared/services/active-story.service'
import { StoryMutationService } from 'src/app/shared/services/story-mutation.service'
import { ColorEdit, ColorOption, isHexColor } from 'src/app/shared/utils/color'
import { FRAME_COLORS, frameColorToken, isFrameColor, samePalette } from '../frame-colors'

/** Owns the story palette used by board frames: picker options, rendered tokens and edits. */
@Injectable({
  providedIn: 'root',
})
export class FrameColorsService {
  // Tree edits clone the palette; only real palette changes should rebuild options.
  private readonly palette = computed(
    () => this.activeStory.entireTree().frameColors ?? [],
    { equal: samePalette }
  )

  readonly options = computed<readonly ColorOption[]>(() => {
    const palette = this.palette()
    const presets: ColorOption[] = FRAME_COLORS.map((color) => ({
      value: color,
      name: palette.find((entry) => entry.id === color)?.name ?? this.i18n.t(`board.frames.colors.${color}`),
      swatch: frameColorToken(color, palette),
    }))
    const custom = palette.filter((entry) => !isFrameColor(entry.id))
      .map((entry) => ({ value: entry.id, name: entry.name, swatch: frameColorToken(entry.id, palette) }))
    return [
      { value: 'default', name: this.i18n.t('board.frames.colors.default'), swatch: frameColorToken(), editable: false },
      ...presets, ...custom,
    ]
  })

  private readonly tokens = computed(
    () => new Map(this.options().map((option) => [option.value, option.swatch]))
  )

  constructor(
    private activeStory: ActiveStoryService,
    private mutations: StoryMutationService,
    private i18n: I18nService
  ) {}

  token(colorId?: string): string {
    return this.tokens().get(colorId ?? 'default') ?? frameColorToken()
  }

  setFrameColor(frameId: string, color: string) {
    this.mutations.update((tree) => {
      const frame = tree.frames?.find((item) => item.id === frameId)
      if (!frame || (color !== 'default' && !isFrameColor(color) &&
        !tree.frameColors?.some((item) => item.id === color))) return false
      if ((frame.colorId ?? 'default') === color) return false
      if (color === 'default') delete frame.colorId
      else frame.colorId = color
      return true
    })
  }

  /** Create/edit and apply a palette entry in one story save. IDs never depend on hex or name. */
  savePaletteColor(frameId: string, edit: ColorEdit): string | undefined {
    const name = edit.name.trim()
    if (!name || name.length > 40 || !isHexColor(edit.value) || edit.source === 'default') return undefined
    const value = edit.value.toLowerCase() as `#${string}`
    let id: string | undefined
    this.mutations.update((tree) => {
      const frame = tree.frames?.find((item) => item.id === frameId)
      const existing = tree.frameColors?.find((item) => item.id === edit.source)
      if (!frame || (edit.source && !existing && !isFrameColor(edit.source))) return false
      // Editing a preset stores an override under the preset ID, so every frame using it follows.
      id = edit.source || `color_${crypto.randomUUID()}`
      const entry = { id, name, value }
      const paletteChanged = !existing || existing.name !== name || existing.value !== value
      if (paletteChanged) {
        tree.frameColors ??= []
        if (existing) tree.frameColors[tree.frameColors.indexOf(existing)] = entry
        else tree.frameColors.push(entry)
      }
      if (frame.colorId === id) return paletteChanged
      frame.colorId = id
      return true
    })
    return id
  }
}
