/* tslint:disable */
/* eslint-disable */
import { PaginateWorkDetail } from '../models/paginate-work-detail';
export interface SuccessResponsePaginateWorkDetail {
  info?: string;
  messages?: Array<string>;
  responsePayload?: PaginateWorkDetail;
  status?: number;
  timestamp?: string;
}
