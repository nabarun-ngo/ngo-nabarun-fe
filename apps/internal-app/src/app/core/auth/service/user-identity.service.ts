import { Inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  AuthorizationService,
  PlatformAuthService,
  RBAC_DATA_SOURCE,
  RbacDataSource,
  UserIdentityService as PackageUserIdentityService,
} from '@nabarun-ngo/auth-angular';
import { AuthUserInfoResponseDto } from '../../api/api-client/models/auth-user-info-response-dto';
import { IUserIdentityService } from '../tokens/user-identity.token';

function isProfileComplete(attributes: Record<string, unknown> | undefined): boolean {
  return (attributes?.['profile_complete'] as boolean | undefined)
    ?? (attributes?.['profile_updated'] as boolean | undefined)
    ?? false;
}

/**
 * App-level identity façade.
 * Extends the package's UserIdentityService with profile-domain logic
 * sourced from the backend API (AuthUserInfoResponseDto), not the OIDC token.
 */
@Injectable({ providedIn: 'root' })
export class UserIdentityService extends PackageUserIdentityService implements IUserIdentityService {
  /** Backend-API profile for the logged-in user. Set during configure(). */
  loggedInUserProfile?: AuthUserInfoResponseDto;
  profileUpdated: boolean = false;

  constructor(
    platformAuth: PlatformAuthService,
    authorization: AuthorizationService,
    @Inject(RBAC_DATA_SOURCE) private rbacDataSource: RbacDataSource,
  ) {
    super(platformAuth, authorization);
  }

  override async configure(): Promise<void> {
    this.platformAuth.initialize();
    this.isLoggedIn = await this.isUserLoggedIn();
    if (this.isLoggedIn) {
      this.loggedInUser = await this.getUser();
      const currentUserDto = await firstValueFrom(this.rbacDataSource.fetchCurrentUser());
      this.authorization.loadWith(currentUserDto);
      this.loggedInUserProfile = (currentUserDto as { userInfo?: AuthUserInfoResponseDto }).userInfo;
    }
  }

  async isProfileUpdated(): Promise<boolean> {
    if (this.profileUpdated) {
      return true;
    }
    const attrs = this.loggedInUserProfile?.attributes as Record<string, unknown> | undefined;
    if (attrs !== undefined) {
      return isProfileComplete(attrs);
    }
    const currentUserDto = await firstValueFrom(this.rbacDataSource.fetchCurrentUser());
    const attributes = (currentUserDto as { userInfo?: AuthUserInfoResponseDto }).userInfo?.attributes as Record<string, unknown> | undefined;
    return isProfileComplete(attributes);
  }

  getDisplayName(): string {
    const user = this.loggedInUser as { given_name?: string; nickname?: string; name?: string } | undefined;
    return user?.given_name || user?.nickname || user?.name || 'Guest';
  }
}
