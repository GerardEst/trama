import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAnswerOptionsComponent } from './popup-answer-options.component';

describe('PopupAnswerOptionsComponent', () => {
  let component: PopupAnswerOptionsComponent;
  let fixture: ComponentFixture<PopupAnswerOptionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PopupAnswerOptionsComponent]
    });
    fixture = TestBed.createComponent(PopupAnswerOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
