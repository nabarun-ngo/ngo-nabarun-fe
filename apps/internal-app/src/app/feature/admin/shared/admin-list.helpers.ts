import { baseField, type FormDefinition, type FormValues } from '@nabarun-ngo/forms-core';
import type {
  ListDetailSection,
  ListFilterCriteria,
  ListRowItem,
} from '@nabarun-ngo/list-dashboard-core';
import {
  detailKeyValueSection,
  detailTextField,
} from '@nabarun-ngo/list-dashboard-core';
import { merge, map, take, type Observable } from 'rxjs';
import type { ModalService } from 'src/app/core/shell/service/modal.service';

/** Minimal criteria shape for admin lists that have no sheet filters. */
export type AdminEmptyCriteria = ListFilterCriteria & Record<string, never>;

export const ADMIN_ALL_CHIP = 'all';

export const ADMIN_LIST_CHIPS = [{ id: ADMIN_ALL_CHIP, label: 'All' }] as const;

export function emptyAdminCriteria(): AdminEmptyCriteria {
  return {} as AdminEmptyCriteria;
}

export function cloneAdminCriteria(criteria: AdminEmptyCriteria): AdminEmptyCriteria {
  return { ...criteria };
}

export function isAdminAllChip(chipId: string): boolean {
  return chipId === ADMIN_ALL_CHIP;
}

export function buildEmptyAdminFilterForm(): FormDefinition {
  return {
    id: 'admin-empty-filter',
    key: 'admin-empty-filter',
    label: 'Filters',
    description: null,
    fields: [],
  };
}

export function adminCriteriaToValues(): FormValues {
  return {};
}

export function adminValuesToCriteria(
  _values: FormValues,
  criteria: AdminEmptyCriteria,
): AdminEmptyCriteria {
  return cloneAdminCriteria(criteria);
}

export function buildEmptyAppliedFilters() {
  return [];
}

export function countEmptySheetFilters(): number {
  return 0;
}

export function removeAdminFilterById(
  criteria: AdminEmptyCriteria,
  _pillId: string,
): AdminEmptyCriteria {
  return cloneAdminCriteria(criteria);
}

export function adminListRouteBindings() {
  return [] as { param: string; criteriaKey: string; type: 'string' }[];
}

export function paginateClientSide<T>(
  items: T[],
  pageIndex: number,
  pageSize: number,
): { page: T[]; totalSize: number } {
  const start = pageIndex * pageSize;
  return {
    page: items.slice(start, start + pageSize),
    totalSize: items.length,
  };
}

export function filterBySearchText<T>(
  items: T[],
  searchText: string | undefined,
  pick: (item: T) => string,
): T[] {
  const q = (searchText ?? '').trim().toLowerCase();
  if (!q) return items;
  return items.filter(item => pick(item).toLowerCase().includes(q));
}

export function mapAdminRow<T>(options: {
  id: string;
  title: string;
  subtitle?: string;
  metaLeft?: string;
  metaRight?: string;
  payload: T;
}): ListRowItem<T> {
  return {
    id: options.id,
    title: options.title,
    subtitle: options.subtitle,
    metaLeft: options.metaLeft,
    metaRight: options.metaRight,
    payload: options.payload,
  };
}

export function kvSection(
  id: string,
  name: string,
  fields: Array<{ label: string; value: string }>,
): ListDetailSection {
  return detailKeyValueSection(
    id,
    name,
    fields.map(f => detailTextField(f.label, f.value || '—')),
  );
}

export function jsonPayloadField(): FormDefinition['fields'][number] {
  return baseField({
    id: 'payloadJson',
    key: 'payloadJson',
    label: 'Payload (JSON)',
    fieldType: 'textarea',
    mandatory: true,
    sortOrder: 10,
    placeholder: '{ ... }',
  });
}

export function stringifyPayload(payload: unknown): string {
  try {
    return JSON.stringify(payload ?? {}, null, 2);
  } catch {
    return '{}';
  }
}

export function parsePayloadJson(values: FormValues): Record<string, unknown> {
  const raw = String(values['payloadJson'] ?? '').trim();
  if (!raw) return {};
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Payload must be a JSON object.');
  }
  return parsed as Record<string, unknown>;
}
