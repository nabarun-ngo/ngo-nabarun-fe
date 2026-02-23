import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { CreateApiKeyDto } from 'src/app/core/api-client/models';
import { ApiKeyControllerService, CronControllerService, JobControllerService, OAuthControllerService, StaticDocsControllerService, WorkflowControllerService } from 'src/app/core/api-client/services';
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
    private cronController: CronControllerService) { }



  getCronJobNames() {
    return this.cronController.getScheduledJobs().pipe(map(m => m.responsePayload));
  }


  /**
   * Get list of API keys
   * @param pageIndex Page index
   * @param pageSize Page size
   * @returns Observable of list of API keys
   */
  getAPIKeyList(pageIndex: number, pageSize: number) {
    return this.apiKeyController.listApiKeys({
      pageIndex: pageIndex,
      pageSize: pageSize
    }).pipe(map(m => m.responsePayload));
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

  getOAuthTokenList(provider: string) {
    return this.oauthController.getTokens({
      provider: provider
    }).pipe(map(m => m.responsePayload));
  }

  getOAuthScopes(provider: string) {
    return this.oauthController.getScopes({
      provider: provider
    }).pipe(map(m => m.responsePayload));
  }

  getOAuthProviders() {
    return this.oauthController.getProviders().pipe(map(m => m.responsePayload));
  }

  clearBgJobs() {
    return this.jobController.cleanOldJobs().pipe(map(m => m.responsePayload));
  }

  getBgJobStatistics() {
    return this.jobController.getQueueStatistics().pipe(map(m => m.responsePayload));
  }


  createOAuthToken(scopes: string[]) {
    return this.oauthController.getAuthUrl({
      provider: 'google',
      scopes: scopes.join(" ")
    }).pipe(map(m => m.responsePayload));
  }

  getAppLinks() {
    return this.staticDocs.getStaticLinks({
      linkType: 'ADMIN_LINKS'
    }).pipe(map(m => m.responsePayload));
  }

  getTasks(status: string, pageIndex: number = AdminDefaultValue.pageNumber, pageSize: number = AdminDefaultValue.pageSize) {
    return this.workflowController.listAutomaticTasks({
      status: status as any,
      pageIndex: pageIndex,
      pageSize: pageSize
    }).pipe(
      map(d => d.responsePayload),
      map(mapPagedWorkflowTaskDtoToPagedTask)
    )
  }

  retryTask(id: string, workflowId: string) {
    return this.workflowController.processTask({ id: workflowId!, taskId: id }).pipe(map(m => m.responsePayload));
  }

  retryJob(id: string) {
    return this.jobController.retryJob({ jobId: id }).pipe(map(m => m.responsePayload));
  }

  removeJob(id: string) {
    return this.jobController.removeJob({ jobId: id }).pipe(map(m => m.responsePayload));
  }


  getBgJobs(status: string, pageIndex: number = AdminDefaultValue.pageNumber, pageSize: number = AdminDefaultValue.pageSize) {
    return this.jobController.getJobs({
      status: status as any,
      pageIndex: pageIndex,
      pageSize: pageSize
    }).pipe(
      map(d => d.responsePayload)
    )
  }

  updateQueueState(state: string) {
    return this.jobController.pauseQueue({
      operation: state as any
    }).pipe(map(m => m.responsePayload));
  }

  revokeOAuthToken(id: string) {
    return this.oauthController.revokeTokens({
      provider: 'google',
      id: id
    }).pipe(map(m => m.responsePayload));
  }

  getCronTriggers() {
    return this.cronController.getTriggerLogs().pipe(map(m => m.responsePayload));
  }

  getCronJobExecutions(name: string, pageIndex: number = AdminDefaultValue.pageNumber, pageSize: number = AdminDefaultValue.pageSize) {
    return this.cronController.getCronLogs({
      name: name,
      pageIndex: pageIndex,
      pageSize: pageSize
    }).pipe(map(m => m.responsePayload));
  }

  triggerCronJob(name: string) {
    return this.cronController.runScheduledJob({ name: name }).pipe(map(m => m.responsePayload));
  }

}
