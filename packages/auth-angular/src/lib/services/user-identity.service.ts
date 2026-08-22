import { Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { AuthUser, RbacUserAccessSnapshot } from '@nabarun-ngo/auth-core';
import { PlatformAuthService, LoginType } from './platform-auth.service';
import { AuthorizationService } from './authorization.service';

@Injectable({ providedIn: 'root' })
export class UserIdentityService<T extends RbacUserAccessSnapshot = RbacUserAccessSnapshot> {
  isLoggedIn!: boolean;
  /** OIDC claims from the Auth0 token — app-domain profile fields are NOT here. */
  loggedInUser!: AuthUser;
  rbacSnapShot!: T | null;

  constructor(
    protected platformAuth: PlatformAuthService,
    protected authorization: AuthorizationService<T>,
  ) { }

  async configure(): Promise<void> {
    this.platformAuth.initialize();
    this.isLoggedIn = await this.isUserLoggedIn();
    if (this.isLoggedIn) {
      this.loggedInUser = await this.getUser();
      await this.authorization.load();
      this.rbacSnapShot = await this.getRbacSnapShot();
    }
  }

  loginWith(loginType: LoginType, prompt?: string, redirectUrl?: string): void {
    this.platformAuth.loginWith(loginType, prompt, redirectUrl);
  }

  logout(): void {
    this.authorization.clear();
    this.platformAuth.logout();
  }

  async isUserLoggedIn(): Promise<boolean> {
    return await firstValueFrom(this.platformAuth.isAuthenticated$);
  }

  async getAccessToken(): Promise<string> {
    return await firstValueFrom(this.platformAuth.getAccessTokenSilently());
  }

  async getUser(): Promise<AuthUser> {
    return await firstValueFrom(
      this.platformAuth.user$.pipe(map((u) => u as AuthUser)),
    );
  }

  async getRbacSnapShot(): Promise<T | null> {
    return await firstValueFrom(
      this.authorization.snapshot$.pipe(map((snapshot) => snapshot as T)),
    );
  }
}
