export type BookStatus = 'AVAILABLE' | 'ON_LOAN' | 'DONATED_OUT' | 'RETIRED' | 'LOST';
export type BookAcquisitionType = 'PURCHASED' | 'DONATED_IN';
export type BookCategory = 'TEXTBOOK' | 'STORY' | 'REFERENCE' | 'MAGAZINE' | 'OTHER';
export type BookSubject = 'MATH' | 'SCIENCE' | 'LANGUAGE' | 'SOCIAL' | 'GENERAL' | 'OTHER';
export type BookClassLevel =
  | 'CLASS_1' | 'CLASS_2' | 'CLASS_3' | 'CLASS_4' | 'CLASS_5' | 'CLASS_6'
  | 'CLASS_7' | 'CLASS_8' | 'CLASS_9' | 'CLASS_10' | 'CLASS_11' | 'CLASS_12' | 'GENERAL';
export type BookOperation =
  | 'LEND' | 'RETURN' | 'DONATE_OUT' | 'RETIRE' | 'MARK_LOST' | 'TRANSFER_LOCATION';

export interface BookLoanRecord {
  id: string;
  borrowerUserId?: string;
  guestName?: string;
  loanedAt: string | Date;
  dueDate?: string | Date;
  returnedAt?: string | Date;
  returnedById?: string;
  notes?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  subject: BookSubject;
  classLevel: BookClassLevel;
  isbn?: string;
  location?: string;
  status: BookStatus;
  acquisitionType: BookAcquisitionType;
  acquisitionNotes?: string;
  holderUserId?: string;
  holderGuestName?: string;
  createdById?: string;
  updatedById?: string;
  loanHistory?: BookLoanRecord[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PagedBooks {
  content?: Book[];
  totalSize?: number;
  pageIndex?: number;
  pageSize?: number;
}

export type BookPrimaryChip = 'all' | 'available' | 'on_loan' | 'donated_out' | 'retired';

export interface BookFilterCriteria {
  [key: string]: unknown;
  status?: BookStatus;
  category?: BookCategory;
  author?: string;
  subject?: BookSubject;
  classLevel?: BookClassLevel;
  location?: string;
  holderUserId?: string;
  acquisitionType?: BookAcquisitionType;
}

export const BookRefData = {
  refDataKey: {
    statuses: 'bookStatuses',
    categories: 'bookCategories',
    subjects: 'bookSubjects',
    classLevels: 'bookClassLevels',
    acquisitionTypes: 'bookAcquisitionTypes',
  },
} as const;

export type BookRefDataMap = Record<string, import('src/app/shared/models/key-value.model').KeyValue[] | undefined>;

export const BOOK_STATUSES: import('src/app/shared/models/key-value.model').KeyValue[] = [
  { key: 'AVAILABLE', displayValue: 'Available' },
  { key: 'ON_LOAN', displayValue: 'On loan' },
  { key: 'DONATED_OUT', displayValue: 'Donated out' },
  { key: 'RETIRED', displayValue: 'Retired' },
  { key: 'LOST', displayValue: 'Lost' },
];

export const BOOK_CATEGORIES = [
  { key: 'TEXTBOOK', displayValue: 'Textbook' },
  { key: 'STORY', displayValue: 'Story' },
  { key: 'REFERENCE', displayValue: 'Reference' },
  { key: 'MAGAZINE', displayValue: 'Magazine' },
  { key: 'OTHER', displayValue: 'Other' },
];

export const BOOK_SUBJECTS = [
  { key: 'MATH', displayValue: 'Math' },
  { key: 'SCIENCE', displayValue: 'Science' },
  { key: 'LANGUAGE', displayValue: 'Language' },
  { key: 'SOCIAL', displayValue: 'Social' },
  { key: 'GENERAL', displayValue: 'General' },
  { key: 'OTHER', displayValue: 'Other' },
];

export const BOOK_CLASS_LEVELS = [
  { key: 'CLASS_1', displayValue: 'Class 1' },
  { key: 'CLASS_2', displayValue: 'Class 2' },
  { key: 'CLASS_3', displayValue: 'Class 3' },
  { key: 'CLASS_4', displayValue: 'Class 4' },
  { key: 'CLASS_5', displayValue: 'Class 5' },
  { key: 'CLASS_6', displayValue: 'Class 6' },
  { key: 'CLASS_7', displayValue: 'Class 7' },
  { key: 'CLASS_8', displayValue: 'Class 8' },
  { key: 'CLASS_9', displayValue: 'Class 9' },
  { key: 'CLASS_10', displayValue: 'Class 10' },
  { key: 'CLASS_11', displayValue: 'Class 11' },
  { key: 'CLASS_12', displayValue: 'Class 12' },
  { key: 'GENERAL', displayValue: 'General' },
];

export const BOOK_ACQUISITION_TYPES = [
  { key: 'PURCHASED', displayValue: 'Purchased' },
  { key: 'DONATED_IN', displayValue: 'Donated in' },
];

export interface BookListContext {
  [key: string]: unknown;
  refData: BookRefDataMap;
  userOptions: import('@nabarun-ngo/forms-core').FieldOption[];
}

export interface BookOperationPayload {
  operation: BookOperation;
  borrowerUserId?: string;
  guestName?: string;
  dueDate?: string;
  notes?: string;
  location?: string;
}
