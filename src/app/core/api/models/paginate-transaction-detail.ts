/* tslint:disable */
/* eslint-disable */
import { TransactionDetail } from '../models/transaction-detail';
export interface PaginateTransactionDetail {
  content?: Array<TransactionDetail>;
  currentSize?: number;
  nextPageIndex?: number;
  pageIndex?: number;
  pageSize?: number;
  prevPageIndex?: number;
  totalPages?: number;
  totalSize?: number;
}
