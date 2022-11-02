import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparatorDialogComponent } from './comparator-dialog.component';

describe('ComparatorDialogComponent', () => {
  let component: ComparatorDialogComponent;
  let fixture: ComponentFixture<ComparatorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComparatorDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComparatorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
