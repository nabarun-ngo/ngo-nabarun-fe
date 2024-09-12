/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { generateApiKey } from '../fn/admin-controller/generate-api-key';
import { GenerateApiKey$Params } from '../fn/admin-controller/generate-api-key';
import { SuccessResponseMapStringString } from '../models/success-response-map-string-string';
import { SuccessResponseVoid } from '../models/success-response-void';
import { sync } from '../fn/admin-controller/sync';
import { Sync$Params } from '../fn/admin-controller/sync';

@Injectable({ providedIn: 'root' })
export class AdminControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `sync()` */
  static readonly SyncPath = '/api/admin/sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `sync()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync$Response(params: Sync$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
    return sync(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `sync$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  sync(params: Sync$Params, context?: HttpContext): Observable<SuccessResponseVoid> {
    return this.sync$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseVoid>): SuccessResponseVoid => r.body)
    );
  }

  /** Path part for operation `generateApiKey()` */
  static readonly GenerateApiKeyPath = '/api/admin/generateApiKey';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `generateApiKey()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  generateApiKey$Response(params: GenerateApiKey$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseMapStringString>> {
    return generateApiKey(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `generateApiKey$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  generateApiKey(params: GenerateApiKey$Params, context?: HttpContext): Observable<SuccessResponseMapStringString> {
    return this.generateApiKey$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseMapStringString>): SuccessResponseMapStringString => r.body)
    );
  }

}