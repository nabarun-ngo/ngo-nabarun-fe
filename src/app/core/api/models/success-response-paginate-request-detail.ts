/* tslint:disable */
/* eslint-disable */
import { PaginateRequestDetail } from '../models/paginate-request-detail';
export interface SuccessResponsePaginateRequestDetail {
  info?: string;
  messages?: Array<string>;
  responsePayload?: PaginateRequestDetail;
  status?: number;
  timestamp?: string;
}
