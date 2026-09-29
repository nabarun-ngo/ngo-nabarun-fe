import type {
  HelpArticle,
  HelpArticleBlock,
  HelpArticleSummary,
  HelpCatalog,
  HelpCategory,
} from '../domain/help.model';

/** Raw DTO shapes from GET /api/help-portal/* (SuccessResponse.responsePayload). */
export interface HelpPortalCatalogDto {
  categories?: Array<{ key?: string; title?: string; order?: number }>;
  featuredSlugs?: string[];
  articles?: Array<{
    slug?: string;
    title?: string;
    categoryKey?: string;
    summary?: string;
    order?: number;
    active?: boolean;
    estimatedMinutes?: number;
  }>;
}

export interface HelpPortalArticleDto {
  slug?: string;
  title?: string;
  categoryKey?: string;
  summary?: string;
  updatedAt?: string;
  relatedSlugs?: string[];
  blocks?: Array<Record<string, unknown>>;
}

export function mapHelpCatalogDto(dto: HelpPortalCatalogDto | null | undefined): HelpCatalog {
  const categories: HelpCategory[] = (dto?.categories ?? [])
    .filter((c): c is { key: string; title: string; order?: number } => !!c.key && !!c.title)
    .map(c => ({ key: c.key, title: c.title, order: c.order }));

  const articles: HelpArticleSummary[] = (dto?.articles ?? [])
    .filter(
      (a): a is {
        slug: string;
        title: string;
        categoryKey: string;
        summary?: string;
        order?: number;
        active?: boolean;
        estimatedMinutes?: number;
      } => !!a.slug && !!a.title && !!a.categoryKey,
    )
    .map(a => ({
      slug: a.slug,
      title: a.title,
      categoryKey: a.categoryKey,
      summary: a.summary,
      order: a.order,
      active: a.active !== false,
      estimatedMinutes: a.estimatedMinutes,
    }))
    .filter(a => a.active);

  return {
    categories,
    featuredSlugs: dto?.featuredSlugs ?? [],
    articles,
  };
}

export function mapHelpArticleDto(dto: HelpPortalArticleDto | null | undefined): HelpArticle | undefined {
  if (!dto?.slug || !dto?.title || !dto?.categoryKey) return undefined;
  return {
    slug: dto.slug,
    title: dto.title,
    categoryKey: dto.categoryKey,
    summary: dto.summary,
    updatedAt: dto.updatedAt,
    relatedSlugs: dto.relatedSlugs ?? [],
    blocks: mapBlocks(dto.blocks),
  };
}

function mapBlocks(raw: Array<Record<string, unknown>> | undefined): HelpArticleBlock[] {
  if (!raw?.length) return [];
  const blocks: HelpArticleBlock[] = [];
  for (const b of raw) {
    const type = b['type'];
    if (type === 'heading' && typeof b['text'] === 'string') {
      const level = b['level'] === 3 ? 3 : 2;
      blocks.push({ type: 'heading', level, text: b['text'] });
    } else if (type === 'paragraph' && typeof b['text'] === 'string') {
      blocks.push({ type: 'paragraph', text: b['text'] });
    } else if (type === 'callout' && typeof b['text'] === 'string') {
      const tone =
        b['tone'] === 'warning' || b['tone'] === 'info' || b['tone'] === 'tip'
          ? b['tone']
          : 'tip';
      blocks.push({ type: 'callout', tone, text: b['text'] });
    } else if (type === 'steps' && Array.isArray(b['items'])) {
      const items = b['items'].filter((i): i is string => typeof i === 'string');
      if (items.length) blocks.push({ type: 'steps', items });
    } else if (type === 'bullets' && Array.isArray(b['items'])) {
      const items = b['items'].filter((i): i is string => typeof i === 'string');
      if (items.length) blocks.push({ type: 'bullets', items });
    } else if (type === 'video' && typeof b['url'] === 'string') {
      blocks.push({
        type: 'video',
        url: b['url'],
        title: typeof b['title'] === 'string' ? b['title'] : undefined,
      });
    } else if (type === 'link' && typeof b['label'] === 'string' && typeof b['url'] === 'string') {
      blocks.push({
        type: 'link',
        label: b['label'],
        url: b['url'],
        external: b['external'] !== false,
      });
    }
    // Unknown block types are skipped safely.
  }
  return blocks;
}
