import { Injectable } from '@angular/core';
import {
    AuthorizationService,
    PlatformAuthService,
    RbacNotLoadedError,
    UserIdentityService as PackageUserIdentityService,
} from '@nabarun-ngo/auth-angular';
import { IUserIdentityService } from '../tokens/user-identity.token';
import { AppRbacUserAccessSnapshot } from '../tokens/user-rbac.token';

/**
 * App-level identity façade.
 * Session RBAC (including profile extras) is loaded by package configure() → AuthorizationService.load().
 */
@Injectable()
export class UserIdentityService
  extends PackageUserIdentityService<AppRbacUserAccessSnapshot>
  implements IUserIdentityService {
    constructor(
        platformAuth: PlatformAuthService,
        authorization: AuthorizationService<AppRbacUserAccessSnapshot>,
    ) {
        super(platformAuth, authorization);
    }

    async getId(): Promise<string | undefined> {
        try {
            const snapshot = await this.authorization.waitUntilLoaded();
            return snapshot.userId;
        } catch (error) {
            if (error instanceof RbacNotLoadedError) {
                return undefined;
            }
            throw error;
        }
    }

    async profileComplete(): Promise<boolean> {
        try {
            const snapshot = await this.authorization.waitUntilLoaded();
            return snapshot.profileComplete ?? false;
        } catch (error) {
            if (error instanceof RbacNotLoadedError) {
                return false;
            }
            throw error;
        }
    }

    async getDisplayName(): Promise<string> {
        try {
            const snapshot = await this.authorization.waitUntilLoaded();
            return snapshot.fullName || 'Guest';
        } catch (error) {
            if (error instanceof RbacNotLoadedError) {
                return 'Guest';
            }
            throw error;
        }
    }
}
