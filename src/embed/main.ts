import { ApplicationRef, ComponentRef, createComponent, EnvironmentInjector } from '@angular/core'
import { createApplication } from '@angular/platform-browser'
import { provideAnimations } from '@angular/platform-browser/animations'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { isLang } from 'src/app/core/i18n/i18n.types'
import { BoardEmbedComponent } from './board-embed.component'

/**
 * <trama-board>: a live Trama board for the public site. The story comes from a
 * <script type="application/json"> child; zoom, x and y place the view.
 * Every edit is announced with a `trama-change` event carrying the whole tree.
 * One Angular application serves every board on the page.
 */
const app = createApplication({ providers: [provideAnimations()] }).then(async appRef => {
  const i18n = appRef.injector.get(I18nService)
  const lang = document.documentElement.lang
  await i18n.setLang(isLang(lang) ? lang : 'en', { persist: false })
  return appRef
})

class TramaBoardElement extends HTMLElement {
  private component?: ComponentRef<BoardEmbedComponent>

  async connectedCallback() {
    const appRef: ApplicationRef = await app
    if (!this.isConnected || this.component) return
    const script = this.querySelector('script[type="application/json"]')
    const story = JSON.parse(script?.textContent || '{}')
    const host = document.createElement('div')
    host.style.cssText = 'display:block;width:100%;height:100%'
    this.append(host)
    this.component = createComponent(BoardEmbedComponent, {
      environmentInjector: appRef.injector.get(EnvironmentInjector),
      hostElement: host,
    })
    this.component.setInput('story', story)
    this.component.setInput('zoom', Number(this.getAttribute('zoom') ?? 1))
    this.component.setInput('x', Number(this.getAttribute('x') ?? 0))
    this.component.setInput('y', Number(this.getAttribute('y') ?? 0))
    appRef.attachView(this.component.hostView)
    this.setAttribute('ready', '')
  }

  /** The story as the board has it now, with every edit. */
  get story() {
    return this.component?.instance.currentStory()
  }

  disconnectedCallback() {
    this.component?.destroy()
    this.component = undefined
    this.querySelector(':scope > div')?.remove()
  }
}

if (!customElements.get('trama-board')) customElements.define('trama-board', TramaBoardElement)
