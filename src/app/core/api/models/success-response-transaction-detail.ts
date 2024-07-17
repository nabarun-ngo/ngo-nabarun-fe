/* tslint:disable */
/* eslint-disable */
import { TransactionDetail } from '../models/transaction-detail';
export interface SuccessResponseTransactionDetail {
  info?: string;
  messages?: Array<string>;
  responsePayload?: TransactionDetail;
  status?: number;
  timestamp?: string;
}
