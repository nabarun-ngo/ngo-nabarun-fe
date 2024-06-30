/* tslint:disable */
/* eslint-disable */
import { PaginateEventDetail } from '../models/paginate-event-detail';
export interface SuccessResponsePaginateEventDetail {
  info?: string;
  messages?: Array<string>;
  responsePayload?: PaginateEventDetail;
  status?: number;
  timestamp?: string;
}
