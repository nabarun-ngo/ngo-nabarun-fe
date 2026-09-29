import { InjectionToken } from '@angular/core';
import { AuthUser } from '@ssdev-toolkit/auth-core';
import { LoginType } from '@ssdev-toolkit/angular-auth';

/** App-level identity contract — package OIDC user plus backend profile fields. */
export interface IUserIdentityService {
  configure(): Promise<void>;
  profileComplete(): Promise<boolean>;
  getDisplayName(): Promise<string>;
  loginWith(loginType: LoginType, prompt?: string, redirectUrl?: string): void;
  logout(): void;
  isUserLoggedIn(): Promise<boolean>;
  getAccessToken(): Promise<string>;
  getId(): Promise<string | undefined>;
  getUser(): Promise<AuthUser>;
}

export const IUserIdentityService = new InjectionToken<IUserIdentityService>('IUserIdentityService');
