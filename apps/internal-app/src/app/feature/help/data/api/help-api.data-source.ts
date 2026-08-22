import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { ApiConfiguration } from 'src/app/core/api/api-client/api-configuration';
import type { HelpArticle, HelpCatalog } from '../../domain/help.model';
import type { HelpDataSource } from '../help-data.source';
import {
  mapHelpArticleDto,
  mapHelpCatalogDto,
  type HelpPortalArticleDto,
  type HelpPortalCatalogDto,
} from '../help-data.mapper';

interface SuccessResponse<T> {
  responsePayload?: T;
}

/**
 * Calls domain Help Portal API. Prefer regenerating OpenAPI client (`npm run sync:api`)
 * once swagger includes help-portal; this HttpClient path keeps FE unblocked until then.
 */
@Injectable()
export class HelpApiDataSource implements HelpDataSource {
  constructor(
    private readonly http: HttpClient,
    private readonly config: ApiConfiguration,
  ) {}

  fetchCatalog(): Observable<HelpCatalog> {
    return this.http
      .get<SuccessResponse<HelpPortalCatalogDto>>(`${this.config.rootUrl}/api/help-portal/catalog`)
      .pipe(
        map(res => mapHelpCatalogDto(res.responsePayload)),
        catchError(() => of(mapHelpCatalogDto(undefined))),
      );
  }

  fetchArticleBySlug(slug: string): Observable<HelpArticle | undefined> {
    return this.http
      .get<SuccessResponse<HelpPortalArticleDto>>(
        `${this.config.rootUrl}/api/help-portal/articles/${encodeURIComponent(slug)}`,
      )
      .pipe(
        map(res => mapHelpArticleDto(res.responsePayload)),
        catchError(() => of(undefined)),
      );
  }
}
