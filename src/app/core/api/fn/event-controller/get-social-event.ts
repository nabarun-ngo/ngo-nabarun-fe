/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseEventDetail } from '../../models/success-response-event-detail';

export interface GetSocialEvent$Params {
  id: string;
}

export function getSocialEvent(http: HttpClient, rootUrl: string, params: GetSocialEvent$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseEventDetail>> {
  const rb = new RequestBuilder(rootUrl, getSocialEvent.PATH, 'get');
  if (params) {
    rb.path('id', params.id, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseEventDetail>;
    })
  );
}

getSocialEvent.PATH = '/api/socialevent/getEvent/{id}';
