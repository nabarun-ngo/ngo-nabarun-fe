import type { FieldOption } from '@nabarun-ngo/forms-core';
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  Book,
  BookFilterCriteria,
  BookOperationPayload,
  BookPrimaryChip,
  PagedBooks,
} from '../domain';

export interface BookListPageQuery {
  chipId?: string;
  criteria?: BookFilterCriteria;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
}

export interface BookDataSource {
  loadListPage(query: BookListPageQuery): Observable<PagedBooks>;
  fetchBookById(id: string): Observable<Book | undefined>;
  createBook(data: Partial<Book>): Observable<Book>;
  updateBook(id: string, patch: Partial<Book>): Observable<Book>;
  deleteBook(id: string): Observable<void>;
  applyOperation(id: string, payload: BookOperationPayload): Observable<Book>;
  fetchUserOptions(): Observable<FieldOption[]>;
}

export const BookDataSource = new InjectionToken<BookDataSource>('BookDataSource');

export type { BookPrimaryChip };
