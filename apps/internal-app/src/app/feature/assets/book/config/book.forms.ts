import { baseField, toFieldOptions } from '@nabarun-ngo/forms-core';
import type {
  FieldOption,
  FormDefinition,
  FormFieldDefinition,
  FormValues,
} from '@nabarun-ngo/forms-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  Book,
  BookAcquisitionType,
  BookCategory,
  BookClassLevel,
  BookFilterCriteria,
  BookOperationPayload,
  BookRefDataMap,
  BookSubject,
} from '../domain';
import { BookRefData } from '../domain';

const RECIPIENT_MEMBER = 'MEMBER';
const RECIPIENT_GUEST = 'GUEST';

function options(refData: BookRefDataMap, key: string): FieldOption[] {
  return toFieldOptions(refData[key] as KeyValue[] | undefined);
}

function field(
  key: string,
  label: string,
  fieldType: FormFieldDefinition['fieldType'],
  sortOrder: number,
  overrides: Partial<FormFieldDefinition> = {},
): FormFieldDefinition {
  return baseField({ id: `book-${key}`, key, label, fieldType, sortOrder, ...overrides });
}

const recipientTypeOptions: FieldOption[] = [
  { key: RECIPIENT_MEMBER, label: 'Member' },
  { key: RECIPIENT_GUEST, label: 'Guest' },
];

function recipientFields(userOptions: FieldOption[], sortStart: number): FormFieldDefinition[] {
  return [
    field('recipientType', 'Recipient', 'select', sortStart, {
      mandatory: true,
      fieldOptions: recipientTypeOptions,
    }),
    field('borrowerUserId', 'Member', 'autocomplete', sortStart + 1, {
      mandatory: true,
      fieldOptions: userOptions,
      condition: {
        dependsOnKey: 'recipientType',
        operator: 'equals',
        value: RECIPIENT_MEMBER,
      },
    }),
    field('guestName', 'Guest name', 'text', sortStart + 2, {
      mandatory: true,
      condition: {
        dependsOnKey: 'recipientType',
        operator: 'equals',
        value: RECIPIENT_GUEST,
      },
    }),
  ];
}

function bookFormFields(refData: BookRefDataMap): FormFieldDefinition[] {
  return [
    field('title', 'Title', 'text', 1, { mandatory: true }),
    field('author', 'Author', 'text', 2, { mandatory: true }),
    field('category', 'Category', 'select', 3, {
      mandatory: true,
      fieldOptions: options(refData, BookRefData.refDataKey.categories),
    }),
    field('subject', 'Subject', 'select', 4, {
      mandatory: true,
      fieldOptions: options(refData, BookRefData.refDataKey.subjects),
    }),
    field('classLevel', 'Class level', 'select', 5, {
      mandatory: true,
      fieldOptions: options(refData, BookRefData.refDataKey.classLevels),
    }),
    field('isbn', 'ISBN', 'text', 6),
    field('location', 'Location', 'text', 7),
    field('acquisitionType', 'Acquisition type', 'select', 8, {
      mandatory: true,
      fieldOptions: options(refData, BookRefData.refDataKey.acquisitionTypes),
    }),
    field('acquisitionNotes', 'Acquisition notes', 'textarea', 9),
  ];
}

export function buildBookCreateForm(refData: BookRefDataMap): FormDefinition {
  return {
    id: 'book-create',
    key: 'book',
    label: 'Register book',
    description: null,
    fields: bookFormFields(refData),
  };
}

export function buildBookUpdateForm(book: Book, refData: BookRefDataMap): FormDefinition {
  return {
    id: `book-update-${book.id}`,
    key: 'book',
    label: 'Update book',
    description: null,
    fields: bookFormFields(refData),
  };
}

export function defaultBookCreateValues(): FormValues {
  return {
    title: '',
    author: '',
    category: '',
    subject: '',
    classLevel: '',
    isbn: '',
    location: '',
    acquisitionType: '',
    acquisitionNotes: '',
  };
}

export function bookCreateEntity(values: FormValues): Partial<Book> {
  return {
    title: text(values, 'title'),
    author: text(values, 'author'),
    category: text(values, 'category') as BookCategory | undefined,
    subject: text(values, 'subject') as BookSubject | undefined,
    classLevel: text(values, 'classLevel') as BookClassLevel | undefined,
    isbn: text(values, 'isbn'),
    location: text(values, 'location'),
    acquisitionType: text(values, 'acquisitionType') as BookAcquisitionType | undefined,
    acquisitionNotes: text(values, 'acquisitionNotes'),
    status: 'AVAILABLE',
  };
}

export function bookToUpdateValues(book: Book): FormValues {
  return {
    title: book.title ?? '',
    author: book.author ?? '',
    category: book.category ?? '',
    subject: book.subject ?? '',
    classLevel: book.classLevel ?? '',
    isbn: book.isbn ?? '',
    location: book.location ?? '',
    acquisitionType: book.acquisitionType ?? '',
    acquisitionNotes: book.acquisitionNotes ?? '',
  };
}

export function bookUpdatePatch(values: FormValues): Partial<Book> {
  return {
    title: text(values, 'title'),
    author: text(values, 'author'),
    category: text(values, 'category') as BookCategory | undefined,
    subject: text(values, 'subject') as BookSubject | undefined,
    classLevel: text(values, 'classLevel') as BookClassLevel | undefined,
    isbn: text(values, 'isbn'),
    location: text(values, 'location'),
    acquisitionType: text(values, 'acquisitionType') as BookAcquisitionType | undefined,
    acquisitionNotes: text(values, 'acquisitionNotes'),
  };
}

export function buildBookFilterForm(
  refData: BookRefDataMap,
  deps: { userOptions?: FieldOption[] } = {},
): FormDefinition {
  return {
    id: 'book-filter',
    key: 'book-filter',
    label: 'Filter books',
    description: null,
    fields: [
      field('status', 'Status', 'select', 1, {
        fieldOptions: options(refData, BookRefData.refDataKey.statuses),
      }),
      field('category', 'Category', 'select', 2, {
        fieldOptions: options(refData, BookRefData.refDataKey.categories),
      }),
      field('author', 'Author', 'text', 3),
      field('subject', 'Subject', 'select', 4, {
        fieldOptions: options(refData, BookRefData.refDataKey.subjects),
      }),
      field('classLevel', 'Class level', 'select', 5, {
        fieldOptions: options(refData, BookRefData.refDataKey.classLevels),
      }),
      field('location', 'Location', 'text', 6),
      field('holderUserId', 'Holder', 'autocomplete', 7, {
        fieldOptions: deps.userOptions ?? [],
      }),
      field('acquisitionType', 'Acquisition type', 'select', 8, {
        fieldOptions: options(refData, BookRefData.refDataKey.acquisitionTypes),
      }),
    ],
  };
}

export function bookCriteriaToValues(criteria: BookFilterCriteria): FormValues {
  return {
    status: criteria.status ?? '',
    category: criteria.category ?? '',
    author: criteria.author ?? '',
    subject: criteria.subject ?? '',
    classLevel: criteria.classLevel ?? '',
    location: criteria.location ?? '',
    holderUserId: criteria.holderUserId ?? '',
    acquisitionType: criteria.acquisitionType ?? '',
  };
}

export function bookValuesToCriteria(
  values: FormValues,
  criteria: BookFilterCriteria,
): BookFilterCriteria {
  return {
    ...criteria,
    status: text(values, 'status') as BookFilterCriteria['status'],
    category: text(values, 'category') as BookCategory | undefined,
    author: text(values, 'author'),
    subject: text(values, 'subject') as BookSubject | undefined,
    classLevel: text(values, 'classLevel') as BookClassLevel | undefined,
    location: text(values, 'location'),
    holderUserId: text(values, 'holderUserId'),
    acquisitionType: text(values, 'acquisitionType') as BookAcquisitionType | undefined,
  };
}

export function buildBookEditSummary(
  book: Book,
  refData: BookRefDataMap,
): { label: string; value: string }[] {
  const label = (key: string, value?: string): string =>
    (refData[key] as KeyValue[] | undefined)
      ?.find(item => item.key === value)?.displayValue ?? value ?? '-';

  return [
    { label: 'Category', value: label(BookRefData.refDataKey.categories, book.category) },
    { label: 'Status', value: label(BookRefData.refDataKey.statuses, book.status) },
  ];
}

export function buildLendBookForm(userOptions: FieldOption[] = []): FormDefinition {
  return {
    id: 'book-lend',
    key: 'book-lend',
    label: 'Lend book',
    description: null,
    fields: [
      ...recipientFields(userOptions, 1),
      field('dueDate', 'Due date', 'date', 4),
      field('notes', 'Notes', 'textarea', 5),
    ],
  };
}

export function defaultLendBookValues(): FormValues {
  return {
    recipientType: RECIPIENT_MEMBER,
    borrowerUserId: '',
    guestName: '',
    dueDate: '',
    notes: '',
  };
}

export function lendBookPayload(values: FormValues): BookOperationPayload {
  const recipient = recipientPayload(values);
  return {
    operation: 'LEND',
    ...recipient,
    dueDate: text(values, 'dueDate'),
    notes: text(values, 'notes'),
  };
}

export function buildReturnBookForm(): FormDefinition {
  return {
    id: 'book-return',
    key: 'book-return',
    label: 'Return book',
    description: null,
    fields: [
      field('notes', 'Notes', 'textarea', 1),
    ],
  };
}

export function defaultReturnBookValues(): FormValues {
  return { notes: '' };
}

export function returnBookPayload(values: FormValues): BookOperationPayload {
  return {
    operation: 'RETURN',
    notes: text(values, 'notes'),
  };
}

export function buildDonateOutBookForm(userOptions: FieldOption[] = []): FormDefinition {
  return {
    id: 'book-donate-out',
    key: 'book-donate-out',
    label: 'Donate out book',
    description: null,
    fields: [
      ...recipientFields(userOptions, 1),
      field('notes', 'Notes', 'textarea', 4),
    ],
  };
}

export function defaultDonateOutBookValues(): FormValues {
  return {
    recipientType: RECIPIENT_MEMBER,
    borrowerUserId: '',
    guestName: '',
    notes: '',
  };
}

export function donateOutBookPayload(values: FormValues): BookOperationPayload {
  return {
    operation: 'DONATE_OUT',
    ...recipientPayload(values),
    notes: text(values, 'notes'),
  };
}

export function buildTransferLocationForm(): FormDefinition {
  return {
    id: 'book-transfer-location',
    key: 'book-transfer',
    label: 'Transfer location',
    description: null,
    fields: [
      field('location', 'New location', 'text', 1, { mandatory: true }),
    ],
  };
}

export function defaultTransferLocationValues(book?: Book): FormValues {
  return { location: book?.location ?? '' };
}

export function transferLocationPayload(values: FormValues): BookOperationPayload {
  const location = text(values, 'location');
  if (!location) {
    throw new Error('Enter the new location for this book.');
  }
  return {
    operation: 'TRANSFER_LOCATION',
    location,
  };
}

export function buildRetireBookForm(): FormDefinition {
  return {
    id: 'book-retire',
    key: 'book-retire',
    label: 'Retire book',
    description: null,
    fields: [
      field('notes', 'Notes', 'textarea', 1),
    ],
  };
}

export function defaultRetireBookValues(): FormValues {
  return { notes: '' };
}

export function retireBookPayload(values: FormValues): BookOperationPayload {
  return {
    operation: 'RETIRE',
    notes: text(values, 'notes'),
  };
}

export function buildMarkLostBookForm(): FormDefinition {
  return {
    id: 'book-mark-lost',
    key: 'book-mark-lost',
    label: 'Mark book lost',
    description: null,
    fields: [
      field('notes', 'Notes', 'textarea', 1),
    ],
  };
}

export function defaultMarkLostBookValues(): FormValues {
  return { notes: '' };
}

export function markLostBookPayload(values: FormValues): BookOperationPayload {
  return {
    operation: 'MARK_LOST',
    notes: text(values, 'notes'),
  };
}

function recipientPayload(values: FormValues): Pick<BookOperationPayload, 'borrowerUserId' | 'guestName'> {
  const recipientType = text(values, 'recipientType');
  if (recipientType === RECIPIENT_MEMBER) {
    const borrowerUserId = text(values, 'borrowerUserId');
    if (!borrowerUserId) {
      throw new Error('Select the member receiving this book.');
    }
    return { borrowerUserId };
  }
  if (recipientType === RECIPIENT_GUEST) {
    const guestName = text(values, 'guestName');
    if (!guestName) {
      throw new Error('Enter the guest name.');
    }
    return { guestName };
  }
  throw new Error('Select whether the recipient is a member or guest.');
}

function text(values: FormValues, key: string): string | undefined {
  const value = values[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
