import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
    AuthorizationService,
    PlatformAuthService,
    UserIdentityService as PackageUserIdentityService,
} from '@nabarun-ngo/auth-angular';
import { IUserIdentityService } from '../tokens/user-identity.token';
import { AppRbacUserAccessSnapshot } from '../tokens/user-rbac.token';

/**
 * App-level identity façade.
 * Extends the package's UserIdentityService with profile-domain logic
 * sourced from the backend API (AuthUserInfoResponseDto), not the OIDC token.
 */
@Injectable({ providedIn: 'root' })
export class UserIdentityService extends PackageUserIdentityService<AppRbacUserAccessSnapshot> implements IUserIdentityService {
    constructor(
        platformAuth: PlatformAuthService,
        authorization: AuthorizationService<AppRbacUserAccessSnapshot>,
    ) {
        super(platformAuth, authorization);
    }
    async getId(): Promise<string | undefined> {
        const snapshot = await firstValueFrom(this.authorization.snapshot$);
        return snapshot?.userId;
    }
    async profileComplete(): Promise<boolean> {
        const snapshot = await firstValueFrom(this.authorization.snapshot$);
        return snapshot?.profileComplete ?? false;
    }
    
    async getDisplayName(): Promise<string> {
          const snapshot = await firstValueFrom(this.authorization.snapshot$);
        return snapshot?.fullName || "Guest";
    }
}
