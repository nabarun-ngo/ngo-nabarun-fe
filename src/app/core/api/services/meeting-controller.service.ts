/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { authorizeAndCreateMeeting } from '../fn/meeting-controller/authorize-and-create-meeting';
import { AuthorizeAndCreateMeeting$Params } from '../fn/meeting-controller/authorize-and-create-meeting';
import { SuccessResponseMeetingDetail } from '../models/success-response-meeting-detail';

@Injectable({ providedIn: 'root' })
export class MeetingControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `authorizeAndCreateMeeting()` */
  static readonly AuthorizeAndCreateMeetingPath = '/api/meeting/createMeeting';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `authorizeAndCreateMeeting()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  authorizeAndCreateMeeting$Response(params: AuthorizeAndCreateMeeting$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseMeetingDetail>> {
    return authorizeAndCreateMeeting(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `authorizeAndCreateMeeting$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  authorizeAndCreateMeeting(params: AuthorizeAndCreateMeeting$Params, context?: HttpContext): Observable<SuccessResponseMeetingDetail> {
    return this.authorizeAndCreateMeeting$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseMeetingDetail>): SuccessResponseMeetingDetail => r.body)
    );
  }

}
