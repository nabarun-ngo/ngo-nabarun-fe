import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBgJobsTabComponent } from './admin-bg-jobs-tab.component';

describe('AdminBgJobsTabComponent', () => {
  let component: AdminBgJobsTabComponent;
  let fixture: ComponentFixture<AdminBgJobsTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminBgJobsTabComponent]
    });
    fixture = TestBed.createComponent(AdminBgJobsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
