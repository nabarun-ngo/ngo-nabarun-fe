import { HttpContextToken } from '@angular/common/http';

/**
 * Opt out of the route-level busy spinner for a specific HttpClient call
 * that happens to run during navigation (e.g. background prefetch).
 * Component-level calls after NavigationEnd are never tracked anyway.
 */
export const SKIP_ROUTE_HTTP_BUSY = new HttpContextToken<boolean>(() => false);
