/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { EmailOrPasswordUpdate } from '../../models/email-or-password-update';
import { SuccessResponseVoid } from '../../models/success-response-void';

export interface ChangeEmail$Params {
  'X-Correlation-Id'?: string;
      body: EmailOrPasswordUpdate
}

export function changeEmail(http: HttpClient, rootUrl: string, params: ChangeEmail$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
  const rb = new RequestBuilder(rootUrl, changeEmail.PATH, 'post');
  if (params) {
    rb.header('X-Correlation-Id', params['X-Correlation-Id'], {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseVoid>;
    })
  );
}

changeEmail.PATH = '/api/user/changeEmail';
