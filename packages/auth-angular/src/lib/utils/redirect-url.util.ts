/**
 * Returns url when it is a safe same-app relative path; otherwise fallback.
 * Rejects protocol-relative paths (//), absolute URLs, and empty values.
 */
export function sanitizeInternalRedirectUrl(
  url: string | undefined | null,
  fallback: string,
): string {
  if (!url || typeof url !== 'string') {
    return fallback;
  }

  const trimmed = url.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback;
  }

  return trimmed;
}
