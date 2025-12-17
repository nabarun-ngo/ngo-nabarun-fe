import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { CreateApiKeyDto } from 'src/app/core/api-client/models';
import { ApiKeyControllerService, JobControllerService, OAuthControllerService } from 'src/app/core/api-client/services';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(
    private oauthController: OAuthControllerService,
    private jobController: JobControllerService,
    private apiKeyController: ApiKeyControllerService,
    private httpClient: HttpClient) { }

  // clearCache(names: string[]) {
  //   return this.jobController.clearCache({ body: names });
  // }

  // syncUser(syncRole: string, user: { userId?: string, userEmail?: string }) {
  //   return this.adminController.runService({
  //     body: {
  //       name: 'SYNC_USERS',
  //       parameters: {
  //         sync_role: syncRole,
  //         user_id: user.userId!,
  //         user_email: user.userEmail!
  //       }
  //     }
  //   });
  // }

  getAPIKeyList() {
    return this.apiKeyController.listApiKeys().pipe(map(m => m.responsePayload));
  }

  getEndpointList() {
    var url = `${environment.api_base_url}/api/actuator/mappings`
    return this.httpClient.get(url).pipe(map((m: any) => m.contexts.Nabarun.mappings.dispatcherServlets.dispatcherServlet))
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

}
