import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import type { HelpArticle, HelpCatalog } from 'src/app/feature/help/domain/help.model';
import type { HelpDataSource } from 'src/app/feature/help/data/help-data.source';
import { HELP_DEMO_ARTICLES, HELP_DEMO_CATALOG } from './help-demo.fixtures';

@Injectable()
export class HelpDemoDataSource implements HelpDataSource {
  fetchCatalog(): Observable<HelpCatalog> {
    return of(HELP_DEMO_CATALOG);
  }

  fetchArticleBySlug(slug: string): Observable<HelpArticle | undefined> {
    return of(HELP_DEMO_ARTICLES[slug]);
  }
}
