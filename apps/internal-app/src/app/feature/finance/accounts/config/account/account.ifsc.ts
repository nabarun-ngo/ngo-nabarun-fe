import type { FormValues } from '@nabarun-ngo/forms-core';
import type { CfFormComponent } from '@nabarun-ngo/forms-angular';
import { Observable } from 'rxjs';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import type { IfscDetails } from '../../domain';

export const IFSC_FIELD_KEY = 'IFSCNumber';

const IFSC_FORMAT = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const IFSC_VALIDATION_RULE = {
  pattern: '^[A-Za-z]{4}0[A-Za-z0-9]{6}$',
  regexErrMsg: 'Enter a valid 11-character IFSC code',
};

export const IFSC_NOT_FOUND_MESSAGE = 'Invalid IFSC code';

export function normalizeIfsc(value: unknown): string {
  return String(value ?? '').trim().toUpperCase();
}

export function isValidIfscFormat(value: unknown): boolean {
  const normalized = normalizeIfsc(value);
  return normalized.length === 11 && IFSC_FORMAT.test(normalized);
}

export function resolveIfscInlineError(ifsc: string, lookupError?: string): string | undefined {
  if (lookupError) {
    return lookupError;
  }
  if (!ifsc || isValidIfscFormat(ifsc)) {
    return undefined;
  }
  if (ifsc.length >= 11) {
    return IFSC_VALIDATION_RULE.regexErrMsg;
  }
  return undefined;
}

export function isIfscLookupResultValid(details: IfscDetails | null | undefined): boolean {
  return Boolean(
    details?.ifsc?.trim()
    && String(details.bankName ?? '').trim()
    && String(details.branch ?? '').trim(),
  );
}

export function showIfscNotFoundError(form: CfFormComponent | undefined, ifsc: string): void {
  syncIfscFieldError(form, ifsc, IFSC_NOT_FOUND_MESSAGE);
}

const IFSC_ERROR_PATTERNS = [
  /ifsc/i,
  /bank name/i,
  /bank branch/i,
];

function extractErrorMessages(error: unknown): string[] {
  if (!error || typeof error !== 'object') {
    return [];
  }

  const messages: string[] = [];
  const body = 'error' in error
    ? (error as { error?: { messages?: string[]; message?: string; errorCode?: string } | string }).error
    : undefined;

  if (typeof body === 'string' && body.trim()) {
    messages.push(body.trim());
  } else if (body && typeof body === 'object') {
    if (Array.isArray(body.messages)) {
      messages.push(...body.messages.filter((message): message is string => typeof message === 'string'));
    }
    if (typeof body.message === 'string' && body.message.trim()) {
      messages.push(body.message.trim());
    }
    if (typeof body.errorCode === 'string' && body.errorCode.trim()) {
      messages.push(body.errorCode.trim());
    }
  }

  if ('message' in error && typeof (error as Error).message === 'string' && (error as Error).message.trim()) {
    messages.push((error as Error).message.trim());
  }

  return messages;
}

export function resolveIfscSubmitError(error: unknown): string | undefined {
  const status = error && typeof error === 'object' && 'status' in error
    ? Number((error as { status?: number }).status)
    : undefined;
  const messages = extractErrorMessages(error);

  if (status === 404) {
    return IFSC_NOT_FOUND_MESSAGE;
  }

  if (messages.some(message => IFSC_ERROR_PATTERNS.some(pattern => pattern.test(message)))) {
    return IFSC_NOT_FOUND_MESSAGE;
  }

  return undefined;
}

export function syncIfscFieldError(
  form: CfFormComponent | undefined,
  ifsc: string,
  lookupError?: string,
): void {
  if (!form) {
    return;
  }
  const message = resolveIfscInlineError(ifsc, lookupError);
  if (message) {
    form.setFieldError(IFSC_FIELD_KEY, message);
  } else {
    form.clearFieldError(IFSC_FIELD_KEY);
  }
}

export function buildIfscConfirmDescription(details: IfscDetails): string {
  return `IFSC: ${details.ifsc}\n\nBank Name: ${details.bankName}\nBank Branch: ${details.branch}`;
}

export function confirmIfscDetails(
  modalService: ModalService,
  details: IfscDetails,
  options?: { title?: string; acceptButtonText?: string; declineButtonText?: string },
): Observable<boolean> {
  return new Observable<boolean>(observer => {
    const modal = modalService.openNotificationModal(
      {
        title: options?.title ?? 'Confirm bank details',
        description: buildIfscConfirmDescription(details),
      },
      'confirmation',
      'info',
      {
        acceptButtonText: options?.acceptButtonText ?? 'Confirm',
        declineButtonText: options?.declineButtonText ?? 'Cancel',
      },
    );

    const acceptSub = modal.onAccept$.subscribe(() => {
      observer.next(true);
      observer.complete();
    });
    const declineSub = modal.onDecline$.subscribe(() => {
      observer.next(false);
      observer.complete();
    });

    return () => {
      acceptSub.unsubscribe();
      declineSub.unsubscribe();
    };
  });
}

export function needsIfscLookupOnSubmit(accountType: string | undefined, values: FormValues): boolean {
  if (accountType === 'BANK') {
    return true;
  }
  if (accountType === 'WALLET') {
    return normalizeIfsc(values[IFSC_FIELD_KEY]).length > 0;
  }
  return false;
}
