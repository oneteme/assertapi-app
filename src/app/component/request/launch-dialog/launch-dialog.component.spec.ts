import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchDialogComponent } from './launch-dialog.component';

describe('LaunchDialogComponent', () => {
  let component: LaunchDialogComponent;
  let fixture: ComponentFixture<LaunchDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LaunchDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LaunchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
