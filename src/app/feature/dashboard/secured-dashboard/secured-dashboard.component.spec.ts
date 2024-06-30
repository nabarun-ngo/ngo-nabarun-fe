import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecuredDashboardComponent } from './secured-dashboard.component';

describe('SecuredDashboardComponent', () => {
  let component: SecuredDashboardComponent;
  let fixture: ComponentFixture<SecuredDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SecuredDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecuredDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
