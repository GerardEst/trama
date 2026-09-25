import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: 'ng-template[poloPopoverContent]',
  standalone: true,
})
export class AnchoredPopoverContentDirective {
  constructor(public template: TemplateRef<unknown>) {}
}
