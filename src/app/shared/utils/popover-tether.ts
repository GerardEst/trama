const supportsAnchors = typeof CSS !== 'undefined' && CSS.supports('position-area: block-start')

/**
 * Without CSS anchor positioning a popover opens centred on the screen, away from its trigger.
 * Call it on `beforetoggle` to tether the popover to the trigger instead: towards the middle
 * of the screen on both axes, set from the trigger's edges alone so the closed popover never
 * needs measuring. The popover's CSS gives it `position: fixed` and `margin: 0` in that case.
 */
export function tetherPopover(event: Event, trigger: HTMLElement, popover: HTMLElement, gap = 4) {
  if (supportsAnchors || (event as ToggleEvent).newState !== 'open') return
  const box = trigger.getBoundingClientRect()
  const below = box.top + box.height / 2 < window.innerHeight / 2
  const leftward = box.left + box.width / 2 > window.innerWidth / 2
  popover.style.top = below ? `${box.bottom + gap}px` : 'auto'
  popover.style.bottom = below ? 'auto' : `${window.innerHeight - box.top + gap}px`
  popover.style.left = leftward ? 'auto' : `${box.left}px`
  popover.style.right = leftward ? `${window.innerWidth - box.right}px` : 'auto'
  // Never wider than the room on its side of the trigger.
  popover.style.maxWidth = `${(leftward ? box.right : window.innerWidth - box.left) - 8}px`
}
