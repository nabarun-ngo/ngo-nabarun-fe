import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { CreateApiKeyDto } from 'src/app/core/api-client/models';
import { ApiKeyControllerService, JobControllerService, OAuthControllerService, StaticDocsControllerService, WorkflowControllerService } from 'src/app/core/api-client/services';
import { environment } from 'src/environments/environment';
import { AdminDefaultValue } from './admin.const';
import { mapPagedWorkflowTaskDtoToPagedTask } from '../workflow/model/workflow.mapper';

@Injectable({
  providedIn: 'root'
})
export class AdminService {


  constructor(
    private oauthController: OAuthControllerService,
    private staticDocs: StaticDocsControllerService,
    private jobController: JobControllerService,
    private apiKeyController: ApiKeyControllerService,
    private workflowController: WorkflowControllerService,

    private httpClient: HttpClient) { }

  getAPIKeyList() {
    return this.apiKeyController.listApiKeys().pipe(map(m => m.responsePayload));
  }

  createAPIKey(body: CreateApiKeyDto) {
    return this.apiKeyController.generateApiKey({ body: body }).pipe(map(m => m.responsePayload));
  }

  updateAPIKeyDetail(id: string, value: string[]) {
    return this.apiKeyController.updateApiKeyPermissions({ id: id, body: value }).pipe(map(m => m.responsePayload));
  }

  revokeAPIKey(id: string) {
    return this.apiKeyController.revokeApiKey({ id: id }).pipe(map(m => m.responsePayload));
  }

  getAPIScopeList() {
    return this.apiKeyController.listApiScopes().pipe(map(m => m.responsePayload));
  }

  getOAuthTokenList() {
    return this.oauthController.getGoogleTokens().pipe(map(m => m.responsePayload));
  }

  getOAuthScopes() {
    return this.oauthController.getGoogleScopes().pipe(map(m => m.responsePayload));
  }


  createOAuthToken(scopes: string[]) {
    return this.oauthController.getGmailAuthUrl({ scopes: scopes.join(" ") }).pipe(map(m => m.responsePayload));
  }

  getAppLinks() {
    return this.staticDocs.getStaticLinks({
      linkType: 'ADMIN_LINKS'
    }).pipe(map(m => m.responsePayload));
  }

  getFailedTasks(pageIndex: number = AdminDefaultValue.pageNumber, pageSize: number = AdminDefaultValue.pageSize) {
    return this.workflowController.listAutomaticTasks({
      page: pageIndex,
      size: pageSize
    }).pipe(
      map(d => d.responsePayload),
      map(mapPagedWorkflowTaskDtoToPagedTask)
    )
  }

  retryTask(id: string, workflowId: string) {
    return this.workflowController.processTask({ id: workflowId!, taskId: id }).pipe(map(m => m.responsePayload));
  }
}
