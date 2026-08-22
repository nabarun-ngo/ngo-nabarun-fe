import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { RouteHttpBusyService } from '../shell/service/route-http-busy.service';
import { SKIP_ROUTE_HTTP_BUSY } from './route-http-busy.context';

/**
 * Counts HttpClient requests only while a router navigation is in progress.
 * In-page loads (lists, saves, detail fetches) do not raise the route spinner.
 */
@Injectable()
export class RouteHttpBusyInterceptor implements HttpInterceptor {
  private readonly busy = inject(RouteHttpBusyService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.context.get(SKIP_ROUTE_HTTP_BUSY)) {
      return next.handle(request);
    }

    const tracked = this.busy.beginRequest();
    return next.handle(request).pipe(
      finalize(() => this.busy.endRequest(tracked)),
    );
  }
}
