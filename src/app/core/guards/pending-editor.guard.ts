import { CanDeactivateFn } from '@angular/router'

/** Flush synchronously before Angular destroys child editors and their outputs. */
export const pendingEditorGuard: CanDeactivateFn<{ commitEdits(): void }> = component => {
  component.commitEdits()
  return true
}
