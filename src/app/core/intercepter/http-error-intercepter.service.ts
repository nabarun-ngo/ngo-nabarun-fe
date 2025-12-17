import { HttpErrorResponse, HttpHandler, HttpHeaderResponse, HttpHeaders, HttpInterceptor, HttpProgressEvent, HttpRequest, HttpResponse, HttpSentEvent, HttpStatusCode, HttpUserEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, switchMap, tap } from 'rxjs/operators';
import { ModalService } from '../service/modal.service';
import { isEmpty } from '../service/utilities.service';
import { environment } from 'src/environments/environment';
import * as uuid from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorIntercepterService implements HttpInterceptor {



  constructor(
    private modalService: ModalService,
  ) { }



  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
    ////console.log(request.url,environment.api_base_url)
    if (request.url.includes(environment.api_base_url)) {
      request = request.clone({
        setHeaders: {
          'Correlation-Id': uuid.v4()
        }
      })
    }

    if (request.url.includes(environment.api_base_url2)) {
      request = request.clone({
        setHeaders: {
          'Correlation-Id': uuid.v4()
        }
      })
    }

    ////console.log(request.headers.get('Correlation-Id'))

    var showError = request.headers.get('hideError') == null ? true : false;
    var corrId = request.headers.get('Correlation-Id')!;
    //request.headers
    return next.handle(request)
      .pipe(
        retry(0),
        tap(event => {
          if (event instanceof HttpResponse) {
            ////console.log(event);
            if (event.body && !isEmpty(event.body.messages) && isEmpty(event.body.error)) {
              ////console.log(event);
              this.showInformationMessage(event);
            }
          }
        }),
        catchError((error) => {
          if (showError) {
            if (error instanceof HttpErrorResponse) {
              this.showErrorResponse(error, corrId);
            } else if (error.error instanceof ErrorEvent) {
              this.showErrorResponse(error, corrId);
            }
          }
          return throwError(error);
        })
      )
  }

  private showErrorResponse(errorResponse: any, corrId = 'NA') {
    //console.log(errorResponse);
    let message: string;
    let heading: string = 'Error';
    if (errorResponse.status === HttpStatusCode.Forbidden /*&& !errorResponse.url.includes(environment.tokenEndpoint)*/) {
      message = 'Sorry!! You do not have permission to execute this task.';
    }
    else if (isEmpty(errorResponse.error)) {
      message = errorResponse.message;
    }
    else if (!isEmpty(errorResponse.error.messages)) {
      message = new Array(errorResponse.error.messages).toString();
      heading = errorResponse.error.info;
    } else if (!isEmpty(errorResponse.error.message)) {
      message = errorResponse.error.message;
      heading = errorResponse.error.info;
    } else if (!isEmpty(errorResponse.error.error_description)) {
      message = errorResponse.error.error_description;
    }
    else {
      message = 'Something went wrong.';
    }
    /*else if(!HelperService.isEmpty(errorResponse.error.errors)){
      var msgs = new Array(); 
      for (var errorObj of  errorResponse.error.errors) {
        msgs.push(errorObj.defaultMessage);
      }
      message=msgs.toString();
    }*/
    /*else if(!HelperService.isEmpty(errorResponse.error.errors)){
      var msgs = new Array(); 
      for (var errorObj of  errorResponse.error.errors) {
        msgs.push(errorObj.defaultMessage);
      }
      message=msgs.toString();
    }else if(!HelperService.isEmpty(errorResponse.error.messages)){
      message=new Array(errorResponse.error.messages).toString();
    }else if(!HelperService.isEmpty(errorResponse.error.message)){
      message=errorResponse.error.message;
    }else if(!HelperService.isEmpty(errorResponse.error.error_description)){
      message=errorResponse.error.error_description;
    }*/

    let moreDetails = null;
    if (errorResponse.error != null && !isEmpty(errorResponse.error.details)) {
      moreDetails = new Array(errorResponse.error.details, 'Ref Id : ' + corrId).toString()
    }


    this.modalService.openNotificationModal({ title: heading, description: message }, 'notification', 'error', { okayButtonText: 'Close', moreDetails: moreDetails });
  }

  private showInformationMessage(response: HttpResponse<any>) {
    let message: string;
    if (!isEmpty(response.body.messages)) {
      message = new Array(response.body.messages).toString();
      this.modalService.openNotificationModal({ title: (response.body.info || 'Info'), description: message }, 'notification', 'info', { okayButtonText: 'Okay' });
    }

  }




}

