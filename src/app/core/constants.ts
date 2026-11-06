export const PRICING = {
  CREATOR_MONTHLY_PRICE: 5.95,
  CREATOR_YEARLY_PRICE: 49.95,
  // Reference only: Pro has no final price, checkout or export implementation yet.
  PRO_INDICATIVE_PRICE: 200,
}

// Phones get the compact workspace: drawer menus and centered modals instead of floating panels.
// 760px is the app-wide phone breakpoint. CSS cannot read this constant inside
// @media, so stylesheets repeat `@media (max-width: 760px)`: search for "760px" when changing it.
export const MOBILE_LAYOUT_QUERY = '(max-width: 760px)'

export function isMobileLayout(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.(MOBILE_LAYOUT_QUERY).matches
}
