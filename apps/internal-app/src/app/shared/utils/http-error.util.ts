import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import type { ListDashboardNotification } from '@nabarun-ngo/list-dashboard-angular';
import { AppErrorHandler } from 'src/app/core/error/app-error.handler';
import { ModalService } from 'src/app/core/shell/service/modal.service';

/** True for HTTP failures that the global handler may show (not 401/403). */
export function isClaimableHttpError(error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse)) {
    return false;
  }
  return error.status !== HttpStatusCode.Unauthorized
    && error.status !== HttpStatusCode.Forbidden;
}

/** Mark an HTTP failure as handled by feature UI so the global modal is skipped. */
export function claimHttpError(error: unknown): void {
  AppErrorHandler.instance?.claimHttpError(error);
}

/**
 * Feature-level error modal: claims HTTP errors (skips global), then shows content.
 */
export function notifyFeatureError(
  modalService: ModalService,
  error: unknown,
  content: { title: string; description: string },
): void {
  claimHttpError(error);

  const description = error instanceof Error && error.message.trim()
    ? error.message
    : content.description;

  modalService.openNotificationModal(
    { title: content.title, description },
    'notification',
    'error',
  );
}

/**
 * @deprecated Prefer {@link notifyFeatureError}. Same claim+show behavior for feature UI.
 */
export function notifyClientError(
  modalService: ModalService,
  error: unknown,
  content: { title: string; description: string },
): void {
  notifyFeatureError(modalService, error, content);
}

/**
 * List-dashboard notification bridge: claims HTTP errors so feature titles win
 * over the deferred global fallback.
 */
export function handleListNotification(
  modalService: ModalService,
  notification: ListDashboardNotification,
  titles: { error: string; success: string },
): void {
  if (notification.level === 'error') {
    claimHttpError(notification.error);
    modalService.openNotificationModal({
      title: titles.error,
      description: notification.message,
    }, 'notification', 'error');
    return;
  }

  modalService.openNotificationModal({
    title: titles.success,
    description: notification.message,
  }, 'notification', notification.level === 'info' ? 'info' : 'success');
}
