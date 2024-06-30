/* tslint:disable */
/* eslint-disable */
import { EventDetail } from '../models/event-detail';
export interface SuccessResponseEventDetail {
  info?: string;
  messages?: Array<string>;
  responsePayload?: EventDetail;
  status?: number;
  timestamp?: string;
}
