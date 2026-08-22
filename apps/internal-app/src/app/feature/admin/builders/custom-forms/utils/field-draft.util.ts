import type { DependentOptions, FieldCondition, FieldOption } from '../domain';

/** Split comma / newline scoped permission tokens. */
export function parsePermissionList(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

export function formatPermissionList(list: string[] | undefined | null): string {
  return (list ?? []).join(', ');
}

/** Lines of `key|label` (label optional → uses key). */
export function parseOptionsText(raw: string): FieldOption[] {
  return raw
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const pipe = line.indexOf('|');
      if (pipe === -1) return { key: line, label: line };
      const key = line.slice(0, pipe).trim();
      const label = line.slice(pipe + 1).trim() || key;
      return { key, label };
    })
    .filter(o => !!o.key);
}

export function formatOptionsText(options: FieldOption[] | undefined | null): string {
  return (options ?? []).map(o => (o.key === o.label ? o.key : `${o.key}|${o.label}`)).join('\n');
}

/**
 * Dependent option map text:
 * ```
 * parentValue:
 * optKey|Opt Label
 * otherKey|Other
 *
 * otherParent:
 * ...
 * ```
 */
export function parseDependentOptionsText(raw: string, dependsOnKey: string): DependentOptions | null {
  const key = dependsOnKey.trim();
  if (!key || !raw.trim()) return null;

  const optionMap: Record<string, FieldOption[]> = {};
  let current: string | null = null;

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.endsWith(':') && !trimmed.includes('|')) {
      current = trimmed.slice(0, -1).trim();
      if (current && !optionMap[current]) optionMap[current] = [];
      continue;
    }
    if (!current) continue;
    const opts = parseOptionsText(trimmed);
    optionMap[current].push(...opts);
  }

  return Object.keys(optionMap).length ? { dependsOnKey: key, optionMap } : null;
}

export function formatDependentOptionsText(dep: DependentOptions | null | undefined): string {
  if (!dep?.optionMap) return '';
  const blocks: string[] = [];
  for (const [parent, opts] of Object.entries(dep.optionMap)) {
    blocks.push(`${parent}:`);
    blocks.push(formatOptionsText(opts));
  }
  return blocks.join('\n');
}

export function parseConditionValue(operator: string, raw: string): unknown {
  const text = raw.trim();
  if (operator === 'in' || operator === 'not_in') {
    return text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
  }
  return text;
}

export function formatConditionValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(', ');
  if (value == null) return '';
  return String(value);
}

export function emptyCondition(): FieldCondition {
  return { dependsOnKey: '', operator: 'equals', value: '' };
}
