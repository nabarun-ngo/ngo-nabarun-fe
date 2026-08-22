import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import { buildBookApiFilter, normalizeBookChip } from '../../config/book.rules';
import type { Book, BookOperationPayload, PagedBooks } from '../../domain';
import type { BookDataSource, BookListPageQuery } from '../book-data.source';
import { BookService } from '../book.service';

@Injectable()
export class BookApiDataSource implements BookDataSource {
  constructor(private readonly books: BookService) {}

  loadListPage(query: BookListPageQuery): Observable<PagedBooks> {
    const filter = buildBookApiFilter(
      normalizeBookChip(query.chipId),
      query.criteria ?? {},
    );
    const search = query.searchText?.trim();

    return this.books.listBooks({
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
      q: search || undefined,
      ...filter,
    });
  }

  fetchBookById(id: string): Observable<Book | undefined> {
    return this.books.fetchBookById(id).pipe(catchError(() => of(undefined)));
  }

  createBook(data: Partial<Book>): Observable<Book> {
    return this.books.createBook(data);
  }

  updateBook(id: string, patch: Partial<Book>): Observable<Book> {
    return this.books.updateBook(id, patch);
  }

  deleteBook(id: string): Observable<void> {
    return this.books.deleteBook(id);
  }

  applyOperation(id: string, payload: BookOperationPayload): Observable<Book> {
    return this.books.applyOperation(id, payload);
  }

  fetchUserOptions(): Observable<FieldOption[]> {
    return this.books.fetchUserOptions().pipe(catchError(() => of([])));
  }
}
