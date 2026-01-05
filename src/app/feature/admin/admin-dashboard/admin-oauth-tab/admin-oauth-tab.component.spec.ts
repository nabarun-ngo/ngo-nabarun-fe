import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOauthTabComponent } from './admin-oauth-tab.component';

describe('AdminOauthTabComponent', () => {
  let component: AdminOauthTabComponent;
  let fixture: ComponentFixture<AdminOauthTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminOauthTabComponent]
    });
    fixture = TestBed.createComponent(AdminOauthTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
