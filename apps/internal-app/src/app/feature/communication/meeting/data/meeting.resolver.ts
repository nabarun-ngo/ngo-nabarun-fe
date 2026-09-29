import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import type { MeetingRefData } from '../domain';
import { MeetingDataSource } from './meeting-data.source';

export const meetingRefDataResolver: ResolveFn<MeetingRefData> = () =>
  inject(MeetingDataSource).fetchMeetingRefData();
