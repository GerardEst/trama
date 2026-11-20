import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { ModalService } from './modal.service'
import { KEEP_OVERLAYS } from './overlay.service'

@Component({ selector: 'polo-test-dialog', standalone: true, template: '<p>Dialog</p>' })
class TestDialogComponent {}

@Component({ standalone: true, template: '' })
class PageComponent {}

describe('ModalService', () => {
  let modal: ModalService
  let router: Router
  const open = () => document.querySelector('polo-test-dialog')

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'board', component: PageComponent }, { path: 'story/:id/board', component: PageComponent }, { path: 'dashboard', component: PageComponent }])],
    })
    router = TestBed.inject(Router)
    modal = TestBed.inject(ModalService)
    await router.navigateByUrl('/board')
  })

  afterEach(() => modal.close())

  it('keeps a dialog open while the page only rewrites its address', async () => {
    modal.launch(TestDialogComponent)
    await router.navigate(['/story', 'story-1', 'board'], { replaceUrl: true, state: { [KEEP_OVERLAYS]: true } })
    expect(open()).not.toBeNull()
  })

  it('closes the dialog on any other navigation', async () => {
    modal.launch(TestDialogComponent)
    await router.navigateByUrl('/dashboard')
    expect(open()).toBeNull()
  })
})
