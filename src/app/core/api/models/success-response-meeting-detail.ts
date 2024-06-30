/* tslint:disable */
/* eslint-disable */
import { MeetingDetail } from '../models/meeting-detail';
export interface SuccessResponseMeetingDetail {
  info?: string;
  messages?: Array<string>;
  responsePayload?: MeetingDetail;
  status?: number;
  timestamp?: string;
}
