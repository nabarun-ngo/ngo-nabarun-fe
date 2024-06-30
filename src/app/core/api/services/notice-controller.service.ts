/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { createNotice } from '../fn/notice-controller/create-notice';
import { CreateNotice$Params } from '../fn/notice-controller/create-notice';
import { deleteEvent1 } from '../fn/notice-controller/delete-event-1';
import { DeleteEvent1$Params } from '../fn/notice-controller/delete-event-1';
import { getAllNotice } from '../fn/notice-controller/get-all-notice';
import { GetAllNotice$Params } from '../fn/notice-controller/get-all-notice';
import { getDraftedNotice } from '../fn/notice-controller/get-drafted-notice';
import { GetDraftedNotice$Params } from '../fn/notice-controller/get-drafted-notice';
import { getNotice } from '../fn/notice-controller/get-notice';
import { GetNotice$Params } from '../fn/notice-controller/get-notice';
import { getNoticeDocuments } from '../fn/notice-controller/get-notice-documents';
import { GetNoticeDocuments$Params } from '../fn/notice-controller/get-notice-documents';
import { SuccessResponseListDocumentDetail } from '../models/success-response-list-document-detail';
import { SuccessResponseNoticeDetail } from '../models/success-response-notice-detail';
import { SuccessResponsePaginateNoticeDetail } from '../models/success-response-paginate-notice-detail';
import { SuccessResponseVoid } from '../models/success-response-void';
import { updateNotice } from '../fn/notice-controller/update-notice';
import { UpdateNotice$Params } from '../fn/notice-controller/update-notice';

@Injectable({ providedIn: 'root' })
export class NoticeControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `createNotice()` */
  static readonly CreateNoticePath = '/api/notice/createNotice';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `createNotice()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  createNotice$Response(params: CreateNotice$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseNoticeDetail>> {
    return createNotice(this.http, this.rootUrl, params, context);
  }

  /**
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
  static readonly UpdateNoticePath = '/api/notice/updateNotice/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `updateNotice()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateNotice$Response(params: UpdateNotice$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseNoticeDetail>> {
    return updateNotice(this.http, this.rootUrl, params, context);
  }

  /**
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

  /** Path part for operation `getAllNotice()` */
  static readonly GetAllNoticePath = '/api/notice/getNotices';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getAllNotice()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllNotice$Response(params?: GetAllNotice$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateNoticeDetail>> {
    return getAllNotice(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getAllNotice$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getAllNotice(params?: GetAllNotice$Params, context?: HttpContext): Observable<SuccessResponsePaginateNoticeDetail> {
    return this.getAllNotice$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponsePaginateNoticeDetail>): SuccessResponsePaginateNoticeDetail => r.body)
    );
  }

  /** Path part for operation `getNoticeDocuments()` */
  static readonly GetNoticeDocumentsPath = '/api/notice/getNoticeDocuments/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getNoticeDocuments()` instead.
   *
   * This method doesn't expect any request body.
   */
  getNoticeDocuments$Response(params: GetNoticeDocuments$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseListDocumentDetail>> {
    return getNoticeDocuments(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getNoticeDocuments$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getNoticeDocuments(params: GetNoticeDocuments$Params, context?: HttpContext): Observable<SuccessResponseListDocumentDetail> {
    return this.getNoticeDocuments$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseListDocumentDetail>): SuccessResponseListDocumentDetail => r.body)
    );
  }

  /** Path part for operation `getNotice()` */
  static readonly GetNoticePath = '/api/notice/getNotice/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getNotice()` instead.
   *
   * This method doesn't expect any request body.
   */
  getNotice$Response(params: GetNotice$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseNoticeDetail>> {
    return getNotice(this.http, this.rootUrl, params, context);
  }

  /**
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

  /** Path part for operation `getDraftedNotice()` */
  static readonly GetDraftedNoticePath = '/api/notice/getDraftedNotice';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getDraftedNotice()` instead.
   *
   * This method doesn't expect any request body.
   */
  getDraftedNotice$Response(params?: GetDraftedNotice$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseNoticeDetail>> {
    return getDraftedNotice(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getDraftedNotice$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getDraftedNotice(params?: GetDraftedNotice$Params, context?: HttpContext): Observable<SuccessResponseNoticeDetail> {
    return this.getDraftedNotice$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseNoticeDetail>): SuccessResponseNoticeDetail => r.body)
    );
  }

  /** Path part for operation `deleteEvent1()` */
  static readonly DeleteEvent1Path = '/api/notice/deleteNotice/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteEvent1()` instead.
   *
   * This method doesn't expect any request body.
   */
  deleteEvent1$Response(params: DeleteEvent1$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
    return deleteEvent1(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteEvent1$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  deleteEvent1(params: DeleteEvent1$Params, context?: HttpContext): Observable<SuccessResponseVoid> {
    return this.deleteEvent1$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseVoid>): SuccessResponseVoid => r.body)
    );
  }

}
