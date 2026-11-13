export type MapEventKind = 'discovery' | 'treasure' | 'potion' | 'camp' | 'relic'

interface MapEvent {
  kind: MapEventKind
  // Percentages of the section, independent of the generated drawing.
  position: readonly [number, number]
  mobilePosition: readonly [number, number]
  tabletPosition?: readonly [number, number]
}

export const MAP_EVENTS: readonly MapEvent[] = [
  { kind: 'discovery', position: [21, 57], tabletPosition: [11, 60], mobilePosition: [83, 20] },
  { kind: 'treasure', position: [84, 52], tabletPosition: [84, 20], mobilePosition: [83, 80] },
  { kind: 'potion', position: [14, 83], mobilePosition: [18, 80] },
  { kind: 'camp', position: [50, 87], mobilePosition: [50, 90] },
  { kind: 'relic', position: [89, 80], tabletPosition: [86, 85], mobilePosition: [50, 76] },
]
