/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseListRemoteConfig } from '../../models/success-response-list-remote-config';

export interface Getconfig$Params {
}

export function getconfig(http: HttpClient, rootUrl: string, params?: Getconfig$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseListRemoteConfig>> {
  const rb = new RequestBuilder(rootUrl, getconfig.PATH, 'get');
  if (params) {
  }

  return http.request(
    rb.build({ responseType: 'blob', accept: '*/*', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseListRemoteConfig>;
    })
  );
}

getconfig.PATH = '/getconfig';
