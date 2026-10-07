/** Accept only complete hex colors at persistence and CSS boundaries. */
export function isHexColor(value: string): value is `#${string}` {
  return /^#[0-9a-f]{6}$/i.test(value)
}

export interface ColorOption {
  value: string
  name: string
  swatch: string
  editable?: boolean
}

export interface ColorEdit {
  source?: string
  name: string
  value: string
}
