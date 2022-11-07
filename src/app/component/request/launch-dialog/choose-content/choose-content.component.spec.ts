import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseContentComponent } from './choose-content.component';

describe('ChooseContentComponent', () => {
  let component: ChooseContentComponent;
  let fixture: ComponentFixture<ChooseContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChooseContentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
