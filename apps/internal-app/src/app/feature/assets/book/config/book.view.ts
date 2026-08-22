import { detailKeyValueSection, detailTextField } from '@nabarun-ngo/list-dashboard-angular';
import type {
  ListDetailSection,
  ListRowBadge,
  ListRowItem,
} from '@nabarun-ngo/list-dashboard-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { date } from 'src/app/shared/utils/utilities.service';
import type { Book, BookLoanRecord, BookRefDataMap, BookStatus } from '../domain';
import { BookRefData } from '../domain';

function refLabel(refData: BookRefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

function statusBadge(
  status: BookStatus | undefined,
  refData: BookRefDataMap,
): ListRowBadge {
  const tone = status === 'ON_LOAN'
    ? 'primary'
    : status === 'DONATED_OUT'
      ? 'warning'
      : status === 'LOST'
        ? 'danger'
        : status === 'RETIRED'
          ? 'neutral'
          : 'success';
  return { label: refLabel(refData, BookRefData.refDataKey.statuses, status), tone };
}

function bookIcon(_category: Book['category']): string {
  return 'milestones';
}

function holderLabel(
  book: Book,
  users: ReadonlyMap<string, string> = new Map(),
): string | undefined {
  if (book.holderUserId) {
    return users.get(book.holderUserId) ?? book.holderUserId;
  }
  return book.holderGuestName;
}

export function mapBookToListRow(
  book: Book,
  refData: BookRefDataMap = {},
  labels: { users?: ReadonlyMap<string, string> } = {},
): ListRowItem<Book> {
  return {
    id: book.id,
    title: book.title,
    subtitle: [
      book.author,
      refLabel(refData, BookRefData.refDataKey.categories, book.category),
      refLabel(refData, BookRefData.refDataKey.classLevels, book.classLevel),
    ].filter(Boolean).join(' · '),
    metaLeft: book.location || undefined,
    metaRight: holderLabel(book, labels.users),
    badge: statusBadge(book.status, refData),
    icon: bookIcon(book.category),
    iconTone: 'blue',
    payload: book,
  };
}

function formatLoanTimeline(
  records: BookLoanRecord[] | undefined,
  users: ReadonlyMap<string, string> = new Map(),
): string {
  if (!records?.length) {
    return 'No loan history recorded.';
  }

  return records.map(record => {
    const borrower = record.borrowerUserId
      ? users.get(record.borrowerUserId) ?? record.borrowerUserId
      : record.guestName ?? 'Guest';
    const loaned = date(record.loanedAt, 'dd MMM yyyy');
    const due = record.dueDate ? `; due ${date(record.dueDate, 'dd MMM yyyy')}` : '';
    if (record.returnedAt) {
      return `${loaned}: lent to ${borrower}${due}; returned ${date(record.returnedAt, 'dd MMM yyyy')}${
        record.notes ? ` — ${record.notes}` : ''
      }`;
    }
    return `${loaned}: lent to ${borrower}${due}${
      record.notes ? ` — ${record.notes}` : ''
    } (active)`;
  }).join('\n');
}

export function buildBookDetailSections(
  book: Book,
  refData: BookRefDataMap,
  labels: { users?: ReadonlyMap<string, string> } = {},
): ListDetailSection[] {
  const person = (id?: string): string =>
    id ? labels.users?.get(id) ?? id : '-';

  return [
    detailKeyValueSection('book_detail', 'Book details', [
      detailTextField('Title', book.title),
      detailTextField('Author', book.author),
      detailTextField(
        'Category',
        refLabel(refData, BookRefData.refDataKey.categories, book.category),
      ),
      detailTextField(
        'Subject',
        refLabel(refData, BookRefData.refDataKey.subjects, book.subject),
      ),
      detailTextField(
        'Class level',
        refLabel(refData, BookRefData.refDataKey.classLevels, book.classLevel),
      ),
      detailTextField('ISBN', book.isbn || '-'),
      detailTextField('Location', book.location || '-'),
      detailTextField(
        'Status',
        refLabel(refData, BookRefData.refDataKey.statuses, book.status),
      ),
      detailTextField(
        'Acquisition type',
        refLabel(refData, BookRefData.refDataKey.acquisitionTypes, book.acquisitionType),
      ),
      detailTextField('Acquisition notes', book.acquisitionNotes || '-'),
      detailTextField('Holder', holderLabel(book, labels.users) ?? '-'),
      detailTextField('Member holder', person(book.holderUserId)),
    ]),
    detailKeyValueSection('book_loans', 'Loan timeline', [
      detailTextField(
        'History',
        formatLoanTimeline(book.loanHistory, labels.users),
      ),
    ]),
  ];
}
