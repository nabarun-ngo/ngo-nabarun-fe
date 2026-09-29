import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Auth0AuthService } from './auth0-auth.service';

describe('Auth0AuthService', () => {
  let service: Auth0AuthService;
  let router: jasmine.SpyObj<Router>;
  let auth: {
    handleRedirectCallback: jasmine.Spy;
    loginWithRedirect: jasmine.Spy;
    appState$: ReplaySubject<unknown>;
    error$: ReplaySubject<unknown>;
    isAuthenticated$: BehaviorSubject<boolean>;
  };

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    auth = {
      handleRedirectCallback: jasmine.createSpy('handleRedirectCallback'),
      loginWithRedirect: jasmine.createSpy('loginWithRedirect'),
      appState$: new ReplaySubject<unknown>(1),
      error$: new ReplaySubject<unknown>(1),
      isAuthenticated$: new BehaviorSubject<boolean>(false),
    };

    TestBed.configureTestingModule({
      providers: [
        Auth0AuthService,
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
        { provide: DestroyRef, useValue: { onDestroy: () => () => {} } },
      ],
    });

    service = TestBed.inject(Auth0AuthService);
  });

  it('navigates by url with query params after Auth0 callback', () => {
    const target = '/secured/finance/accounts?chip=active&accountId=acc-wallet-001';

    service.initialize();
    auth.appState$.next({ target });

    expect(router.navigateByUrl).toHaveBeenCalledWith(target);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('falls back to dashboard when appState target is missing', () => {
    service.initialize();
    auth.appState$.next({});

    expect(router.navigateByUrl).toHaveBeenCalledWith('/secured/dashboard');
  });

  it('never exchanges the callback code itself', () => {
    history.pushState({}, '', '/?code=abc&state=xyz');

    service.initialize();

    expect(auth.handleRedirectCallback).not.toHaveBeenCalled();
  });

  it('shows the login error banner for a failed sign-in', () => {
    service.initialize();
    auth.error$.next(Object.assign(new Error('Service not found'), { error: 'access_denied' }));

    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      state: {
        isError: true,
        description: 'Error : Service not found',
      },
    });
  });

  it('redirects without a banner when the session simply expired', () => {
    service.initialize();
    auth.error$.next(Object.assign(new Error('Login required'), { error: 'login_required' }));

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('sends an already-authenticated user to the dashboard on a stale callback', () => {
    auth.isAuthenticated$.next(true);

    service.initialize();
    auth.error$.next(new Error('Invalid state'));

    expect(router.navigateByUrl).toHaveBeenCalledWith('/secured/dashboard');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('stores sanitized redirect url in Auth0 appState during login', () => {
    service.loginWith(
      'password',
      undefined,
      '/secured/finance/accounts?chip=active&accountId=acc-wallet-001',
    );

    expect(auth.loginWithRedirect).toHaveBeenCalledWith({
      appState: {
        target: '/secured/finance/accounts?chip=active&accountId=acc-wallet-001',
      },
      authorizationParams: jasmine.objectContaining({
        redirect_uri: window.location.origin,
      }),
    });
  });

  it('rejects unsafe redirect urls during login', () => {
    service.loginWith('email', undefined, '//evil.example/phish');

    expect(auth.loginWithRedirect).toHaveBeenCalledWith(
      jasmine.objectContaining({
        appState: { target: '/secured/dashboard' },
      }),
    );
  });
});
