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

import { createNotice } from '../fn/notice-controller/create-notice';
import { CreateNotice$Params } from '../fn/notice-controller/create-notice';
import { getAllNotice } from '../fn/notice-controller/get-all-notice';
import { GetAllNotice$Params } from '../fn/notice-controller/get-all-notice';
import { getDraftedNotice } from '../fn/notice-controller/get-drafted-notice';
import { GetDraftedNotice$Params } from '../fn/notice-controller/get-drafted-notice';
import { getNotice } from '../fn/notice-controller/get-notice';
import { GetNotice$Params } from '../fn/notice-controller/get-notice';
import { SuccessResponseNoticeDetail } from '../models/success-response-notice-detail';
import { SuccessResponsePaginateNoticeDetail } from '../models/success-response-paginate-notice-detail';
import { updateNotice } from '../fn/notice-controller/update-notice';
import { UpdateNotice$Params } from '../fn/notice-controller/update-notice';

@Injectable({ providedIn: 'root' })
export class NoticeControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `createNotice()` */
  static readonly CreateNoticePath = '/api/notice/create';

  /**
   * Create a new notice.
   *
   * Authorities : hasAuthority('SCOPE_create:notice')
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `createNotice()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createNotice$Response(params: CreateNotice$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseNoticeDetail>> {
    return createNotice(this.http, this.rootUrl, params, context);
  }

  /**
   * Create a new notice.
   *
   * Authorities : hasAuthority('SCOPE_create:notice')
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `createNotice$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createNotice(params: CreateNotice$Params, context?: HttpContext): Observable<SuccessResponseNoticeDetail> {
    return this.createNotice$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseNoticeDetail>): SuccessResponseNoticeDetail => r.body)
    );
  }

  /** Path part for operation `updateNotice()` */
  static readonly UpdateNoticePath = '/api/notice/{id}/update';

  /**
   * Update a specific notice.
   *
   * Authorities : hasAuthority('SCOPE_update:notice')
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `updateNotice()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateNotice$Response(params: UpdateNotice$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseNoticeDetail>> {
    return updateNotice(this.http, this.rootUrl, params, context);
  }

  /**
   * Update a specific notice.
   *
   * Authorities : hasAuthority('SCOPE_update:notice')
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `updateNotice$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateNotice(params: UpdateNotice$Params, context?: HttpContext): Observable<SuccessResponseNoticeDetail> {
    return this.updateNotice$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseNoticeDetail>): SuccessResponseNoticeDetail => r.body)
    );
  }

  /** Path part for operation `getNotice()` */
  static readonly GetNoticePath = '/api/notice/{id}';

  /**
   * Retrieve details of a specific notice.
   *
   * Authorities : hasAuthority('SCOPE_read:notice')
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getNotice()` instead.
   *
   * This method doesn't expect any request body.
   */
  getNotice$Response(params: GetNotice$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseNoticeDetail>> {
    return getNotice(this.http, this.rootUrl, params, context);
  }

  /**
   * Retrieve details of a specific notice.
   *
   * Authorities : hasAuthority('SCOPE_read:notice')
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getNotice$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getNotice(params: GetNotice$Params, context?: HttpContext): Observable<SuccessResponseNoticeDetail> {
    return this.getNotice$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseNoticeDetail>): SuccessResponseNoticeDetail => r.body)
    );
  }

  /** Path part for operation `getAllNotice()` */
  static readonly GetAllNoticePath = '/api/notice/list';

  /**
   * Retrieve notice list.
   *
   * Authorities : hasAuthority('SCOPE_read:notices')
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAllNotice()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllNotice$Response(params: GetAllNotice$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateNoticeDetail>> {
    return getAllNotice(this.http, this.rootUrl, params, context);
  }

  /**
   * Retrieve notice list.
   *
   * Authorities : hasAuthority('SCOPE_read:notices')
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getAllNotice$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllNotice(params: GetAllNotice$Params, context?: HttpContext): Observable<SuccessResponsePaginateNoticeDetail> {
    return this.getAllNotice$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponsePaginateNoticeDetail>): SuccessResponsePaginateNoticeDetail => r.body)
    );
  }

  /** Path part for operation `getDraftedNotice()` */
  static readonly GetDraftedNoticePath = '/api/notice/getDraftedNotice';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getDraftedNotice()` instead.
   *
   * This method doesn't expect any request body.
   *
   * @deprecated
   */
  getDraftedNotice$Response(params?: GetDraftedNotice$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseNoticeDetail>> {
    return getDraftedNotice(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getDraftedNotice$Response()` instead.
   *
   * This method doesn't expect any request body.
   *
   * @deprecated
   */
  getDraftedNotice(params?: GetDraftedNotice$Params, context?: HttpContext): Observable<SuccessResponseNoticeDetail> {
    return this.getDraftedNotice$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseNoticeDetail>): SuccessResponseNoticeDetail => r.body)
    );
  }

}
