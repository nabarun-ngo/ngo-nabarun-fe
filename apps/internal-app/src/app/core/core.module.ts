import { ErrorHandler, NgModule, Optional, Provider, SkipSelf } from '@angular/core';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { AuthHttpInterceptor } from '@auth0/auth0-angular';
import { HttpErrorIntercepterService } from './intercepter/http-error-intercepter.service';
import { RouteHttpBusyInterceptor } from './intercepter/route-http-busy.interceptor';
import { AppErrorHandler } from './error/app-error.handler';
import { CoreAuthModule } from './auth/core-auth.module';
import { CoreApiModule } from './api/core-api.module';
import { ShellModule } from './shell/shell.module';
import { BYPASS_AUTH } from '../../environments/environment';
import { provideDashboardMetricsSource } from '../feature/dashboard/data/dashboard-metrics.providers';
import { DevModeService } from './dev-mode/dev-mode.service';
import { NotificationService } from './shell/service/notification.service';
import { INotificationService } from './shell/tokens/notification.token';

function provideNotifications(): Provider[] {
  if (BYPASS_AUTH) {
    return [
      { provide: INotificationService, useExisting: DevModeService },
    ];
  }

  return [
    { provide: INotificationService, useExisting: NotificationService },
  ];
}

@NgModule({
  imports: [
    CoreAuthModule,
    CoreApiModule,
    ShellModule,
  ],
  providers: [
    ...provideDashboardMetricsSource(),
    ...provideNotifications(),
    AppErrorHandler,
    { provide: ErrorHandler, useExisting: AppErrorHandler },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorIntercepterService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RouteHttpBusyInterceptor,
      multi: true,
    },
    ...(BYPASS_AUTH ? [] : [{
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHttpInterceptor,
      multi: true,
    }]),
    provideHttpClient(
      withInterceptorsFromDi(),
    ),
  ],
  exports: [ShellModule],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}
