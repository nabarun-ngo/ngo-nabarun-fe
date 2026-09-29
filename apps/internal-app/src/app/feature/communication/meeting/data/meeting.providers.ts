import type { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../../environments/environment';
import { MeetingDataSource } from './meeting-data.source';
import { MeetingApiDataSource } from './api/meeting-api.data-source';
import { MeetingDemoDataSource } from 'src/demo/communication/meeting/meeting-demo.data-source';

export function provideMeetingInfrastructure(): Provider[] {
  const implementation = MOCK_DATA
    ? MeetingDemoDataSource
    : MeetingApiDataSource;
  return [
    implementation,
    { provide: MeetingDataSource, useExisting: implementation },
  ];
}

export function provideMeetingDataSource(): Provider[] {
  return provideMeetingInfrastructure();
}
