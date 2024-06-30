/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { EventDetailCreate } from '../../models/event-detail-create';
import { SuccessResponseEventDetail } from '../../models/success-response-event-detail';

export interface CreateSocialEvent$Params {
      body: EventDetailCreate
}

export function createSocialEvent(http: HttpClient, rootUrl: string, params: CreateSocialEvent$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseEventDetail>> {
  const rb = new RequestBuilder(rootUrl, createSocialEvent.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
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

createSocialEvent.PATH = '/api/socialevent/createEvent';
