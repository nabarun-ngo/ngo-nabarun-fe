import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpStatusCode,
} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppErrorHandler } from '../error/app-error.handler';
import { IUserIdentityService } from '../auth/tokens/user-identity.token';

/**
 * Slim HTTP interceptor: logs out on 401 and schedules global error UI
 * unless the request opts out with `hideError` or a feature claims the error.
 */
@Injectable()
export class HttpErrorIntercepterService implements HttpInterceptor {
  constructor(
    private readonly appErrorHandler: AppErrorHandler,
    @Inject(IUserIdentityService) private readonly identityService: IUserIdentityService,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const scheduleGlobal = request.headers.get('hideError') == null;

    return next.handle(request).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === HttpStatusCode.Unauthorized) {
            this.identityService.logout();
            return throwError(() => error);
          }
          if (error.status === HttpStatusCode.Forbidden) {
            return throwError(() => error);
          }
          if (scheduleGlobal) {
            this.appErrorHandler.scheduleHttpError(error);
          }
        }
        return throwError(() => error);
      }),
    );
  }
}
