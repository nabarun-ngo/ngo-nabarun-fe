/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponseEventDetail } from '../../models/success-response-event-detail';

export interface GetDraftedEvent$Params {
  'Correlation-Id'?: string;
}

export function getDraftedEvent(http: HttpClient, rootUrl: string, params?: GetDraftedEvent$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseEventDetail>> {
  const rb = new RequestBuilder(rootUrl, getDraftedEvent.PATH, 'get');
  if (params) {
    rb.header('Correlation-Id', params['Correlation-Id'], {});
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

getDraftedEvent.PATH = '/api/socialevent/getDraftedEvent';
