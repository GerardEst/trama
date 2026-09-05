import { ComponentFixture, TestBed } from '@angular/core/testing'

import { NodeComponent } from './node.component'
import { BoardAnchorRegistryService } from '../../services/board-anchor-registry.service'
import { PanzoomService } from '../../services/panzoom.service'
import { DatabaseService } from 'src/app/core/services/database.service'
import { ApisService } from 'src/app/core/services/apis.service'

describe('NodeComponent', () => {
  let component: NodeComponent
  let fixture: ComponentFixture<NodeComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NodeComponent],
      providers: [BoardAnchorRegistryService, PanzoomService],
    })
    fixture = TestBed.createComponent(NodeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('updates OnPush upload state and resets the selected input on optimization failure', async () => {
    const database = TestBed.inject(DatabaseService)
    const apis = TestBed.inject(ApisService)
    const imageInput = document.createElement('input')
    imageInput.type = 'file'
    Object.defineProperty(imageInput, 'files', {
      value: [new File(['image'], 'image.png', { type: 'image/png' })],
    })
    const valueSetter = spyOnProperty(imageInput, 'value', 'set').and.callThrough()
    spyOn(database.supabase.auth, 'getUser').and.resolveTo({
      data: { user: { id: 'user_1' } },
      error: null,
    } as never)
    spyOn(apis, 'getOptimizedImage').and.resolveTo(false)
    spyOn(console, 'error')

    const upload = component.onAddImage({ target: imageInput } as unknown as Event)

    expect(component.loading()).toBeTrue()
    expect(component.loadingMessage()).toBe('Optimizing image')
    fixture.detectChanges()
    expect(fixture.nativeElement.textContent).toContain('Optimizing image')

    await upload
    fixture.detectChanges()

    expect(component.loading()).toBeFalse()
    expect(component.loadingMessage()).toBe(
      'The image is too big\nTry again with a smaller image.'
    )
    expect(fixture.nativeElement.textContent).toContain('The image is too big')
    expect(valueSetter).toHaveBeenCalledWith('')
  })
})
