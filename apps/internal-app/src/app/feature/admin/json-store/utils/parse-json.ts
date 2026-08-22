export interface ParseJsonResult {
  ok: boolean;
  value?: unknown;
  error?: string;
  line?: number;
}

/** Parse JSON text; approximate error line from the native SyntaxError message when possible. */
export function parseJsonText(text: string): ParseJsonResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: true, value: {} };
  }
  try {
    return { ok: true, value: JSON.parse(trimmed) as unknown };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Invalid JSON';
    const lineMatch = /position\s+(\d+)/i.exec(message)
      ?? /line\s+(\d+)/i.exec(message);
    let line: number | undefined;
    if (lineMatch) {
      const posOrLine = Number(lineMatch[1]);
      if (/position/i.test(lineMatch[0])) {
        line = positionToLine(trimmed, posOrLine);
      } else {
        line = posOrLine;
      }
    }
    return { ok: false, error: message, line };
  }
}

export function stringifyPretty(value: unknown): string {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return '{}';
  }
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function positionToLine(text: string, position: number): number {
  const slice = text.slice(0, Math.max(0, position));
  return slice.split(/\r?\n/).length;
}

/** Approximate first line that mentions a dotted JSON path (best-effort). */
export function findLineForPath(jsonText: string, path: string): number | undefined {
  if (!path || path === 'root') return 1;
  const segments = path.split('.').filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return undefined;
  const key = last.replace(/^\d+$/, '');
  const needle = key ? `"${key}"` : undefined;
  if (!needle) return undefined;
  const lines = jsonText.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(needle)) return i + 1;
  }
  return undefined;
}
