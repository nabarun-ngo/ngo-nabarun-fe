import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import type { HelpArticle, HelpCatalog } from '../domain/help.model';
import { HelpDataSource } from './help-data.source';

export const helpCatalogResolver: ResolveFn<HelpCatalog> = () => {
  return inject(HelpDataSource).fetchCatalog();
};

export const helpArticleResolver: ResolveFn<HelpArticle | undefined> = route => {
  const slug = route.paramMap.get('slug') ?? '';
  return inject(HelpDataSource).fetchArticleBySlug(slug);
};
