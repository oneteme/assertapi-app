import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchContentComponent } from './launch-content.component';

describe('LaunchContentComponent', () => {
  let component: LaunchContentComponent;
  let fixture: ComponentFixture<LaunchContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaunchContentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaunchContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
