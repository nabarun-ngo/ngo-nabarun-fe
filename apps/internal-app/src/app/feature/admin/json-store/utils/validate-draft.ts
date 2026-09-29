import type { DraftValidationState } from '../domain';
import { validateAgainstJsonSchema } from './ajv-validate';
import { isPlainObject, parseJsonText } from './parse-json';

export function validateDraft(
  draftText: string,
  savedText: string,
  jsonSchema: Record<string, unknown> | null,
): DraftValidationState & { parsed?: Record<string, unknown> } {
  const dirty = draftText !== savedText;
  const parsed = parseJsonText(draftText);

  if (!parsed.ok) {
    return {
      parseOk: false,
      parseError: parsed.error,
      parseLine: parsed.line,
      schemaOk: false,
      schemaIssues: [],
      canSave: false,
    };
  }

  if (!isPlainObject(parsed.value)) {
    return {
      parseOk: false,
      parseError: 'Payload must be a JSON object.',
      parseLine: 1,
      schemaOk: false,
      schemaIssues: [],
      canSave: false,
    };
  }

  const schema = validateAgainstJsonSchema(jsonSchema, parsed.value, draftText);
  return {
    parseOk: true,
    schemaOk: schema.ok,
    schemaIssues: schema.issues,
    canSave: dirty && schema.ok,
    parsed: parsed.value,
  };
}

/** Minimal empty instance from a JSON Schema object (best-effort skeleton). */
export function skeletonFromJsonSchema(
  jsonSchema: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!jsonSchema || typeof jsonSchema !== 'object') return {};
  return buildSkeleton(jsonSchema);
}

function buildSkeleton(schema: Record<string, unknown>): Record<string, unknown> {
  const type = schema['type'];
  if (type === 'array') {
    return {};
  }
  if (type && type !== 'object') {
    return {};
  }

  const properties = schema['properties'] as Record<string, Record<string, unknown>> | undefined;
  const required = (schema['required'] as string[] | undefined) ?? [];
  if (!properties) return {};

  const out: Record<string, unknown> = {};
  const keys = required.length ? required : Object.keys(properties).slice(0, 8);
  for (const key of keys) {
    const prop = properties[key];
    if (!prop) continue;
    out[key] = defaultForProp(prop);
  }
  return out;
}

function defaultForProp(prop: Record<string, unknown>): unknown {
  if (prop['default'] !== undefined) return prop['default'];
  const type = prop['type'];
  if (type === 'string') return '';
  if (type === 'number' || type === 'integer') return 0;
  if (type === 'boolean') return false;
  if (type === 'array') return [];
  if (type === 'object' || prop['properties']) return buildSkeleton(prop);
  if (Array.isArray(prop['anyOf']) || Array.isArray(prop['oneOf'])) return null;
  return null;
}

export function draftDiffLines(saved: string, draft: string): {
  left: string[];
  right: string[];
} {
  return {
    left: saved.split(/\r?\n/),
    right: draft.split(/\r?\n/),
  };
}
