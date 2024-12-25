import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ApiKeyDetail } from 'src/app/core/api/models';
import { AdminControllerService } from 'src/app/core/api/services';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  
  constructor(private adminController: AdminControllerService,private httpClient:HttpClient) { }

  clearCache(names: string[]) {
    return this.adminController.clearCache({ body: names });
  }

  syncUser(syncRole:string,user:{userId?:string,userEmail?:string}) {
    return this.adminController.runService({
      body: {
        name: 'SYNC_USERS',
        parameters:{
          sync_role:syncRole,
          user_id:user.userId!,
          user_email:user.userEmail!
        }
      }
    });
  }

  getAPIKeyList() {
    return this.adminController.getApiKeyList().pipe(map(m=>m.responsePayload));
  }

  getEndpointList(){
    var url= `${environment.api_base_url}/api/actuator/mappings`
    return this.httpClient.get(url).pipe(map((m:any)=>m.contexts.Nabarun.mappings.dispatcherServlets.dispatcherServlet))
  }

  createAPIKey(body: ApiKeyDetail) {
    if(body.expiryDate){
      body.expireable=true
    }
    return this.adminController.generateApiKey({body:body}).pipe(map(m=>m.responsePayload));
  }

  updateAPIKeyDetail(id: string, value: ApiKeyDetail) {
    return this.adminController.updateApiKey({id:id,body:value}).pipe(map(m=>m.responsePayload));
  }

  revokeAPIKey(id: string) {
    return this.adminController.updateApiKey({id:id,body:{},revoke:true}).pipe(map(m=>m.responsePayload));
  }

}
