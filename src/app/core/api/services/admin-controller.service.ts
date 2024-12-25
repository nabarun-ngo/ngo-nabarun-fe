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

import { clearCache } from '../fn/admin-controller/clear-cache';
import { ClearCache$Params } from '../fn/admin-controller/clear-cache';
import { generateApiKey } from '../fn/admin-controller/generate-api-key';
import { GenerateApiKey$Params } from '../fn/admin-controller/generate-api-key';
import { getApiKeyList } from '../fn/admin-controller/get-api-key-list';
import { GetApiKeyList$Params } from '../fn/admin-controller/get-api-key-list';
import { runService } from '../fn/admin-controller/run-service';
import { RunService$Params } from '../fn/admin-controller/run-service';
import { SuccessResponseApiKeyDetail } from '../models/success-response-api-key-detail';
import { SuccessResponseListApiKeyDetail } from '../models/success-response-list-api-key-detail';
import { SuccessResponseVoid } from '../models/success-response-void';
import { updateApiKey } from '../fn/admin-controller/update-api-key';
import { UpdateApiKey$Params } from '../fn/admin-controller/update-api-key';

@Injectable({ providedIn: 'root' })
export class AdminControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `runService()` */
  static readonly RunServicePath = '/api/admin/service/run';

  /**
   * Runs a admin service.
   *
   * <table><thead><tr><th>Trigger Name</th><th>Parameters</th></tr></thead><tbody><tr><td>SYNC_USER</td><td>sync_role - Y/N (Sync roles with auth0)<br>user_id - &lt;user id &gt; (Sync specific user by id)<br>user_email - &lt;user email&gt; (Sync specific user by email)</td></tr></tbody></table>
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `runService()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  runService$Response(params: RunService$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
    return runService(this.http, this.rootUrl, params, context);
  }

  /**
   * Runs a admin service.
   *
   * <table><thead><tr><th>Trigger Name</th><th>Parameters</th></tr></thead><tbody><tr><td>SYNC_USER</td><td>sync_role - Y/N (Sync roles with auth0)<br>user_id - &lt;user id &gt; (Sync specific user by id)<br>user_email - &lt;user email&gt; (Sync specific user by email)</td></tr></tbody></table>
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `runService$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  runService(params: RunService$Params, context?: HttpContext): Observable<SuccessResponseVoid> {
    return this.runService$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseVoid>): SuccessResponseVoid => r.body)
    );
  }

  /** Path part for operation `clearCache()` */
  static readonly ClearCachePath = '/api/admin/clearcache';

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

  /** Path part for operation `updateApiKey()` */
  static readonly UpdateApiKeyPath = '/api/admin/apikey/{id}/update';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `updateApiKey()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateApiKey$Response(params: UpdateApiKey$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseApiKeyDetail>> {
    return updateApiKey(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `updateApiKey$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateApiKey(params: UpdateApiKey$Params, context?: HttpContext): Observable<SuccessResponseApiKeyDetail> {
    return this.updateApiKey$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseApiKeyDetail>): SuccessResponseApiKeyDetail => r.body)
    );
  }

  /** Path part for operation `generateApiKey()` */
  static readonly GenerateApiKeyPath = '/api/admin/apikey/generate';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `generateApiKey()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  generateApiKey$Response(params: GenerateApiKey$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseApiKeyDetail>> {
    return generateApiKey(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `generateApiKey$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  generateApiKey(params: GenerateApiKey$Params, context?: HttpContext): Observable<SuccessResponseApiKeyDetail> {
    return this.generateApiKey$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseApiKeyDetail>): SuccessResponseApiKeyDetail => r.body)
    );
  }

  /** Path part for operation `getApiKeyList()` */
  static readonly GetApiKeyListPath = '/api/admin/apikey/list';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getApiKeyList()` instead.
   *
   * This method doesn't expect any request body.
   */
  getApiKeyList$Response(params?: GetApiKeyList$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseListApiKeyDetail>> {
    return getApiKeyList(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getApiKeyList$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getApiKeyList(params?: GetApiKeyList$Params, context?: HttpContext): Observable<SuccessResponseListApiKeyDetail> {
    return this.getApiKeyList$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseListApiKeyDetail>): SuccessResponseListApiKeyDetail => r.body)
    );
  }

}
