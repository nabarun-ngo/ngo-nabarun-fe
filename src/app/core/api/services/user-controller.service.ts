/* tslint:disable */
/* eslint-disable */
import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { assignUsersToRoles } from '../fn/user-controller/assign-users-to-roles';
import { AssignUsersToRoles$Params } from '../fn/user-controller/assign-users-to-roles';
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
import { SuccessResponsePaginateUserDetail } from '../models/success-response-paginate-user-detail';
import { SuccessResponseString } from '../models/success-response-string';
import { SuccessResponseUserDetail } from '../models/success-response-user-detail';
import { SuccessResponseVoid } from '../models/success-response-void';
import { updateLoggedInUserDetails } from '../fn/user-controller/update-logged-in-user-details';
import { UpdateLoggedInUserDetails$Params } from '../fn/user-controller/update-logged-in-user-details';
import { updateUserDetails } from '../fn/user-controller/update-user-details';
import { UpdateUserDetails$Params } from '../fn/user-controller/update-user-details';

@Injectable({ providedIn: 'root' })
export class UserControllerService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `updateUserDetails()` */
  static readonly UpdateUserDetailsPath = '/api/user/updateUserDetails/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `updateUserDetails()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateUserDetails$Response(params: UpdateUserDetails$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseUserDetail>> {
    return updateUserDetails(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `updateUserDetails$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  updateUserDetails(params: UpdateUserDetails$Params, context?: HttpContext): Observable<SuccessResponseUserDetail> {
    return this.updateUserDetails$Response(params, context).pipe(
      map((r: StrictHttpResponse<SuccessResponseUserDetail>): SuccessResponseUserDetail => r.body)
    );
  }

  /** Path part for operation `assignUsersToRoles()` */
  static readonly AssignUsersToRolesPath = '/api/user/assignUsersToRoles/{id}';

  /**
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `assignUsersToRoles()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  assignUsersToRoles$Response(params: AssignUsersToRoles$Params, context?: HttpContext): Observable<StrictHttpResponse<SuccessResponseVoid>> {
    return assignUsersToRoles(this.http, this.rootUrl, params, context);
  }

  /**
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `assignUsersToRoles$Response()` instead.
   *
   * This method sends `application/json` and handles request body of type `application/json`.
   */
  assignUsersToRoles(params: AssignUsersToRoles$Params, context?: HttpContext): Observable<SuccessResponseVoid> {
    return this.assignUsersToRoles$Response(params, context).pipe(
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
