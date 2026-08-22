/** Typed content blocks rendered by the help article UI. Content comes from API JSON only. */
export type HelpArticleBlock =
  | { type: 'heading'; level?: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'callout'; tone?: 'tip' | 'warning' | 'info'; text: string }
  | { type: 'steps'; items: string[] }
  | { type: 'bullets'; items: string[] }
  | { type: 'video'; url: string; title?: string }
  | { type: 'link'; label: string; url: string; external?: boolean };

export interface HelpCategory {
  key: string;
  title: string;
  order?: number;
}

export interface HelpArticleSummary {
  slug: string;
  title: string;
  categoryKey: string;
  summary?: string;
  order?: number;
  active: boolean;
  estimatedMinutes?: number;
}

export interface HelpCatalog {
  categories: HelpCategory[];
  featuredSlugs: string[];
  articles: HelpArticleSummary[];
}

export interface HelpArticle {
  slug: string;
  title: string;
  categoryKey: string;
  summary?: string;
  updatedAt?: string;
  relatedSlugs: string[];
  blocks: HelpArticleBlock[];
}
