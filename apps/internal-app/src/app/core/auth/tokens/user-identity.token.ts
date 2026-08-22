import { InjectionToken } from '@angular/core';
import { AuthUser } from '@nabarun-ngo/auth-core';
import { LoginType } from '@nabarun-ngo/auth-angular';
import { AuthUserInfoResponseDto } from '../../api/api-client/models/auth-user-info-response-dto';

/** App-level identity contract — package OIDC user plus backend profile fields. */
export interface IUserIdentityService {
  isLoggedIn: boolean;
  loggedInUser: AuthUser;
  loggedInUserProfile?: AuthUserInfoResponseDto;
  profileUpdated: boolean;

  configure(): Promise<void>;
  isProfileUpdated(): Promise<boolean>;
  getDisplayName(): string;
  loginWith(loginType: LoginType, prompt?: string, redirectUrl?: string): void;
  logout(): void;
  isUserLoggedIn(): Promise<boolean>;
  getAccessToken(): Promise<string>;
  getUser(): Promise<AuthUser>;
}

export const IUserIdentityService = new InjectionToken<IUserIdentityService>('IUserIdentityService');
