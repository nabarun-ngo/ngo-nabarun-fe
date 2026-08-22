import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import type { ErrorObject } from 'ajv';
import type { ValidationIssue } from '../domain';
import { findLineForPath } from './parse-json';

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
  validateSchema: false,
});
// ajv-formats typings target Ajv core; Ajv2020 is compatible at runtime.
addFormats(ajv as unknown as Parameters<typeof addFormats>[0]);

export function validateAgainstJsonSchema(
  jsonSchema: Record<string, unknown> | null | undefined,
  payload: unknown,
  jsonText?: string,
): { ok: boolean; issues: ValidationIssue[] } {
  if (!jsonSchema) {
    return { ok: true, issues: [] };
  }

  let validate;
  try {
    validate = ajv.compile(jsonSchema);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid JSON Schema from server';
    return { ok: false, issues: [{ path: 'root', message }] };
  }

  const ok = validate(payload);
  if (ok) return { ok: true, issues: [] };

  const issues = (validate.errors ?? []).map((err: ErrorObject) => {
    const path = instancePathToDotted(err.instancePath)
      || (typeof err.params?.['missingProperty'] === 'string'
        ? String(err.params['missingProperty'])
        : 'root');
    const message = err.message ?? 'Validation failed';
    const dotted = String(path);
    return {
      path: dotted,
      message,
      line: jsonText ? findLineForPath(jsonText, dotted) : undefined,
    } satisfies ValidationIssue;
  });

  return { ok: false, issues };
}

function instancePathToDotted(instancePath: string): string {
  if (!instancePath || instancePath === '/') return 'root';
  return instancePath
    .replace(/^\//, '')
    .split('/')
    .map(decodeURIComponent)
    .join('.');
}
