import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import type { HelpArticleSummary, HelpCatalog, HelpCategory } from '../../domain/help.model';

@Component({
  selector: 'app-help-home',
  templateUrl: './help-home.component.html',
  styleUrls: ['./help-home.component.scss'],
  standalone: false,
})
export class HelpHomeComponent implements OnInit {
  protected readonly dashboardBackLink = AppRoute.secured_dashboard_page.url;

  protected catalog: HelpCatalog;
  protected searchText = '';
  protected selectedCategoryKey: string | 'all' = 'all';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly sharedData: SharedDataService,
  ) {
    this.catalog = this.route.snapshot.data['data'] as HelpCatalog;
  }

  ngOnInit(): void {
    this.sharedData.setPageName('Help');
  }

  protected get categories(): HelpCategory[] {
    return this.catalog?.categories ?? [];
  }

  protected get featuredArticles(): HelpArticleSummary[] {
    const bySlug = new Map((this.catalog?.articles ?? []).map(a => [a.slug, a]));
    return (this.catalog?.featuredSlugs ?? [])
      .map(slug => bySlug.get(slug))
      .filter((a): a is HelpArticleSummary => !!a)
      .filter(a => this.matchesFilters(a));
  }

  protected get filteredArticles(): HelpArticleSummary[] {
    return (this.catalog?.articles ?? []).filter(a => this.matchesFilters(a));
  }

  protected get hasSearch(): boolean {
    return this.searchText.trim().length > 0;
  }

  protected categoryTitle(key: string): string {
    return this.categories.find(c => c.key === key)?.title ?? key;
  }

  protected selectCategory(key: string | 'all'): void {
    this.selectedCategoryKey = key;
  }

  protected openArticle(slug: string): void {
    void this.router.navigate([AppRoute.secured_help_home_page.url, slug], {
      queryParams: {
        backTo: AppRoute.secured_help_home_page.url,
        backLabel: 'Help',
      },
    });
  }

  private matchesFilters(article: HelpArticleSummary): boolean {
    if (this.selectedCategoryKey !== 'all' && article.categoryKey !== this.selectedCategoryKey) {
      return false;
    }
    const q = this.searchText.trim().toLowerCase();
    if (!q) return true;
    const hay = `${article.title} ${article.summary ?? ''} ${article.categoryKey}`.toLowerCase();
    return hay.includes(q);
  }
}
