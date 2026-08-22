import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import {
  matchesBookCriteria,
  normalizeBookChip,
} from 'src/app/feature/assets/book/config/book.rules';
import type {
  Book,
  BookFilterCriteria,
  BookLoanRecord,
  BookOperationPayload,
  PagedBooks,
} from 'src/app/feature/assets/book/domain';
import type {
  BookDataSource,
  BookListPageQuery,
} from 'src/app/feature/assets/book/data/book-data.source';

const DEMO_BOOKS: Book[] = [
  {
    id: 'bk-001',
    title: 'NCERT Mathematics Class 8',
    author: 'NCERT',
    category: 'TEXTBOOK',
    subject: 'MATH',
    classLevel: 'CLASS_8',
    isbn: '978-81-7450-123-4',
    location: 'Ramesh house — 2nd floor shelf A',
    status: 'AVAILABLE',
    acquisitionType: 'PURCHASED',
    acquisitionNotes: 'Purchased for village tuition centre',
    loanHistory: [],
    createdAt: '2026-01-10T06:00:00.000Z',
    updatedAt: '2026-01-10T06:00:00.000Z',
  },
  {
    id: 'bk-002',
    title: 'Panchatantra Stories',
    author: 'Vishnu Sharma',
    category: 'STORY',
    subject: 'LANGUAGE',
    classLevel: 'GENERAL',
    location: 'Community library cupboard',
    status: 'ON_LOAN',
    acquisitionType: 'DONATED_IN',
    acquisitionNotes: 'Donated by local school',
    holderUserId: 'usr-001',
    loanHistory: [
      {
        id: 'ln-001',
        borrowerUserId: 'usr-001',
        loanedAt: '2026-07-15T09:00:00.000Z',
        dueDate: '2026-09-15T09:00:00.000Z',
        notes: 'Summer reading programme',
      },
    ],
    createdAt: '2025-06-01T06:00:00.000Z',
    updatedAt: '2026-07-15T09:00:00.000Z',
  },
  {
    id: 'bk-003',
    title: 'Oxford Science Dictionary',
    author: 'Oxford University Press',
    category: 'REFERENCE',
    subject: 'SCIENCE',
    classLevel: 'CLASS_10',
    isbn: '978-0-19-921089-9',
    location: 'Store room — reference shelf',
    status: 'DONATED_OUT',
    acquisitionType: 'PURCHASED',
    holderGuestName: 'Guest Student — Ananya',
    loanHistory: [
      {
        id: 'ln-002',
        guestName: 'Guest Student — Ananya',
        loanedAt: '2026-03-01T09:00:00.000Z',
        returnedAt: '2026-03-20T09:00:00.000Z',
      },
    ],
    createdAt: '2024-03-12T06:00:00.000Z',
    updatedAt: '2026-05-01T06:00:00.000Z',
  },
  {
    id: 'bk-004',
    title: 'Champak Magazine — April 2026',
    author: 'Delhi Press',
    category: 'MAGAZINE',
    subject: 'GENERAL',
    classLevel: 'GENERAL',
    location: 'Reading corner',
    status: 'RETIRED',
    acquisitionType: 'DONATED_IN',
    loanHistory: [],
    createdAt: '2026-04-01T06:00:00.000Z',
    updatedAt: '2026-08-01T06:00:00.000Z',
  },
];

const store: Book[] = DEMO_BOOKS.map(book => ({
  ...book,
  loanHistory: [...(book.loanHistory ?? [])],
}));

const DEMO_USER_OPTIONS: FieldOption[] = [
  { key: 'usr-001', label: 'Anita Roy' },
  { key: 'usr-002', label: 'Debashis Ghosh' },
  { key: 'usr-003', label: 'Farhana Khatun' },
];

@Injectable()
export class BookDemoDataSource implements BookDataSource {
  loadListPage(query: BookListPageQuery): Observable<PagedBooks> {
    const matches = store.filter(book => matchesBookCriteria(
      book,
      normalizeBookChip(query.chipId),
      (query.criteria ?? {}) as BookFilterCriteria,
      query.searchText,
    ));
    const start = query.pageIndex * query.pageSize;
    return of({
      content: matches.slice(start, start + query.pageSize).map(cloneBook) as Book[],
      totalSize: matches.length,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    }).pipe(delay(200));
  }

  fetchBookById(id: string): Observable<Book | undefined> {
    return of(cloneBook(store.find(book => book.id === id))).pipe(delay(120));
  }

  createBook(data: Partial<Book>): Observable<Book> {
    const created: Book = {
      id: `bk-${String(store.length + 1).padStart(3, '0')}`,
      title: data.title ?? 'New book',
      author: data.author ?? 'Unknown',
      category: data.category ?? 'OTHER',
      subject: data.subject ?? 'GENERAL',
      classLevel: data.classLevel ?? 'GENERAL',
      isbn: data.isbn,
      location: data.location,
      status: data.status ?? 'AVAILABLE',
      acquisitionType: data.acquisitionType ?? 'PURCHASED',
      acquisitionNotes: data.acquisitionNotes,
      loanHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.unshift(created);
    return of(cloneBook(created)!).pipe(delay(200));
  }

  updateBook(id: string, patch: Partial<Book>): Observable<Book> {
    const index = store.findIndex(book => book.id === id);
    const updated: Book = {
      ...(index >= 0 ? store[index] : store[0]),
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    if (index >= 0) {
      store[index] = updated;
    }
    return of(cloneBook(updated)!).pipe(delay(200));
  }

  deleteBook(id: string): Observable<void> {
    const index = store.findIndex(book => book.id === id);
    if (index >= 0) {
      store.splice(index, 1);
    }
    return of(undefined).pipe(delay(200));
  }

  applyOperation(id: string, payload: BookOperationPayload): Observable<Book> {
    const index = store.findIndex(book => book.id === id);
    if (index < 0) {
      return of(cloneBook(store[0])!).pipe(delay(200));
    }

    const book = store[index];
    let updated: Book;

    switch (payload.operation) {
      case 'LEND': {
        const record: BookLoanRecord = {
          id: `ln-${String(Date.now())}`,
          borrowerUserId: payload.borrowerUserId,
          guestName: payload.guestName,
          loanedAt: new Date().toISOString(),
          dueDate: payload.dueDate,
          notes: payload.notes,
        };
        updated = {
          ...book,
          status: 'ON_LOAN',
          holderUserId: payload.borrowerUserId,
          holderGuestName: payload.guestName,
          loanHistory: [...(book.loanHistory ?? []), record],
          updatedAt: new Date().toISOString(),
        };
        break;
      }
      case 'RETURN': {
        const history = [...(book.loanHistory ?? [])];
        const active = history.find(record => !record.returnedAt);
        if (active) {
          active.returnedAt = new Date().toISOString();
          active.notes = payload.notes ?? active.notes;
        }
        updated = {
          ...book,
          status: 'AVAILABLE',
          holderUserId: undefined,
          holderGuestName: undefined,
          loanHistory: history,
          updatedAt: new Date().toISOString(),
        };
        break;
      }
      case 'DONATE_OUT':
        updated = {
          ...book,
          status: 'DONATED_OUT',
          holderUserId: payload.borrowerUserId,
          holderGuestName: payload.guestName,
          updatedAt: new Date().toISOString(),
        };
        break;
      case 'RETIRE':
        updated = {
          ...book,
          status: 'RETIRED',
          holderUserId: undefined,
          holderGuestName: undefined,
          updatedAt: new Date().toISOString(),
        };
        break;
      case 'MARK_LOST':
        updated = {
          ...book,
          status: 'LOST',
          holderUserId: undefined,
          holderGuestName: undefined,
          updatedAt: new Date().toISOString(),
        };
        break;
      case 'TRANSFER_LOCATION':
        updated = {
          ...book,
          location: payload.location ?? book.location,
          updatedAt: new Date().toISOString(),
        };
        break;
      default:
        updated = { ...book, updatedAt: new Date().toISOString() };
    }

    store[index] = updated;
    return of(cloneBook(updated)!).pipe(delay(200));
  }

  fetchUserOptions(): Observable<FieldOption[]> {
    return of(DEMO_USER_OPTIONS).pipe(delay(120));
  }
}

function cloneBook(book: Book | undefined): Book | undefined {
  if (!book) {
    return undefined;
  }
  return {
    ...book,
    loanHistory: book.loanHistory?.map(record => ({ ...record })),
  };
}
