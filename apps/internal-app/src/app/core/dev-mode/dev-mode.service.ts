import { inject, Injectable, Injector } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map, Observable, of } from 'rxjs';
import { AuthUser } from '@nabarun-ngo/auth-core';
import {
  AuthorizationService,
  LoginType,
  PlatformAuthService,
  RbacDataSource,
} from '@nabarun-ngo/auth-angular';
import { AuthUserInfoResponseDto } from '../api/api-client/models/auth-user-info-response-dto';
import { IUserIdentityService } from '../auth/tokens/user-identity.token';
import {
  AppNotification,
  INotificationService,
  PagedNotifications,
} from '../shell/tokens/notification.token';
import { DEMO_RBAC_SNAPSHOT, DEMO_USER_GIVEN_NAME } from './dev-mode.constants';

/**
 * Single auth-bypass implementation wired via module providers.
 * Implements all auth-bypass contracts — never inject directly; use tokens.
 */
@Injectable()
export class DevModeService extends PlatformAuthService implements RbacDataSource, IUserIdentityService, INotificationService {
  isLoggedIn = false;
  loggedInUser!: AuthUser;
  loggedInUserProfile?: AuthUserInfoResponseDto;
  profileUpdated = false;

  private unreadCountSubject = new BehaviorSubject<number>(0);
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);

  readonly unreadCount$ = this.unreadCountSubject.asObservable();
  readonly notifications$ = this.notificationsSubject.asObservable();

  private readonly injector = inject(Injector);

  constructor() {
    super();
  }

  private get authorization(): AuthorizationService {
    return this.injector.get(AuthorizationService);
  }

  get isAuthenticated$(): Observable<boolean> {
    return of(true);
  }

  get user$(): Observable<AuthUser | null | undefined> {
    return of({
      sub: DEMO_RBAC_SNAPSHOT.idpSub,
      name: DEMO_USER_GIVEN_NAME,
    } as AuthUser);
  }

  getAccessTokenSilently(): Observable<string> {
    return of('');
  }

  initialize(): void {}

  loginWith(_loginType: LoginType, _prompt?: string, _redirectUrl?: string): void {}

  logout(): void {
    this.authorization.clear();
  }

  fetchCurrentUser(): Observable<typeof DEMO_RBAC_SNAPSHOT> {
    return of(DEMO_RBAC_SNAPSHOT);
  }

  async configure(): Promise<void> {
    const currentUserDto = await firstValueFrom(this.fetchCurrentUser());
    this.authorization.loadWith(currentUserDto);
    this.isLoggedIn = true;
    this.loggedInUserProfile = {
      id: DEMO_RBAC_SNAPSHOT.userId,
      attributes: { profile_updated: true },
    } as AuthUserInfoResponseDto;
    this.profileUpdated = true;
  }

  async isProfileUpdated(): Promise<boolean> {
    return true;
  }

  getDisplayName(): string {
    return DEMO_USER_GIVEN_NAME;
  }

  async isUserLoggedIn(): Promise<boolean> {
    return true;
  }

  async getAccessToken(): Promise<string> {
    return await firstValueFrom(this.getAccessTokenSilently());
  }

  async getUser(): Promise<AuthUser> {
    return await firstValueFrom(this.user$.pipe(map((u) => u as AuthUser)));
  }

  async setup(): Promise<void> {}

  getMyNotificationsPaged(page: number, limit: number): Observable<PagedNotifications> {
    return of({ data: [], total: 0, page, limit });
  }

  appendNotifications(_newNotifications: AppNotification[]): void {}

  getMyUnreadCount(): Observable<{ count: number }> {
    return of({ count: 0 });
  }

  markAsRead(_notificationId: string): Observable<void> {
    return of(void 0);
  }

  markAllAsRead(): Observable<{ markedCount: number }> {
    return of({ markedCount: 0 });
  }

  archiveNotification(_notificationId: string): Observable<void> {
    return of(void 0);
  }

  deleteNotification(notificationId: string): Observable<void> {
    return this.archiveNotification(notificationId);
  }

  refreshUnreadCount(): void {}

  getCurrentUnreadCount(): number {
    return 0;
  }

  getCurrentNotifications(): AppNotification[] {
    return [];
  }

  async updateBadgeCount(_count: number): Promise<void> {}

  isMobileBrowser(): boolean {
    return false;
  }
}
