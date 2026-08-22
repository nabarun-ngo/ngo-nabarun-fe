import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import type { HelpArticle, HelpArticleSummary } from '../../domain/help.model';
import { HelpDataSource } from '../../data/help-data.source';

@Component({
  selector: 'app-help-article',
  templateUrl: './help-article.component.html',
  styleUrls: ['./help-article.component.scss'],
  standalone: false,
})
export class HelpArticleComponent implements OnInit, OnDestroy {
  protected readonly helpBackLink = AppRoute.secured_help_home_page.url;

  protected article: HelpArticle | undefined;
  protected categoryLabel = '';
  protected related: HelpArticleSummary[] = [];
  private sub?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly helpData: HelpDataSource,
    private readonly sharedData: SharedDataService,
  ) {}

  ngOnInit(): void {
    this.sharedData.setPageName('Help');
    this.sub = this.route.paramMap.subscribe(params => {
      const slug = params.get('slug') ?? '';
      this.helpData.fetchArticleBySlug(slug).subscribe(article => {
        this.article = article;
        this.loadCatalogContext(article);
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  protected openRelated(slug: string): void {
    void this.router.navigate([AppRoute.secured_help_home_page.url, slug], {
      queryParams: {
        backTo: AppRoute.secured_help_home_page.url,
        backLabel: 'Help',
      },
    });
  }

  private loadCatalogContext(article: HelpArticle | undefined): void {
    this.categoryLabel = '';
    this.related = [];
    if (!article) return;

    this.helpData.fetchCatalog().subscribe(catalog => {
      this.categoryLabel =
        catalog.categories.find(c => c.key === article.categoryKey)?.title ?? article.categoryKey;

      const bySlug = new Map(catalog.articles.map(a => [a.slug, a]));
      this.related = article.relatedSlugs
        .map(slug => bySlug.get(slug))
        .filter((a): a is HelpArticleSummary => !!a);
    });
  }
}
