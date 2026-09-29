import { ErrorHandler, Injectable } from '@angular/core';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { ModalService } from '../shell/service/modal.service';
import { ErrorResponse } from '../api/api-client/models/error-response';

/**
 * Global error UI with feature-first override:
 * features call {@link claimHttpError} before showing their own modal;
 * otherwise a deferred global HTTP modal is shown.
 */
@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private static current: AppErrorHandler | null = null;

  private readonly claimed = new WeakSet<object>();

  constructor(private readonly modalService: ModalService) {
    AppErrorHandler.current = this;
  }

  static get instance(): AppErrorHandler | null {
    return AppErrorHandler.current;
  }

  handleError(error: unknown): void {
    const http = unwrapHttpError(error);
    if (http) {
      this.scheduleHttpError(http);
      return;
    }
    console.error(error);
  }

  /** Mark an HTTP failure as handled by feature-level UI (skips global modal). */
  claimHttpError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      this.claimed.add(error);
    }
  }

  /**
   * Schedule global API error UI after the current turn so feature
   * subscribe/error handlers can claim first.
   */
  scheduleHttpError(error: HttpErrorResponse): void {
    if (
      error.status === HttpStatusCode.Unauthorized
      || error.status === HttpStatusCode.Forbidden
    ) {
      return;
    }

    queueMicrotask(() => {
      if (this.claimed.has(error)) {
        return;
      }
      this.showHttpError(error);
    });
  }

  showHttpError(error: HttpErrorResponse): void {
    const body = isRecord(error.error) ? (error.error as Partial<ErrorResponse>) : null;
    let message: string;
    let heading = 'Error';

    if (body?.messages?.length) {
      message = body.messages.join(', ');
      heading = body.info ?? 'Error';
    } else {
      message = 'Something went wrong.';
    }

    const traceId = readTraceId(error);
    // Anything already visible in the description stays out of "More details".
    const serverDetails = readServerDetails(error).filter(line => !message.includes(line));

    this.modalService.openNotificationModal(
      { title: heading, description: message },
      'notification',
      'error',
      {
        okayButtonText: 'Close',
        moreDetails: serverDetails.length ? serverDetails.join('\n') : undefined,
        copyableRefIds: traceId ? [traceId] : [],
        copyableRefsLabel: 'Trace ID',
      },
    );
  }
}

const MAX_DETAIL_LENGTH = 600;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Trace id from the error payload, falling back to the header set on every API response. */
function readTraceId(error: HttpErrorResponse): string | undefined {
  const body = isRecord(error.error) ? error.error : null;
  const fromBody = typeof body?.['traceId'] === 'string' ? (body['traceId'] as string) : undefined;
  return fromBody?.trim() || error.headers?.get('x-trace-id')?.trim() || undefined;
}

/**
 * Whatever text the server sent, regardless of payload shape, so support can read
 * the raw failure even when the description falls back to a generic message.
 */
function readServerDetails(error: HttpErrorResponse): string[] {
  const body = error.error;
  const lines: string[] = [];

  if (typeof body === 'string') {
    lines.push(body);
  } else if (isRecord(body)) {
    lines.push(...toLines(body['messages']), ...toLines(body['message']), ...toLines(body['error']));
  }

  if (!lines.length && error.message) {
    lines.push(error.message);
  }

  return [...new Set(lines.map(line => truncate(line)))];
}

function toLines(value: unknown): string[] {
  if (typeof value === 'string') {
    return value.trim() ? [value.trim()] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap(item => toLines(item));
  }
  if (isRecord(value)) {
    return [JSON.stringify(value)];
  }
  return [];
}

function truncate(value: string): string {
  return value.length > MAX_DETAIL_LENGTH ? `${value.slice(0, MAX_DETAIL_LENGTH)}…` : value;
}

function unwrapHttpError(error: unknown): HttpErrorResponse | null {
  if (error instanceof HttpErrorResponse) {
    return error;
  }
  if (error && typeof error === 'object' && 'rejection' in error) {
    const rejection = (error as { rejection: unknown }).rejection;
    if (rejection instanceof HttpErrorResponse) {
      return rejection;
    }
  }
  return null;
}
