/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { EventDetailUpdate } from '../../models/event-detail-update';
import { SuccessResponseEventDetail } from '../../models/success-response-event-detail';

export interface UpdateSocialEvent$Params {
  id: string;
      body: EventDetailUpdate
}

export function updateSocialEvent(http: HttpClient, rootUrl: string, params: UpdateSocialEvent$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseEventDetail>> {
  const rb = new RequestBuilder(rootUrl, updateSocialEvent.PATH, 'patch');
  if (params) {
    rb.path('id', params.id, {});
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

updateSocialEvent.PATH = '/api/socialevent/updateEvent/{id}';
