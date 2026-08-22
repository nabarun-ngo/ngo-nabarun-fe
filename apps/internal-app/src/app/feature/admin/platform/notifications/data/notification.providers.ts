import { Provider } from '@angular/core';
import { NotificationApiDataSource } from './api/notification-api.data-source';
import { NotificationDataSource } from './notification-data.source';

export function provideNotificationDataSource(): Provider[] {
  return [
    NotificationApiDataSource,
    { provide: NotificationDataSource, useExisting: NotificationApiDataSource },
  ];
}
