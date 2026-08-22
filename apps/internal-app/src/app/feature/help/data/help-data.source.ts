import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type { HelpArticle, HelpCatalog } from '../domain/help.model';

export interface HelpDataSource {
  fetchCatalog(): Observable<HelpCatalog>;
  fetchArticleBySlug(slug: string): Observable<HelpArticle | undefined>;
}

export const HelpDataSource = new InjectionToken<HelpDataSource>('HelpDataSource');
