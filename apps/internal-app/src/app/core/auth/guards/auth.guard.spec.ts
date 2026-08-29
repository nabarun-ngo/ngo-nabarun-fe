import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AUTH_CONFIG, authGuard, USER_IDENTITY } from '@nabarun-ngo/auth-angular';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('authGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let isUserLoggedIn: jasmine.Spy<() => Promise<boolean>>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    isUserLoggedIn = jasmine.createSpy('isUserLoggedIn').and.resolveTo(false);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: USER_IDENTITY, useValue: { isUserLoggedIn } },
        {
          provide: AUTH_CONFIG,
          useValue: { loginUrl: '/login', postLoginUrl: '/secured/dashboard' },
        },
      ],
    });
  });

  it('stores full URL with query params in router state when redirecting to login', async () => {
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/secured/finance/accounts?chip=active&accountId=acc-wallet-001' } as RouterStateSnapshot;

    const allowed = await TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(allowed).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      state: { redirect_to: '/secured/finance/accounts?chip=active&accountId=acc-wallet-001' },
    });
  });

  it('allows access when the user is authenticated', async () => {
    isUserLoggedIn.and.resolveTo(true);
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/secured/dashboard' } as RouterStateSnapshot;

    const allowed = await TestBed.runInInjectionContext(() => authGuard(route, state));

    expect(allowed).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
