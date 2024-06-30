/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { MeetingDetailCreate } from '../../models/meeting-detail-create';
import { SuccessResponseMeetingDetail } from '../../models/success-response-meeting-detail';

export interface AuthorizeAndCreateMeeting$Params {
      body: MeetingDetailCreate
}

export function authorizeAndCreateMeeting(http: HttpClient, rootUrl: string, params: AuthorizeAndCreateMeeting$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseMeetingDetail>> {
  const rb = new RequestBuilder(rootUrl, authorizeAndCreateMeeting.PATH, 'post');
  if (params) {
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<SuccessResponseMeetingDetail>;
    })
  );
}

authorizeAndCreateMeeting.PATH = '/api/meeting/createMeeting';
