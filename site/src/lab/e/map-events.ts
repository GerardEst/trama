export type MapEventKind = 'battle' | 'discovery' | 'treasure' | 'key' | 'potion' | 'camp' | 'relic'

interface MapEvent {
  kind: MapEventKind
  // Percentages of the section, independent of the generated drawing.
  position: readonly [number, number]
  mobilePosition: readonly [number, number]
  tabletPosition?: readonly [number, number]
  delay: number
}

export const MAP_EVENTS: readonly MapEvent[] = [
  { kind: 'battle', position: [15, 29], tabletPosition: [12, 29], mobilePosition: [17, 13], delay: 0 },
  { kind: 'discovery', position: [27, 63], tabletPosition: [12, 63], mobilePosition: [80, 16], delay: .4 },
  { kind: 'treasure', position: [84, 52], tabletPosition: [84, 20], mobilePosition: [80, 80], delay: .8 },
  { kind: 'key', position: [74, 22], tabletPosition: [55, 12], mobilePosition: [48, 7], delay: .2 },
  { kind: 'potion', position: [16, 79], mobilePosition: [18, 80], delay: .6 },
  { kind: 'camp', position: [50, 87], mobilePosition: [48, 90], delay: 1 },
  { kind: 'relic', position: [89, 80], tabletPosition: [86, 80], mobilePosition: [50, 73], delay: 1.2 },
]
