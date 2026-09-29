import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { GenerateApiKeyRequestDto } from 'src/app/core/api/api-client/models';
import {
  AuthApiKeysService,
  CorrespondenceAdminService,
  CorrespondenceNotificationsService,
} from 'src/app/core/api/api-client/services';
import { AdminDefaultValue } from './admin.const';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(
    private apiKeyApi: AuthApiKeysService,
    private correspondenceAdminApi: CorrespondenceAdminService,
    private notificationsApi: CorrespondenceNotificationsService,
  ) {}

  getAPIKeyList(pageIndex: number, pageSize: number) {
    return this.apiKeyApi
      .apiKeyControllerListApiKeys({
        pageIndex: pageIndex,
        pageSize: pageSize,
      })
      .pipe(map((m) => m.responsePayload));
  }

  createAPIKey(body: GenerateApiKeyRequestDto) {
    return this.apiKeyApi
      .apiKeyControllerGenerateApiKey({ body: body })
      .pipe(map((m) => m.responsePayload));
  }

  updateAPIKeyDetail(id: string, value: string[]) {
    return this.apiKeyApi
      .apiKeyControllerUpdateApiKeyPermissions({ id: id, body: { permissions: value } })
      .pipe(map((m) => m.responsePayload));
  }

  revokeAPIKey(id: string) {
    return this.apiKeyApi
      .apiKeyControllerRevokeApiKey({ id: id })
      .pipe(map((m) => m.responsePayload));
  }

  getAPIScopeList() {
    return this.apiKeyApi.apiKeyControllerListApiScopes().pipe(map((m) => m.responsePayload));
  }

  getUndeliveredNotifications(
    query: {
      pageIndex?: number;
      pageSize?: number;
      status?: 'failed' | 'succeeded';
    } = {},
  ) {
    return this.correspondenceAdminApi
      .notificationAdminControllerList({
        pageIndex: query.pageIndex ?? AdminDefaultValue.pageNumber,
        pageSize: query.pageSize ?? AdminDefaultValue.pageSize,
        status: query.status,
      })
      .pipe(map((m) => m.responsePayload));
  }

  resendPushNotification(notificationId: string) {
    return this.notificationsApi.userNotificationControllerResendPush({ id: notificationId });
  }
}
