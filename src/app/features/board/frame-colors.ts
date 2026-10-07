import { storyColor } from 'src/app/core/interfaces/interfaces'
import { isHexColor } from 'src/app/shared/utils/color'

export const FRAME_COLORS = [
  'rose', 'peach', 'yellow', 'mint', 'blue', 'lavender',
] as const

export type FrameColor = typeof FRAME_COLORS[number]

export function isFrameColor(color: string): color is FrameColor {
  return FRAME_COLORS.some((item) => item === color)
}

/** Palette entries are rebuilt on every tree clone; compare their contents instead. */
export function samePalette(a: readonly storyColor[], b: readonly storyColor[]): boolean {
  return a.length === b.length && a.every((entry, index) =>
    entry.id === b[index].id && entry.name === b[index].name && entry.value === b[index].value)
}

export function frameColorToken(color?: string, palette: readonly storyColor[] = []): string {
  const entry = color !== 'default' ? palette.find((item) => item.id === color) : undefined
  if (entry && isHexColor(entry.value)) return entry.value
  return color && isFrameColor(color)
    ? `var(--polo-color-frame-${color})`
    : 'var(--polo-color-border-hover)'
}
