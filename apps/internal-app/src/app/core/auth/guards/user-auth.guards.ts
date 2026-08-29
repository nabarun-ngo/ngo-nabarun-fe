import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { IUserIdentityService } from '../tokens/user-identity.token';
import { AppRoute } from '../../constant/app-routing.const';

/**
 * Guards routes that require a completed user profile.
 */
export async function userGuard(
  _route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Promise<boolean> {
  const identityService = inject(IUserIdentityService);
  const router = inject(Router);

  if (await identityService.profileComplete()) {
    return true;
  }
  if (state.url === AppRoute.secured_member_complete_my_profile_page.url) {
    return true;
  }
  router.navigate([AppRoute.secured_member_complete_my_profile_page.url], {
    state: { redirect_to: state.url },
  });
  return false;
}
