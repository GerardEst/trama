import { ComponentFixture, TestBed } from '@angular/core/testing'

import { NodeOptionsComponent } from './node-options.component'

describe('NodeOptionsComponent', () => {
  let component: NodeOptionsComponent
  let fixture: ComponentFixture<NodeOptionsComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NodeOptionsComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(NodeOptionsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('offers adding an event for every executable node type', () => {
    const add = spyOn(component.addEvent, 'emit')
    for (const type of ['content', 'text', 'distributor', 'end']) {
      component.type = type
      fixture.detectChanges()
      const button = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'))
        .find(button => button.textContent?.includes('Add event'))!
      expect(button).toBeDefined()
      button.click()
    }
    expect(add).toHaveBeenCalledTimes(4)
  })

  it('shows the shortcuts on available actions only', () => {
    component.nodeId = 'node_1'
    component.type = 'content'
    component.frameName = 'Act one'
    fixture.detectChanges()
    const host: HTMLElement = fixture.nativeElement
    const titles = Array.from(host.querySelectorAll<HTMLButtonElement>('button'))
      .map((button) => button.title)
    expect(titles).toContain('Duplicate node (Ctrl+D / ⌘D)')
    expect(titles).toContain('Delete node (Supr)')
    expect(titles).toContain('Remove from Act one (Ctrl+U / ⌘U; keep the node)')
    expect(host.querySelector<HTMLElement>('.options__addImage')?.title)
      .toBe('Add image (Ctrl+I / ⌘I)')

    component.type = 'distributor'
    component.frameName = undefined
    fixture.detectChanges()
    expect(host.querySelector('.options__addImage')).toBeNull()
    expect(host.textContent).not.toContain('Remove from frame')
  })
})
