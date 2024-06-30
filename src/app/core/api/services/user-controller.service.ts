/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { assignRolesToUsers } from '../fn/user-controller/assign-roles-to-users';
import { AssignRolesToUsers$Params } from '../fn/user-controller/assign-roles-to-users';
import { changeEmail } from '../fn/user-controller/change-email';
import { ChangeEmail$Params } from '../fn/user-controller/change-email';
import { getLoggedInUserDetails } from '../fn/user-controller/get-logged-in-user-details';
import { GetLoggedInUserDetails$Params } from '../fn/user-controller/get-logged-in-user-details';
import { getUserDetails } from '../fn/user-controller/get-user-details';
import { GetUserDetails$Params } from '../fn/user-controller/get-user-details';
import { getUserFullDetails } from '../fn/user-controller/get-user-full-details';
import { GetUserFullDetails$Params } from '../fn/user-controller/get-user-full-details';
import { getUserRoleHistory } from '../fn/user-controller/get-user-role-history';
import { GetUserRoleHistory$Params } from '../fn/user-controller/get-user-role-history';
import { getUsers } from '../fn/user-controller/get-users';
import { GetUsers$Params } from '../fn/user-controller/get-users';
import { initiatePasswordChange } from '../fn/user-controller/initiate-password-change';
import { InitiatePasswordChange$Params } from '../fn/user-controller/initiate-password-change';
import { SuccessResponsePaginateUserDetail } from '../models/success-response-paginate-user-detail';
import { SuccessResponseString } from '../models/success-response-string';
import { SuccessResponseUserDetail } from '../models/success-response-user-detail';
import { SuccessResponseVoid } from '../models/success-response-void';
import { sync } from '../fn/user-controller/sync';
import { Sync$Params } from '../fn/user-controller/sync';
import { updateLoggedInUserDetails } from '../fn/user-controller/update-logged-in-user-details';
import { UpdateLoggedInUserDetails$Params } from '../fn/user-controller/update-logged-in-user-details';

@Injectable({ providedIn: 'root' })
export class UserControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `initiatePasswordChange()` */
  static readonly InitiatePasswordChangePath = '/api/user/initiatePasswordChange';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `initiatePasswordChange()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  initiatePasswordChange$Response(params: InitiatePasswordChange$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
    return initiatePasswordChange(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `initiatePasswordChange$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  initiatePasswordChange(params: InitiatePasswordChange$Params, context?: HttpContext): Observable<SuccessResponseVoid> {
    return this.initiatePasswordChange$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseVoid>): SuccessResponseVoid => r.body)
    );
  }

  /** Path part for operation `changeEmail()` */
  static readonly ChangeEmailPath = '/api/user/changeEmail';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `changeEmail()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  changeEmail$Response(params: ChangeEmail$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
    return changeEmail(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `changeEmail$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  changeEmail(params: ChangeEmail$Params, context?: HttpContext): Observable<SuccessResponseVoid> {
    return this.changeEmail$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseVoid>): SuccessResponseVoid => r.body)
    );
  }

  /** Path part for operation `assignRolesToUsers()` */
  static readonly AssignRolesToUsersPath = '/api/user/assignRolesToUsers/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `assignRolesToUsers()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  assignRolesToUsers$Response(params: AssignRolesToUsers$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
    return assignRolesToUsers(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `assignRolesToUsers$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  assignRolesToUsers(params: AssignRolesToUsers$Params, context?: HttpContext): Observable<SuccessResponseVoid> {
    return this.assignRolesToUsers$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseVoid>): SuccessResponseVoid => r.body)
    );
  }

  /** Path part for operation `updateLoggedInUserDetails()` */
  static readonly UpdateLoggedInUserDetailsPath = '/api/user/updateLoggedInUserDetails';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `updateLoggedInUserDetails()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateLoggedInUserDetails$Response(params: UpdateLoggedInUserDetails$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseUserDetail>> {
    return updateLoggedInUserDetails(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `updateLoggedInUserDetails$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateLoggedInUserDetails(params: UpdateLoggedInUserDetails$Params, context?: HttpContext): Observable<SuccessResponseUserDetail> {
    return this.updateLoggedInUserDetails$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseUserDetail>): SuccessResponseUserDetail => r.body)
    );
  }

  /** Path part for operation `sync()` */
  static readonly SyncPath = '/api/user/sync';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `sync()` instead.
   *
   * This method doesn't expect any request body.
   */
  sync$Response(params?: Sync$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
    return sync(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `sync$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  sync(params?: Sync$Params, context?: HttpContext): Observable<SuccessResponseVoid> {
    return this.sync$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseVoid>): SuccessResponseVoid => r.body)
    );
  }

  /** Path part for operation `getUsers()` */
  static readonly GetUsersPath = '/api/user/getUsers';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getUsers()` instead.
   *
   * This method doesn't expect any request body.
   */
  getUsers$Response(params: GetUsers$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponsePaginateUserDetail>> {
    return getUsers(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getUsers$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getUsers(params: GetUsers$Params, context?: HttpContext): Observable<SuccessResponsePaginateUserDetail> {
    return this.getUsers$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponsePaginateUserDetail>): SuccessResponsePaginateUserDetail => r.body)
    );
  }

  /** Path part for operation `getUserRoleHistory()` */
  static readonly GetUserRoleHistoryPath = '/api/user/getUserRoleHistory/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getUserRoleHistory()` instead.
   *
   * This method doesn't expect any request body.
   */
  getUserRoleHistory$Response(params: GetUserRoleHistory$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseString>> {
    return getUserRoleHistory(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getUserRoleHistory$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getUserRoleHistory(params: GetUserRoleHistory$Params, context?: HttpContext): Observable<SuccessResponseString> {
    return this.getUserRoleHistory$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseString>): SuccessResponseString => r.body)
    );
  }

  /** Path part for operation `getUserFullDetails()` */
  static readonly GetUserFullDetailsPath = '/api/user/getUserFullDetails/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getUserFullDetails()` instead.
   *
   * This method doesn't expect any request body.
   */
  getUserFullDetails$Response(params: GetUserFullDetails$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseUserDetail>> {
    return getUserFullDetails(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getUserFullDetails$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getUserFullDetails(params: GetUserFullDetails$Params, context?: HttpContext): Observable<SuccessResponseUserDetail> {
    return this.getUserFullDetails$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseUserDetail>): SuccessResponseUserDetail => r.body)
    );
  }

  /** Path part for operation `getUserDetails()` */
  static readonly GetUserDetailsPath = '/api/user/getUserDetails/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getUserDetails()` instead.
   *
   * This method doesn't expect any request body.
   */
  getUserDetails$Response(params: GetUserDetails$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseUserDetail>> {
    return getUserDetails(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getUserDetails$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getUserDetails(params: GetUserDetails$Params, context?: HttpContext): Observable<SuccessResponseUserDetail> {
    return this.getUserDetails$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseUserDetail>): SuccessResponseUserDetail => r.body)
    );
  }

  /** Path part for operation `getLoggedInUserDetails()` */
  static readonly GetLoggedInUserDetailsPath = '/api/user/getLoggedInUserDetails';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getLoggedInUserDetails()` instead.
   *
   * This method doesn't expect any request body.
   */
  getLoggedInUserDetails$Response(params?: GetLoggedInUserDetails$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseUserDetail>> {
    return getLoggedInUserDetails(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getLoggedInUserDetails$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getLoggedInUserDetails(params?: GetLoggedInUserDetails$Params, context?: HttpContext): Observable<SuccessResponseUserDetail> {
    return this.getLoggedInUserDetails$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseUserDetail>): SuccessResponseUserDetail => r.body)
    );
  }

}
