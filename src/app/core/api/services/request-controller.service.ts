/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { createRequest } from '../fn/request-controller/create-request';
import { CreateRequest$Params } from '../fn/request-controller/create-request';
import { getMyRequests } from '../fn/request-controller/get-my-requests';
import { GetMyRequests$Params } from '../fn/request-controller/get-my-requests';
import { getMyWorkItems } from '../fn/request-controller/get-my-work-items';
import { GetMyWorkItems$Params } from '../fn/request-controller/get-my-work-items';
import { getRequestDetail } from '../fn/request-controller/get-request-detail';
import { GetRequestDetail$Params } from '../fn/request-controller/get-request-detail';
import { getWorkItems } from '../fn/request-controller/get-work-items';
import { GetWorkItems$Params } from '../fn/request-controller/get-work-items';
import { SuccessResponseListWorkDetail } from '../models/success-response-list-work-detail';
import { SuccessResponsePaginateRequestDetail } from '../models/success-response-paginate-request-detail';
import { SuccessResponsePaginateWorkDetail } from '../models/success-response-paginate-work-detail';
import { SuccessResponseRequestDetail } from '../models/success-response-request-detail';
import { SuccessResponseWorkDetail } from '../models/success-response-work-detail';
import { updateRequest } from '../fn/request-controller/update-request';
import { UpdateRequest$Params } from '../fn/request-controller/update-request';
import { updateWorkItem } from '../fn/request-controller/update-work-item';
import { UpdateWorkItem$Params } from '../fn/request-controller/update-work-item';

@Injectable({ providedIn: 'root' })
export class RequestControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `createRequest()` */
  static readonly CreateRequestPath = '/api/request/createRequest';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `createRequest()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createRequest$Response(params: CreateRequest$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseRequestDetail>> {
    return createRequest(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `createRequest$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createRequest(params: CreateRequest$Params, context?: HttpContext): Observable<SuccessResponseRequestDetail> {
    return this.createRequest$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseRequestDetail>): SuccessResponseRequestDetail => r.body)
    );
  }

  /** Path part for operation `updateWorkItem()` */
  static readonly UpdateWorkItemPath = '/api/request/updateWorkItem/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `updateWorkItem()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateWorkItem$Response(params: UpdateWorkItem$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseWorkDetail>> {
    return updateWorkItem(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `updateWorkItem$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateWorkItem(params: UpdateWorkItem$Params, context?: HttpContext): Observable<SuccessResponseWorkDetail> {
    return this.updateWorkItem$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseWorkDetail>): SuccessResponseWorkDetail => r.body)
    );
  }

  /** Path part for operation `updateRequest()` */
  static readonly UpdateRequestPath = '/api/request/updateRequest/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `updateRequest()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateRequest$Response(params: UpdateRequest$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseRequestDetail>> {
    return updateRequest(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `updateRequest$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateRequest(params: UpdateRequest$Params, context?: HttpContext): Observable<SuccessResponseRequestDetail> {
    return this.updateRequest$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseRequestDetail>): SuccessResponseRequestDetail => r.body)
    );
  }

  /** Path part for operation `getWorkItems()` */
  static readonly GetWorkItemsPath = '/api/request/{id}/getWorkItems';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getWorkItems()` instead.
   *
   * This method doesn't expect any request body.
   */
  getWorkItems$Response(params: GetWorkItems$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseListWorkDetail>> {
    return getWorkItems(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getWorkItems$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getWorkItems(params: GetWorkItems$Params, context?: HttpContext): Observable<SuccessResponseListWorkDetail> {
    return this.getWorkItems$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseListWorkDetail>): SuccessResponseListWorkDetail => r.body)
    );
  }

  /** Path part for operation `getRequestDetail()` */
  static readonly GetRequestDetailPath = '/api/request/getRequest/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getRequestDetail()` instead.
   *
   * This method doesn't expect any request body.
   */
  getRequestDetail$Response(params: GetRequestDetail$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseRequestDetail>> {
    return getRequestDetail(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getRequestDetail$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getRequestDetail(params: GetRequestDetail$Params, context?: HttpContext): Observable<SuccessResponseRequestDetail> {
    return this.getRequestDetail$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseRequestDetail>): SuccessResponseRequestDetail => r.body)
    );
  }

  /** Path part for operation `getMyWorkItems()` */
  static readonly GetMyWorkItemsPath = '/api/request/getMyWorkItems';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getMyWorkItems()` instead.
   *
   * This method doesn't expect any request body.
   */
  getMyWorkItems$Response(params: GetMyWorkItems$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateWorkDetail>> {
    return getMyWorkItems(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getMyWorkItems$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getMyWorkItems(params: GetMyWorkItems$Params, context?: HttpContext): Observable<SuccessResponsePaginateWorkDetail> {
    return this.getMyWorkItems$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponsePaginateWorkDetail>): SuccessResponsePaginateWorkDetail => r.body)
    );
  }

  /** Path part for operation `getMyRequests()` */
  static readonly GetMyRequestsPath = '/api/request/getMyRequests';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getMyRequests()` instead.
   *
   * This method doesn't expect any request body.
   */
  getMyRequests$Response(params: GetMyRequests$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateRequestDetail>> {
    return getMyRequests(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getMyRequests$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getMyRequests(params: GetMyRequests$Params, context?: HttpContext): Observable<SuccessResponsePaginateRequestDetail> {
    return this.getMyRequests$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponsePaginateRequestDetail>): SuccessResponsePaginateRequestDetail => r.body)
    );
  }

}
