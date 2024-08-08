/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { SuccessResponsePaginateEventDetail } from '../../models/success-response-paginate-event-detail';

export interface GetSocialEvents$Params {
  pageIndex?: number;
  pageSize?: number;
  filter?: string;
  'X-Cloud-Trace-Context'?: string;
}

export function getSocialEvents(http: HttpClient, rootUrl: string, params?: GetSocialEvents$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateEventDetail>> {
  const rb = new RequestBuilder(rootUrl, getSocialEvents.PATH, 'get');
  if (params) {
    rb.query('pageIndex', params.pageIndex, {});
    rb.query('pageSize', params.pageSize, {});
    rb.query('filter', params.filter, {});
    rb.header('X-Cloud-Trace-Context', params['X-Cloud-Trace-Context'], {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponsePaginateEventDetail>;
    })
  );
}

getSocialEvents.PATH = '/api/socialevent/getEvents';
