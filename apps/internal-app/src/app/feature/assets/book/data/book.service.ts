import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import { ApiConfiguration } from 'src/app/core/api/api-client/api-configuration';
import { UsersService } from 'src/app/core/api/api-client/services';
import { mapPagedUserDtoToPagedUser } from 'src/app/feature/member/data/member-data.mapper';
import type {
  Book,
  BookAcquisitionType,
  BookCategory,
  BookClassLevel,
  BookFilterCriteria,
  BookOperationPayload,
  BookSubject,
  PagedBooks,
} from '../domain';
import {
  mapBookDto,
  toCreateBookBody,
  toUpdateBookBody,
  type BookDetailDto,
} from './book-data.mapper';

interface SuccessResponse<T> {
  responsePayload?: T;
}

interface BookListResponseDto {
  items: BookDetailDto[];
  total: number;
  pageIndex: number;
  pageSize: number;
}

/** Thin transport wrapper over `/api/books` until OpenAPI client includes BookService. */
@Injectable({ providedIn: 'root' })
export class BookService {
  constructor(
    private readonly http: HttpClient,
    private readonly config: ApiConfiguration,
    private readonly usersApi: UsersService,
  ) {}

  listBooks(options: {
    pageIndex: number;
    pageSize: number;
    q?: string;
    status?: BookFilterCriteria['status'];
    category?: BookCategory;
    author?: string;
    subject?: BookSubject;
    classLevel?: BookClassLevel;
    location?: string;
    holderUserId?: string;
    acquisitionType?: BookAcquisitionType;
  }): Observable<PagedBooks> {
    let params = new HttpParams()
      .set('pageIndex', String(options.pageIndex))
      .set('pageSize', String(options.pageSize));

    if (options.q) {
      params = params.set('q', options.q);
    }
    if (options.status) {
      params = params.set('status', options.status);
    }
    if (options.category) {
      params = params.set('category', options.category);
    }
    if (options.author) {
      params = params.set('author', options.author);
    }
    if (options.subject) {
      params = params.set('subject', options.subject);
    }
    if (options.classLevel) {
      params = params.set('classLevel', options.classLevel);
    }
    if (options.location) {
      params = params.set('location', options.location);
    }
    if (options.holderUserId) {
      params = params.set('holderUserId', options.holderUserId);
    }
    if (options.acquisitionType) {
      params = params.set('acquisitionType', options.acquisitionType);
    }

    return this.http
      .get<SuccessResponse<BookListResponseDto>>(`${this.config.rootUrl}/api/books/list`, { params })
      .pipe(
        map(response => {
          const payload = response.responsePayload ?? { items: [], total: 0, pageIndex: 0, pageSize: 0 };
          return {
            content: (payload.items ?? []).map(mapBookDto),
            totalSize: payload.total ?? 0,
            pageIndex: payload.pageIndex ?? options.pageIndex,
            pageSize: payload.pageSize ?? options.pageSize,
          };
        }),
      );
  }

  fetchBookById(id: string): Observable<Book | undefined> {
    return this.http
      .get<SuccessResponse<BookDetailDto>>(`${this.config.rootUrl}/api/books/${encodeURIComponent(id)}`)
      .pipe(
        map(response => {
          const payload = response.responsePayload;
          return payload ? mapBookDto(payload) : undefined;
        }),
      );
  }

  createBook(data: Partial<Book>): Observable<Book> {
    return this.http
      .post<SuccessResponse<BookDetailDto>>(`${this.config.rootUrl}/api/books/create`, toCreateBookBody(data))
      .pipe(map(response => mapBookDto(response.responsePayload!)));
  }

  updateBook(id: string, patch: Partial<Book>): Observable<Book> {
    return this.http
      .put<SuccessResponse<BookDetailDto>>(
        `${this.config.rootUrl}/api/books/update/${encodeURIComponent(id)}`,
        toUpdateBookBody(patch),
      )
      .pipe(map(response => mapBookDto(response.responsePayload!)));
  }

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${this.config.rootUrl}/api/books/${encodeURIComponent(id)}`);
  }

  applyOperation(id: string, payload: BookOperationPayload): Observable<Book> {
    return this.http
      .post<SuccessResponse<BookDetailDto>>(
        `${this.config.rootUrl}/api/books/${encodeURIComponent(id)}/operations`,
        payload,
      )
      .pipe(map(response => mapBookDto(response.responsePayload!)));
  }

  fetchUserOptions(): Observable<FieldOption[]> {
    return this.usersApi.userControllerListUsers({ status: 'ACTIVE' }).pipe(
      map(response => mapPagedUserDtoToPagedUser(response.responsePayload!)),
      map(page => (page.content ?? [])
        .filter(user => !!user.id)
        .map(user => ({
          key: user.id!,
          label: user.fullName?.trim() || user.email?.trim() || user.id!,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))),
    );
  }
}
