/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { createSocialEvent } from '../fn/event-controller/create-social-event';
import { CreateSocialEvent$Params } from '../fn/event-controller/create-social-event';
import { deleteEvent } from '../fn/event-controller/delete-event';
import { DeleteEvent$Params } from '../fn/event-controller/delete-event';
import { getDraftedEvent } from '../fn/event-controller/get-drafted-event';
import { GetDraftedEvent$Params } from '../fn/event-controller/get-drafted-event';
import { getSocialEvent } from '../fn/event-controller/get-social-event';
import { GetSocialEvent$Params } from '../fn/event-controller/get-social-event';
import { getSocialEventDocuments } from '../fn/event-controller/get-social-event-documents';
import { GetSocialEventDocuments$Params } from '../fn/event-controller/get-social-event-documents';
import { getSocialEvents } from '../fn/event-controller/get-social-events';
import { GetSocialEvents$Params } from '../fn/event-controller/get-social-events';
import { SuccessResponseEventDetail } from '../models/success-response-event-detail';
import { SuccessResponseListDocumentDetail } from '../models/success-response-list-document-detail';
import { SuccessResponsePaginateEventDetail } from '../models/success-response-paginate-event-detail';
import { SuccessResponseVoid } from '../models/success-response-void';
import { updateSocialEvent } from '../fn/event-controller/update-social-event';
import { UpdateSocialEvent$Params } from '../fn/event-controller/update-social-event';

@Injectable({ providedIn: 'root' })
export class EventControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `createSocialEvent()` */
  static readonly CreateSocialEventPath = '/api/socialevent/createEvent';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `createSocialEvent()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createSocialEvent$Response(params: CreateSocialEvent$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseEventDetail>> {
    return createSocialEvent(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `createSocialEvent$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createSocialEvent(params: CreateSocialEvent$Params, context?: HttpContext): Observable<SuccessResponseEventDetail> {
    return this.createSocialEvent$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseEventDetail>): SuccessResponseEventDetail => r.body)
    );
  }

  /** Path part for operation `updateSocialEvent()` */
  static readonly UpdateSocialEventPath = '/api/socialevent/updateEvent/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `updateSocialEvent()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateSocialEvent$Response(params: UpdateSocialEvent$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseEventDetail>> {
    return updateSocialEvent(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `updateSocialEvent$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateSocialEvent(params: UpdateSocialEvent$Params, context?: HttpContext): Observable<SuccessResponseEventDetail> {
    return this.updateSocialEvent$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseEventDetail>): SuccessResponseEventDetail => r.body)
    );
  }

  /** Path part for operation `getSocialEvents()` */
  static readonly GetSocialEventsPath = '/api/socialevent/getEvents';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getSocialEvents()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSocialEvents$Response(params?: GetSocialEvents$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateEventDetail>> {
    return getSocialEvents(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getSocialEvents$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSocialEvents(params?: GetSocialEvents$Params, context?: HttpContext): Observable<SuccessResponsePaginateEventDetail> {
    return this.getSocialEvents$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponsePaginateEventDetail>): SuccessResponsePaginateEventDetail => r.body)
    );
  }

  /** Path part for operation `getSocialEventDocuments()` */
  static readonly GetSocialEventDocumentsPath = '/api/socialevent/getEventDocuments/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getSocialEventDocuments()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSocialEventDocuments$Response(params: GetSocialEventDocuments$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseListDocumentDetail>> {
    return getSocialEventDocuments(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getSocialEventDocuments$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSocialEventDocuments(params: GetSocialEventDocuments$Params, context?: HttpContext): Observable<SuccessResponseListDocumentDetail> {
    return this.getSocialEventDocuments$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseListDocumentDetail>): SuccessResponseListDocumentDetail => r.body)
    );
  }

  /** Path part for operation `getSocialEvent()` */
  static readonly GetSocialEventPath = '/api/socialevent/getEvent/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getSocialEvent()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSocialEvent$Response(params: GetSocialEvent$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseEventDetail>> {
    return getSocialEvent(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getSocialEvent$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSocialEvent(params: GetSocialEvent$Params, context?: HttpContext): Observable<SuccessResponseEventDetail> {
    return this.getSocialEvent$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseEventDetail>): SuccessResponseEventDetail => r.body)
    );
  }

  /** Path part for operation `getDraftedEvent()` */
  static readonly GetDraftedEventPath = '/api/socialevent/getDraftedEvent';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getDraftedEvent()` instead.
   *
   * This method doesn't expect any request body.
   */
  getDraftedEvent$Response(params?: GetDraftedEvent$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseEventDetail>> {
    return getDraftedEvent(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getDraftedEvent$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getDraftedEvent(params?: GetDraftedEvent$Params, context?: HttpContext): Observable<SuccessResponseEventDetail> {
    return this.getDraftedEvent$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseEventDetail>): SuccessResponseEventDetail => r.body)
    );
  }

  /** Path part for operation `deleteEvent()` */
  static readonly DeleteEventPath = '/api/socialevent/deleteEvent/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteEvent()` instead.
   *
   * This method doesn't expect any request body.
   */
  deleteEvent$Response(params: DeleteEvent$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
    return deleteEvent(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteEvent$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  deleteEvent(params: DeleteEvent$Params, context?: HttpContext): Observable<SuccessResponseVoid> {
    return this.deleteEvent$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseVoid>): SuccessResponseVoid => r.body)
    );
  }

}
