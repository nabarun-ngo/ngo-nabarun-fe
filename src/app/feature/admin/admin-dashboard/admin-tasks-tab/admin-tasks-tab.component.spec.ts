import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTasksTabComponent } from './admin-tasks-tab.component';

describe('AdminTasksTabComponent', () => {
  let component: AdminTasksTabComponent;
  let fixture: ComponentFixture<AdminTasksTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminTasksTabComponent]
    });
    fixture = TestBed.createComponent(AdminTasksTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
