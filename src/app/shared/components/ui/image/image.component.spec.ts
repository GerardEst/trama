import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ImageComponent } from './image.component'
import { STORY_IMAGE_URL } from './story-image-url'

describe('ImageComponent', () => {
  let component: ImageComponent
  let fixture: ComponentFixture<ImageComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageComponent],
    }).compileComponents()

    fixture = TestBed.createComponent(ImageComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('serves a story image from Trama’s public storage', () => {
    fixture.componentRef.setInput('storageRoute', 'user/scene.webp')
    fixture.detectChanges()
    const image: HTMLImageElement = fixture.nativeElement.querySelector('.image__preview')
    expect(image.src).toBe('https://lsemostpqoguehpsbzgu.supabase.co/storage/v1/object/public/images/user/scene.webp')
  })

  it('says when the image has arrived', () => {
    const loaded = jasmine.createSpy('loaded')
    component.loaded.subscribe(loaded)
    fixture.componentRef.setInput('storageRoute', 'user/scene.webp')
    fixture.detectChanges()
    fixture.nativeElement.querySelector('.image__preview').dispatchEvent(new Event('load'))
    expect(loaded).toHaveBeenCalledTimes(1)
  })
})

describe('ImageComponent in a host that serves its own images', () => {
  it('asks the host for the address', async () => {
    await TestBed.configureTestingModule({
      imports: [ImageComponent],
      providers: [{ provide: STORY_IMAGE_URL, useValue: (path: string) => `https://example.test${path}` }],
    }).compileComponents()
    const fixture = TestBed.createComponent(ImageComponent)
    fixture.componentRef.setInput('storageRoute', '/pictures/crossroads.webp')
    fixture.detectChanges()
    const image: HTMLImageElement = fixture.nativeElement.querySelector('.image__preview')
    expect(image.src).toBe('https://example.test/pictures/crossroads.webp')
  })
})
