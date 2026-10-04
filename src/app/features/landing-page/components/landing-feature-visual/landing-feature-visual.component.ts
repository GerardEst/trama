import { Component, inject, Input } from '@angular/core'
import { I18nService } from 'src/app/core/i18n/i18n.service'
import { Lang } from 'src/app/core/i18n/i18n.types'
import { TranslatePipe } from 'src/app/core/i18n/translate.pipe'

export type LandingFeatureVisualKind =
  | 'events'
  | 'distributor'
  | 'player-input'
  | 'requirements'
  | 'focus-mode'
  | 'organisation'

@Component({
  selector: 'polo-landing-feature-visual',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './landing-feature-visual.component.html',
  styleUrl: './landing-feature-visual.component.css',
})
export class LandingFeatureVisualComponent {
  @Input({ required: true }) kind!: LandingFeatureVisualKind

  private readonly i18n = inject(I18nService)

  // Each marquee row is rendered twice so the loop has no visible seam.
  eventRows() {
    return this.i18n.pick(EVENT_ROWS)
  }
}

const EVENT_ROWS: Record<Lang, readonly (readonly string[])[]> = {
  en: [
    ['trust +1', 'has_key → true', 'coins −3', 'visited_library → true', 'courage +2', 'name = Morgan', 'clues +1', 'door_open → true'],
    ['map_found → true', 'coins +5', 'trust −1', 'door_open → true', 'clues +1', 'mood = curious', 'lantern → false', 'secrets +1'],
    ['lantern → false', 'coins +1', 'ally = Ines', 'secrets +1', 'trust +2', 'has_key → true', 'courage −1', 'map_found → true'],
    ['met_gatekeeper → true', 'coins −1', 'title = Archivist', 'trust +1', 'visited_tower → true', 'clues +2', 'ally = Ines', 'coins +2'],
  ],
  es: [
    ['confianza +1', 'tiene_llave → true', 'monedas −3', 'visito_biblioteca → true', 'valor +2', 'nombre = Morgan', 'pistas +1', 'puerta_abierta → true'],
    ['mapa_encontrado → true', 'monedas +5', 'confianza −1', 'puerta_abierta → true', 'pistas +1', 'humor = curioso', 'farol → false', 'secretos +1'],
    ['farol → false', 'monedas +1', 'aliada = Ines', 'secretos +1', 'confianza +2', 'tiene_llave → true', 'valor −1', 'mapa_encontrado → true'],
    ['conocio_guardian → true', 'monedas −1', 'titulo = Archivera', 'confianza +1', 'visito_torre → true', 'pistas +2', 'aliada = Ines', 'monedas +2'],
  ],
  ca: [
    ['confiança +1', 'te_clau → true', 'monedes −3', 'visita_biblioteca → true', 'coratge +2', 'nom = Morgan', 'pistes +1', 'porta_oberta → true'],
    ['mapa_trobat → true', 'monedes +5', 'confiança −1', 'porta_oberta → true', 'pistes +1', 'humor = curiós', 'fanal → false', 'secrets +1'],
    ['fanal → false', 'monedes +1', 'aliada = Ines', 'secrets +1', 'confiança +2', 'te_clau → true', 'coratge −1', 'mapa_trobat → true'],
    ['coneix_guardia → true', 'monedes −1', 'títol = Arxivera', 'confiança +1', 'visita_torre → true', 'pistes +2', 'aliada = Ines', 'monedes +2'],
  ],
}
