import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { RefDataType } from 'src/app/core/api/models';
import { CommonControllerService, UserControllerService } from 'src/app/core/api/services';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
 

  constructor(
    private userController: UserControllerService,
    private commonController: CommonControllerService,
    ) { }

  fetchMembers(pageIndex: number = 0, pageSize: number = 20) {
    return this.userController.getUsers({ pageIndex: pageIndex, pageSize: pageSize,filter:{}}).pipe(map(d => d.responsePayload));
  }

  fetchRefData() {
    return this.commonController.getReferenceData({ names: [RefDataType.Donation]}).pipe(map(d => d.responsePayload));
  }

  getUserDetail(id: string): any {
    return this.userController.getUserDetails({id:id,idType:"ID"}).pipe(map(d => d.responsePayload));
  }

  getMyDetail(): any {
    return this.userController.getLoggedInUserDetails().pipe(map(d => d.responsePayload));
  }

}

