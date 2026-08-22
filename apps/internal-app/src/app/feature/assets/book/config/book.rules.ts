import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { AppliedListFilter, ChipFilter, RefDataMap } from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  Book,
  BookFilterCriteria,
  BookListContext,
  BookPrimaryChip,
  BookRefDataMap,
  BookStatus,
} from '../domain';
import { BookRefData } from '../domain';

export const BOOK_DEFAULT_CHIP: BookPrimaryChip = 'all';

export const BOOK_LIST_CHIPS: ChipFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'available', label: 'Available' },
  { id: 'on_loan', label: 'On loan' },
  { id: 'donated_out', label: 'Donated out' },
  { id: 'retired', label: 'Retired' },
];

const BOOK_CHIP_STATUS: Partial<Record<BookPrimaryChip, BookStatus>> = {
  available: 'AVAILABLE',
  on_loan: 'ON_LOAN',
  donated_out: 'DONATED_OUT',
  retired: 'RETIRED',
};

export function isBookPrimaryChip(chip: string): chip is BookPrimaryChip {
  return BOOK_LIST_CHIPS.some(item => item.id === chip);
}

export function normalizeBookChip(value?: string | null): BookPrimaryChip {
  return value && isBookPrimaryChip(value) ? value : BOOK_DEFAULT_CHIP;
}

export function bookStatusForChip(chip: BookPrimaryChip): BookStatus | undefined {
  return BOOK_CHIP_STATUS[chip];
}

export function buildBookApiFilter(
  chip: BookPrimaryChip,
  criteria: BookFilterCriteria = {},
): BookFilterCriteria {
  return {
    status: bookStatusForChip(chip) ?? criteria.status,
    category: criteria.category,
    author: criteria.author,
    subject: criteria.subject,
    classLevel: criteria.classLevel,
    location: criteria.location,
    holderUserId: criteria.holderUserId,
    acquisitionType: criteria.acquisitionType,
  };
}

export function createBookContext(options: {
  refData: BookRefDataMap;
}): BookListContext {
  return {
    refData: options.refData,
    userOptions: [],
  };
}

export function cloneBookCriteria(criteria: BookFilterCriteria): BookFilterCriteria {
  return { ...criteria };
}

export function getDefaultCriteriaForChip(_chip: BookPrimaryChip): BookFilterCriteria {
  return {};
}

export function matchesBookSearch(book: Book, searchText: string): boolean {
  const search = searchText.trim().toLocaleLowerCase();
  return book.title.toLocaleLowerCase().includes(search)
    || book.author.toLocaleLowerCase().includes(search)
    || (book.isbn ?? '').toLocaleLowerCase().includes(search)
    || (book.location ?? '').toLocaleLowerCase().includes(search);
}

export function matchesBookCriteria(
  book: Book,
  chip: BookPrimaryChip,
  criteria: BookFilterCriteria,
  searchText?: string,
): boolean {
  const apiFilter = buildBookApiFilter(chip, criteria);
  const search = searchText?.trim();
  return (!apiFilter.status || book.status === apiFilter.status)
    && (!apiFilter.category || book.category === apiFilter.category)
    && (!apiFilter.author || book.author.toLocaleLowerCase().includes(apiFilter.author.toLocaleLowerCase()))
    && (!apiFilter.subject || book.subject === apiFilter.subject)
    && (!apiFilter.classLevel || book.classLevel === apiFilter.classLevel)
    && (!apiFilter.location || (book.location ?? '').toLocaleLowerCase().includes(apiFilter.location.toLocaleLowerCase()))
    && (!apiFilter.holderUserId || book.holderUserId === apiFilter.holderUserId)
    && (!apiFilter.acquisitionType || book.acquisitionType === apiFilter.acquisitionType)
    && (!search || matchesBookSearch(book, search));
}

export function canLendBook(book: Book): boolean {
  return book.status === 'AVAILABLE';
}

export function canReturnBook(book: Book): boolean {
  return book.status === 'ON_LOAN';
}

export function canDonateOutBook(book: Book): boolean {
  return book.status === 'AVAILABLE';
}

export function canMoveLocation(book: Book): boolean {
  return book.status !== 'DONATED_OUT';
}

export function canRetireBook(book: Book): boolean {
  return book.status === 'AVAILABLE' || book.status === 'LOST';
}

export function canMarkLostBook(book: Book): boolean {
  return book.status !== 'DONATED_OUT' && book.status !== 'LOST';
}

function refLabel(refData: RefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

export function buildBookAppliedFilters(
  criteria: BookFilterCriteria,
  refData: RefDataMap,
  context?: BookListContext,
): AppliedListFilter[] {
  const pills: AppliedListFilter[] = [];
  const optionLabel = (
    options: { key: string; label: string }[] | undefined,
    id: string,
  ): string => options?.find(option => option.key === id)?.label ?? id;

  if (criteria.status) {
    pills.push({
      id: 'status',
      label: `Status: ${refLabel(refData, BookRefData.refDataKey.statuses, criteria.status)}`,
    });
  }
  if (criteria.category) {
    pills.push({
      id: 'category',
      label: `Category: ${refLabel(refData, BookRefData.refDataKey.categories, criteria.category)}`,
    });
  }
  if (criteria.author) {
    pills.push({
      id: 'author',
      label: `Author: ${criteria.author}`,
    });
  }
  if (criteria.subject) {
    pills.push({
      id: 'subject',
      label: `Subject: ${refLabel(refData, BookRefData.refDataKey.subjects, criteria.subject)}`,
    });
  }
  if (criteria.classLevel) {
    pills.push({
      id: 'classLevel',
      label: `Class: ${refLabel(refData, BookRefData.refDataKey.classLevels, criteria.classLevel)}`,
    });
  }
  if (criteria.location) {
    pills.push({
      id: 'location',
      label: `Location: ${criteria.location}`,
    });
  }
  if (criteria.holderUserId) {
    pills.push({
      id: 'holderUserId',
      label: `Holder: ${optionLabel(context?.userOptions, criteria.holderUserId)}`,
    });
  }
  if (criteria.acquisitionType) {
    pills.push({
      id: 'acquisitionType',
      label: `Acquisition: ${refLabel(refData, BookRefData.refDataKey.acquisitionTypes, criteria.acquisitionType)}`,
    });
  }

  return pills;
}

export function removeBookFilterById(
  criteria: BookFilterCriteria,
  pillId: string,
): BookFilterCriteria {
  return { ...criteria, [pillId]: undefined };
}

export function countActiveBookSheetFilters(criteria: BookFilterCriteria): number {
  return [
    criteria.status,
    criteria.category,
    criteria.author,
    criteria.subject,
    criteria.classLevel,
    criteria.location,
    criteria.holderUserId,
    criteria.acquisitionType,
  ].filter(Boolean).length;
}

export function resolveBookPermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  return {
    showCreateFab: permissions.includes(SCOPE.create.book),
    canUpdateEntity: permissions.includes(SCOPE.update.book),
    canDelete: permissions.includes(SCOPE.delete.book),
    canOperate: permissions.includes(SCOPE.update.book),
  };
}
