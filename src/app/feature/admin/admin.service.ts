import { Injectable } from '@angular/core';
import { AdminControllerService } from 'src/app/core/api/services';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private adminController: AdminControllerService) { }

  clearCache(names: string[]) {
    return this.adminController.clearCache({ body: names });
  }

  syncUser(syncRole:string,user:{userId?:string,userEmail?:string}) {
    return this.adminController.runService({
      body: {
        triggerName: 'SYNC_USERS',
        parameters:{
          sync_role:syncRole,
          user_id:user.userId!,
          user_email:user.userEmail!
        }
      }
    });
  }
}
