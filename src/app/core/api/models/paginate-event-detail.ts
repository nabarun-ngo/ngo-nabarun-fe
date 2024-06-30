/* tslint:disable */
/* eslint-disable */
import { EventDetail } from '../models/event-detail';
export interface PaginateEventDetail {
  content?: Array<EventDetail>;
  currentSize?: number;
  nextPageIndex?: number;
  pageIndex?: number;
  pageSize?: number;
  prevPageIndex?: number;
  totalPages?: number;
  totalSize?: number;
}
