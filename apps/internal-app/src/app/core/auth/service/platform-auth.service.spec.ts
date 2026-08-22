import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { of, Subject } from 'rxjs';
import { WebAuthService } from './auth0-auth.service';

describe('WebAuthService', () => {
  let service: WebAuthService;
  let router: jasmine.SpyObj<Router>;
  let auth: {
    handleRedirectCallback: jasmine.Spy;
    loginWithRedirect: jasmine.Spy;
    error$: Subject<unknown>;
  };

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    auth = {
      handleRedirectCallback: jasmine.createSpy('handleRedirectCallback'),
      loginWithRedirect: jasmine.createSpy('loginWithRedirect'),
      error$: new Subject<unknown>(),
    };

    TestBed.configureTestingModule({
      providers: [
        WebAuthService,
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });

    service = TestBed.inject(WebAuthService);
  });

  it('navigates by url with query params after Auth0 callback', () => {
    const target = '/secured/finance/accounts?chip=active&accountId=acc-wallet-001';
    auth.handleRedirectCallback.and.returnValue(of({ appState: { target } }));
    history.pushState({}, '', '/?code=abc&state=xyz');

    service.initialize();

    expect(router.navigateByUrl).toHaveBeenCalledWith(target);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('falls back to dashboard when appState target is missing', () => {
    auth.handleRedirectCallback.and.returnValue(of({ appState: {} }));
    history.pushState({}, '', '/?code=abc&state=xyz');

    service.initialize();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/secured/dashboard');
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
