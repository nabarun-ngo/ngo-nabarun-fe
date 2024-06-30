/* tslint:disable */
/* eslint-disable */
import { DonationDetail } from '../models/donation-detail';
export interface PaginateDonationDetail {
  content?: Array<DonationDetail>;
  currentSize?: number;
  nextPageIndex?: number;
  pageIndex?: number;
  pageSize?: number;
  prevPageIndex?: number;
  totalPages?: number;
  totalSize?: number;
}
