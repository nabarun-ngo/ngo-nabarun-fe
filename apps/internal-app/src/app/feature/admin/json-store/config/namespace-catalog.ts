import type { JsonStoreSchemaGroup } from '../domain';

export interface NamespaceUiMeta {
  namespace: string;
  group: JsonStoreSchemaGroup;
  label: string;
  managedLink?: string;
  consumerHint?: string;
}

/** Fallback UI metadata when catalog API is unavailable. */
export const NAMESPACE_UI_FALLBACK: NamespaceUiMeta[] = [
  {
    namespace: 'user-reference-data',
    group: 'reference',
    label: 'Member lookups',
    consumerHint: 'Member titles, genders, geographies, document types',
  },
  {
    namespace: 'finance-reference-data',
    group: 'reference',
    label: 'Finance lookups',
    consumerHint: 'Donation, expense, account, and payment catalogs',
  },
  {
    namespace: 'project-reference-data',
    group: 'reference',
    label: 'Project lookups',
    consumerHint: 'Statuses, types, priorities, and risk catalogs',
  },
  {
    namespace: 'report-definitions',
    group: 'reference',
    label: 'Report definitions',
    consumerHint: 'Registered report catalog',
  },
  {
    namespace: 'custom-forms.field-options',
    group: 'reference',
    label: 'Form field options',
    consumerHint: 'Dropdown option sets for custom forms',
  },
  {
    namespace: 'links',
    group: 'content',
    label: 'Links & policies',
    consumerHint: 'App links, guides, and policy collections',
  },
  {
    namespace: 'help-portal',
    group: 'content',
    label: 'Help portal',
    consumerHint: 'Help catalog and articles',
  },
  {
    namespace: 'correspondence',
    group: 'content',
    label: 'Email templates',
    consumerHint: 'Correspondence notification templates',
  },
  {
    namespace: 'public-site',
    group: 'content',
    label: 'Public site',
    consumerHint: 'Public website static content',
  },
  {
    namespace: 'cron',
    group: 'managed',
    label: 'Cron jobs',
    managedLink: '/secured/admin/cron-jobs',
    consumerHint: 'Prefer the Cron Jobs console for schedule and run-now',
  },
  {
    namespace: 'workflow',
    group: 'managed',
    label: 'Workflow definitions',
    consumerHint: 'Request definitions are managed by the Simple Request service; edit via JSON Store if needed',
  },
];

export const GROUP_LABELS: Record<JsonStoreSchemaGroup, string> = {
  reference: 'Reference data',
  content: 'Content',
  managed: 'Managed elsewhere',
};

export function metaForNamespace(
  namespace: string,
  catalog?: Array<{ namespace: string; group: JsonStoreSchemaGroup; label: string; managedLink?: string; consumerHint?: string }>,
): NamespaceUiMeta {
  const fromCatalog = catalog?.find(c => c.namespace === namespace && !('key' in c && (c as { key?: string }).key));
  if (fromCatalog) {
    return {
      namespace,
      group: fromCatalog.group,
      label: fromCatalog.label,
      managedLink: fromCatalog.managedLink,
      consumerHint: fromCatalog.consumerHint,
    };
  }
  return (
    NAMESPACE_UI_FALLBACK.find(n => n.namespace === namespace) ?? {
      namespace,
      group: 'content',
      label: namespace,
    }
  );
}
