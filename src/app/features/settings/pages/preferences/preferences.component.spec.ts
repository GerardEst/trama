import { TestBed } from '@angular/core/testing'
import { PreferencesComponent } from './preferences.component'
import { ThemeService } from 'src/app/shared/services/theme.service'
import { ContextHelpService } from 'src/app/shared/context-help/context-help.service'

describe('PreferencesComponent', () => {
  it('turns night mode and the contextual help on and off with labelled switches, and picks the language', async () => {
    await TestBed.configureTestingModule({ imports: [PreferencesComponent] }).compileComponents()
    const theme = TestBed.inject(ThemeService)
    const help = TestBed.inject(ContextHelpService)
    const setDark = spyOn(theme, 'setDark')
    const setHelp = spyOn(help, 'setEnabled')
    const fixture = TestBed.createComponent(PreferencesComponent)
    fixture.detectChanges()
    const host = fixture.nativeElement as HTMLElement
    const switches = Array.from(host.querySelectorAll<HTMLButtonElement>('button[role="switch"]'))
    expect(switches.map((item) => item.getAttribute('aria-label'))).toEqual(['Night mode', 'Show contextual help'])
    expect(switches[0].getAttribute('aria-checked')).toBe(String(theme.dark()))
    switches[0].click()
    switches[1].click()
    expect(setDark).toHaveBeenCalledOnceWith(!theme.dark())
    expect(setHelp).toHaveBeenCalledOnceWith(!help.enabled())
    expect(host.querySelector('polo-language-selector')).not.toBeNull()
    expect(host.querySelectorAll('.setting__hint').length).toBe(3)
  })
})
