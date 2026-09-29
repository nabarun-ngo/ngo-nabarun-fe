import type { ValidationIssue } from '../domain';
import { findLineForPath } from './parse-json';

/**
 * Parse server JSON_DOCUMENT_INVALID messages.
 * Contract: `Payload validation failed for ns/key: path: message; path: message`
 */
export function parseServerValidationMessage(
  message: string,
  jsonText?: string,
): ValidationIssue[] {
  if (!message) return [];

  const colonIdx = message.indexOf(': ');
  const body = colonIdx >= 0 && /Payload validation failed/i.test(message)
    ? message.slice(colonIdx + 2)
    : message;

  const parts = body.split(';').map(p => p.trim()).filter(Boolean);
  const issues: ValidationIssue[] = [];

  for (const part of parts) {
    const sep = part.indexOf(': ');
    if (sep < 0) {
      issues.push({
        path: 'root',
        message: part,
        line: jsonText ? 1 : undefined,
      });
      continue;
    }
    const path = part.slice(0, sep).trim() || 'root';
    const msg = part.slice(sep + 2).trim();
    issues.push({
      path,
      message: msg,
      line: jsonText ? findLineForPath(jsonText, path) : undefined,
    });
  }

  return issues;
}

export function extractErrorMessages(err: unknown): string {
  const http = err as {
    error?: { messages?: string[]; message?: string };
    message?: string;
  };
  if (http?.error?.messages?.length) {
    return http.error.messages.join('; ');
  }
  if (typeof http?.error?.message === 'string') return http.error.message;
  if (err instanceof Error) return err.message;
  return 'Request failed';
}
