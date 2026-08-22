import type { ResolveFn } from '@angular/router';
import type { BookRefDataMap } from '../domain';
import {
  BOOK_ACQUISITION_TYPES,
  BOOK_CATEGORIES,
  BOOK_CLASS_LEVELS,
  BOOK_STATUSES,
  BOOK_SUBJECTS,
  BookRefData,
} from '../domain';

/** Book enums are domain constants; no reference-data call is needed. */
export const bookRefDataResolver: ResolveFn<BookRefDataMap> = () => ({
  [BookRefData.refDataKey.statuses]: BOOK_STATUSES,
  [BookRefData.refDataKey.categories]: BOOK_CATEGORIES,
  [BookRefData.refDataKey.subjects]: BOOK_SUBJECTS,
  [BookRefData.refDataKey.classLevels]: BOOK_CLASS_LEVELS,
  [BookRefData.refDataKey.acquisitionTypes]: BOOK_ACQUISITION_TYPES,
});
