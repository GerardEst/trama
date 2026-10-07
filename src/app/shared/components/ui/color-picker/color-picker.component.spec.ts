import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ColorPickerComponent } from './color-picker.component'

describe('ColorPickerComponent', () => {
  let fixture: ComponentFixture<ColorPickerComponent>
  let host: HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ColorPickerComponent] }).compileComponents()
    fixture = TestBed.createComponent(ColorPickerComponent)
    fixture.componentRef.setInput('options', [
      { value: 'default', name: 'Default', swatch: 'var(--polo-color-action)', editable: false },
      { value: 'mint', name: 'Mint', swatch: 'var(--polo-color-frame-mint)' },
    ])
    fixture.componentRef.setInput('label', 'Frame color')
    fixture.componentRef.setInput('value', 'default')
    fixture.detectChanges()
    host = fixture.nativeElement
    document.body.appendChild(host)
  })

  afterEach(() => {
    fixture.destroy()
    host.remove()
  })

  async function open() {
    host.querySelector<HTMLButtonElement>('[popoverTrigger]')!.click()
    fixture.detectChanges()
    await new Promise<void>((resolve) => setTimeout(resolve, 0))
  }

  async function fillAndSave(nameValue: string, hexValue: string) {
    fixture.detectChanges()
    await fixture.whenStable()
    const name = host.querySelector<HTMLInputElement>('input[name="name"]')!
    expect(document.activeElement).toBe(name)
    name.value = nameValue
    name.dispatchEvent(new Event('input', { bubbles: true }))
    const hex = host.querySelector<HTMLInputElement>('input[name="hex"]')!
    hex.value = hexValue
    hex.dispatchEvent(new Event('input', { bubbles: true }))
    fixture.detectChanges()
    host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    fixture.detectChanges()
  }

  it('opens a top-layer palette with swatches, names and the selected color', async () => {
    const emit = spyOn(fixture.componentInstance.valueChange, 'emit')
    const trigger = host.querySelector<HTMLButtonElement>('[popoverTrigger]')!
    expect(trigger.children.length).toBe(1)
    expect(trigger.firstElementChild?.className).toBe('colorPicker__swatch')
    expect(getComputedStyle(trigger).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    await open()
    expect(host.querySelector('.anchoredPopover__panel')!.matches(':popover-open')).toBeTrue()
    const options = host.querySelectorAll<HTMLButtonElement>('.colorPicker__option')
    expect(options.length).toBe(2)
    expect(options[0].getAttribute('aria-pressed')).toBe('true')
    expect(document.activeElement).toBe(options[0])
    expect(options[1].textContent).toContain('Mint')
    options[1].click()
    fixture.detectChanges()
    expect(emit).toHaveBeenCalledOnceWith('mint')
    expect(host.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('supports arrow keys, Escape and outside-click dismissal', async () => {
    await open()
    const first = host.querySelector<HTMLButtonElement>('.colorPicker__option')!
    first.focus()
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
    expect(document.activeElement?.textContent).toContain('Mint')
    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    fixture.detectChanges()
    expect(host.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(host.querySelector('[popoverTrigger]'))
    await open()
    document.body.click()
    fixture.detectChanges()
    expect(host.querySelector('[role="dialog"]')).toBeNull()
  })

  it('emits a named color for the story to save without writing browser storage', async () => {
    const emit = spyOn(fixture.componentInstance.colorSave, 'emit')
    const select = spyOn(fixture.componentInstance.valueChange, 'emit')
    const storage = spyOn(Storage.prototype, 'setItem')
    await open()
    host.querySelector<HTMLButtonElement>('.colorPicker__create')!.click()
    await fillAndSave('  Battle  ', '#AABBCC')
    expect(emit).toHaveBeenCalledOnceWith({ source: undefined, name: 'Battle', value: '#aabbcc' })
    expect(select).not.toHaveBeenCalled()
    expect(storage).not.toHaveBeenCalled()
    expect(host.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(host.querySelector('[popoverTrigger]'))
  })

  for (const source of ['mint', 'battle']) {
    it(`edits ${source} using its stable ID rather than its hex value`, async () => {
      fixture.componentRef.setInput('options', [
        ...fixture.componentInstance.options,
        { value: 'battle', name: 'Battle', swatch: '#aabbcc' },
      ])
      fixture.componentRef.setInput('value', source)
      fixture.componentRef.setInput('hint', 'Editing updates every frame')
      const emit = spyOn(fixture.componentInstance.colorSave, 'emit')
      await open()
      host.querySelector<HTMLButtonElement>(`.colorPicker__edit[data-key="${source}"]`)!.click()
      fixture.detectChanges()
      await fixture.whenStable()
      expect(host.querySelector<HTMLInputElement>('input[name="hex"]')!.value)
        .toBe(source === 'battle' ? '#aabbcc' : '#b2d9c2')
      expect(host.querySelector('.colorPicker__hint')?.textContent).toContain('every frame')
      await fillAndSave('Conversation', '#112233')
      expect(emit).toHaveBeenCalledOnceWith({ source, name: 'Conversation', value: '#112233' })
    })
  }

  it('keeps non-editable options selectable but never editable', async () => {
    await open()
    expect(host.querySelector('.colorPicker__edit[data-key="default"]')).toBeNull()
    fixture.componentInstance.edit(fixture.componentInstance.options[0], new Event('click'))
    expect(fixture.componentInstance.creating).toBeFalse()
    const emit = spyOn(fixture.componentInstance.valueChange, 'emit')
    host.querySelector<HTMLButtonElement>('[data-color="default"]')!.click()
    expect(emit).toHaveBeenCalledOnceWith('default')
  })

  it('cancels editing without emitting changes and restores focus to the edit button', async () => {
    const emit = spyOn(fixture.componentInstance.colorSave, 'emit')
    await open()
    host.querySelector<HTMLButtonElement>('.colorPicker__edit[data-key="mint"]')!.click()
    fixture.detectChanges()
    await fixture.whenStable()
    fixture.componentInstance.name = 'Unsaved changes'
    host.querySelector('input')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    fixture.detectChanges()
    await fixture.whenStable()
    expect(emit).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(host.querySelector('.colorPicker__edit[data-key="mint"]'))
  })

  it('reacts to a renamed and recolored story palette without changing the selected ID', async () => {
    fixture.componentRef.setInput('value', 'battle')
    fixture.componentRef.setInput('options', [
      ...fixture.componentInstance.options,
      { value: 'battle', name: 'Conversation', swatch: '#112233' },
    ])
    await open()
    expect(host.querySelector('[popoverTrigger]')?.getAttribute('title')).toBe('Conversation')
    expect(host.querySelector('[data-color="battle"]')?.getAttribute('aria-pressed')).toBe('true')
    expect(document.activeElement).toBe(host.querySelector('[data-color="battle"]'))
  })

  it('cancels creation with Escape and rejects invalid input', async () => {
    await open()
    host.querySelector<HTMLButtonElement>('.colorPicker__create')!.click()
    fixture.detectChanges()
    await fixture.whenStable()
    host.querySelector('input')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    fixture.detectChanges()
    await fixture.whenStable()
    expect(host.querySelector('form')).toBeNull()
    expect(document.activeElement).toBe(host.querySelector('.colorPicker__create'))
    const component = fixture.componentInstance
    const emit = spyOn(component.colorSave, 'emit')
    for (const [name, hex] of [['Battle', 'invalid'], [' ', '#123456'], ['x'.repeat(41), '#123456']]) {
      component.name = name
      component.hex = hex
      expect(component.canSave).toBeFalse()
      component.save()
    }
    expect(emit).not.toHaveBeenCalled()
  })
})
