/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { clearCache } from '../fn/common-controller/clear-cache';
import { ClearCache$Params } from '../fn/common-controller/clear-cache';
import { deleteDocument } from '../fn/common-controller/delete-document';
import { DeleteDocument$Params } from '../fn/common-controller/delete-document';
import { downloadDocument } from '../fn/common-controller/download-document';
import { DownloadDocument$Params } from '../fn/common-controller/download-document';
import { generateAuthorizationUrl } from '../fn/common-controller/generate-authorization-url';
import { GenerateAuthorizationUrl$Params } from '../fn/common-controller/generate-authorization-url';
import { getNotification } from '../fn/common-controller/get-notification';
import { GetNotification$Params } from '../fn/common-controller/get-notification';
import { getReferenceData } from '../fn/common-controller/get-reference-data';
import { GetReferenceData$Params } from '../fn/common-controller/get-reference-data';
import { manageNotification } from '../fn/common-controller/manage-notification';
import { ManageNotification$Params } from '../fn/common-controller/manage-notification';
import { SuccessResponseMapStringListKeyValue } from '../models/success-response-map-string-list-key-value';
import { SuccessResponsePaginateMapStringString } from '../models/success-response-paginate-map-string-string';
import { SuccessResponseString } from '../models/success-response-string';
import { SuccessResponseVoid } from '../models/success-response-void';
import { uploadDocuments } from '../fn/common-controller/upload-documents';
import { UploadDocuments$Params } from '../fn/common-controller/upload-documents';
import { uploadDocuments1 } from '../fn/common-controller/upload-documents-1';
import { UploadDocuments1$Params } from '../fn/common-controller/upload-documents-1';

@Injectable({ providedIn: 'root' })
export class CommonControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `manageNotification()` */
  static readonly ManageNotificationPath = '/api/common/manageNotification';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `manageNotification()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  manageNotification$Response(params: ManageNotification$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
    return manageNotification(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `manageNotification$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  manageNotification(params: ManageNotification$Params, context?: HttpContext): Observable<SuccessResponseVoid> {
    return this.manageNotification$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseVoid>): SuccessResponseVoid => r.body)
    );
  }

  /** Path part for operation `clearCache()` */
  static readonly ClearCachePath = '/api/common/general/clearCache';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `clearCache()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  clearCache$Response(params: ClearCache$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
    return clearCache(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `clearCache$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  clearCache(params: ClearCache$Params, context?: HttpContext): Observable<SuccessResponseVoid> {
    return this.clearCache$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseVoid>): SuccessResponseVoid => r.body)
    );
  }

  /** Path part for operation `uploadDocuments()` */
  static readonly UploadDocumentsPath = '/api/common/document/uploadDocuments';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `uploadDocuments()` instead.
   *
   * This method doesn't expect any request body.
   */
  uploadDocuments$Response(params: UploadDocuments$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
    return uploadDocuments(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `uploadDocuments$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  uploadDocuments(params: UploadDocuments$Params, context?: HttpContext): Observable<SuccessResponseVoid> {
    return this.uploadDocuments$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseVoid>): SuccessResponseVoid => r.body)
    );
  }

  /** Path part for operation `uploadDocuments1()` */
  static readonly UploadDocuments1Path = '/api/common/document/uploadBase64Documents';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `uploadDocuments1()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  uploadDocuments1$Response(params: UploadDocuments1$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
    return uploadDocuments1(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `uploadDocuments1$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  uploadDocuments1(params: UploadDocuments1$Params, context?: HttpContext): Observable<SuccessResponseVoid> {
    return this.uploadDocuments1$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseVoid>): SuccessResponseVoid => r.body)
    );
  }

  /** Path part for operation `generateAuthorizationUrl()` */
  static readonly GenerateAuthorizationUrlPath = '/api/common/authorization/createAuthorizationUrl';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `generateAuthorizationUrl()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  generateAuthorizationUrl$Response(params: GenerateAuthorizationUrl$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseString>> {
    return generateAuthorizationUrl(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `generateAuthorizationUrl$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  generateAuthorizationUrl(params: GenerateAuthorizationUrl$Params, context?: HttpContext): Observable<SuccessResponseString> {
    return this.generateAuthorizationUrl$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseString>): SuccessResponseString => r.body)
    );
  }

  /** Path part for operation `getReferenceData()` */
  static readonly GetReferenceDataPath = '/api/common/getReferenceData';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getReferenceData()` instead.
   *
   * This method doesn't expect any request body.
   */
  getReferenceData$Response(params?: GetReferenceData$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseMapStringListKeyValue>> {
    return getReferenceData(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getReferenceData$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getReferenceData(params?: GetReferenceData$Params, context?: HttpContext): Observable<SuccessResponseMapStringListKeyValue> {
    return this.getReferenceData$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseMapStringListKeyValue>): SuccessResponseMapStringListKeyValue => r.body)
    );
  }

  /** Path part for operation `getNotification()` */
  static readonly GetNotificationPath = '/api/common/getNotifications';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getNotification()` instead.
   *
   * This method doesn't expect any request body.
   */
  getNotification$Response(params?: GetNotification$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateMapStringString>> {
    return getNotification(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getNotification$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getNotification(params?: GetNotification$Params, context?: HttpContext): Observable<SuccessResponsePaginateMapStringString> {
    return this.getNotification$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponsePaginateMapStringString>): SuccessResponsePaginateMapStringString => r.body)
    );
  }

  /** Path part for operation `downloadDocument()` */
  static readonly DownloadDocumentPath = '/api/common/document/downloadDocument/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `downloadDocument()` instead.
   *
   * This method doesn't expect any request body.
   */
  downloadDocument$Response(params: DownloadDocument$Params, context?: HttpContext): Observable<StrictHttpResponse<{
}>> {
    return downloadDocument(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `downloadDocument$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  downloadDocument(params: DownloadDocument$Params, context?: HttpContext): Observable<{
}> {
    return this.downloadDocument$Response(params, context).pipe(
      map((r: StrictHttpResponse<{
}>): {
} => r.body)
    );
  }

  /** Path part for operation `deleteDocument()` */
  static readonly DeleteDocumentPath = '/api/common/document/deleteDocument/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `deleteDocument()` instead.
   *
   * This method doesn't expect any request body.
   */
  deleteDocument$Response(params: DeleteDocument$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
    return deleteDocument(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `deleteDocument$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  deleteDocument(params: DeleteDocument$Params, context?: HttpContext): Observable<SuccessResponseVoid> {
    return this.deleteDocument$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseVoid>): SuccessResponseVoid => r.body)
    );
  }

}
