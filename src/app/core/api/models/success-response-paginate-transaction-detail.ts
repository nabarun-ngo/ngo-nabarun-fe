/* tslint:disable */
/* eslint-disable */
import { PaginateTransactionDetail } from '../models/paginate-transaction-detail';
export interface SuccessResponsePaginateTransactionDetail {
  info?: string;
  messages?: Array<string>;
  responsePayload?: PaginateTransactionDetail;
  status?: number;
  timestamp?: string;
}
